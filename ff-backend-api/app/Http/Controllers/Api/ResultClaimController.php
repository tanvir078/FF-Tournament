<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\ResultClaim;
use App\Models\ResultClaimReward;
use App\Models\Team;
use App\Models\TeamMembership;
use App\Models\TournamentRegistration;
use App\Models\Transaction;
use App\Models\User;
use App\Services\WalletService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ResultClaimController extends Controller
{
    public function __construct(private WalletService $wallets, private NotificationService $notifications) {}

    public function mine(Request $request)
    {
        return response()->json(ResultClaim::with(['match', 'tournament', 'rewards.user'])->where('submittedById', $request->user()->id)->latest()->get());
    }

    public function managed(Request $request)
    {
        $query = ResultClaim::with(['match', 'tournament', 'submitter', 'rewards.user'])->latest();
        if ($request->tournamentId) $query->where('tournamentId', $request->tournamentId);
        if ($request->user()->role === User::ROLE_ORGANIZER) {
            $query->whereHas('tournament', fn ($q) => $q->where('organizerId', $request->user()->id));
        }
        if ($request->status) $query->where('status', $request->status);
        return response()->json($query->get());
    }

    public function store(Request $request, $matchId)
    {
        $data = $request->validate([
            'proofs' => 'required|array|min:1', 'proofs.*' => 'image|max:5120',
            'evidenceUrl' => 'nullable|url|max:2048',
        ]);
        $match = MatchModel::with('tournament.game')->findOrFail($matchId);
        $payload = $this->validatedResultPayload($request, $match->tournament);
        $registration = TournamentRegistration::with(['lineup.members.user', 'lineup.team'])->where('tournamentId', $match->tournamentId)->where('userId', $request->user()->id)->where('status', TournamentRegistration::STATUS_APPROVED)->firstOrFail();
        if (ResultClaim::where('matchId', $match->id)->where('submittedById', $request->user()->id)->exists()) {
            throw ValidationException::withMessages(['claim' => 'You already submitted a result claim for this match.']);
        }
        $team = $match->tournament->format === 'SOLO' ? null : ($registration->lineup?->team
            ?? Team::where('captainId', $request->user()->id)->when($match->tournament->gameId, fn ($query) => $query->where('gameId', $match->tournament->gameId))->firstOrFail());
        if ($team && ResultClaim::where('matchId', $match->id)->where('teamId', $team->id)->exists()) {
            throw ValidationException::withMessages(['claim' => 'Your team already submitted a result claim for this match.']);
        }
        if ($team && $team->captainId !== $request->user()->id) {
            throw ValidationException::withMessages(['team' => 'Only the selected line-up captain can submit this claim.']);
        }
        $users = $registration->lineup
            ? $registration->lineup->members->pluck('user')->filter()
            : ($team
            ? collect([$request->user()])->merge(TeamMembership::with('user')->where('teamId', $team->id)->where('status', TeamMembership::STATUS_ACCEPTED)->get()->pluck('user'))
            : collect([$request->user()]));
        $paths = collect($request->file('proofs'))->map(fn ($proof) => $proof->store('result-claims', 'public'))->all();
        $suggestedTotal = $this->suggestedReward($match->tournament, (int) $payload['placement'], (int) $payload['kills']);

        $claim = DB::transaction(function () use ($request, $match, $team, $data, $payload, $paths, $users, $suggestedTotal) {
            $claim = ResultClaim::create([
                'matchId' => $match->id, 'tournamentId' => $match->tournamentId, 'submittedById' => $request->user()->id,
                'teamId' => $team?->id, 'status' => ResultClaim::STATUS_PENDING, 'placement' => $payload['placement'],
                'kills' => $payload['kills'], 'resultPayload' => $payload['resultPayload'],
                'proofPaths' => $paths, 'evidenceUrl' => $data['evidenceUrl'] ?? null,
            ]);
            $share = $users->count() ? round($suggestedTotal / $users->count(), 2) : 0;
            foreach ($users as $user) ResultClaimReward::create(['claimId' => $claim->id, 'userId' => $user->id, 'suggestedAmount' => $share]);
            return $claim;
        });
        return response()->json($claim->load('rewards.user'), 201);
    }

    public function review(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([ResultClaim::STATUS_APPROVED, ResultClaim::STATUS_REJECTED])],
            'adminNote' => 'nullable|string', 'rewards' => 'nullable|array',
            'rewards.*.userId' => 'required_with:rewards|uuid', 'rewards.*.amount' => 'required_with:rewards|numeric|min:0',
        ]);
        return DB::transaction(function () use ($request, $id, $data) {
            $claim = ResultClaim::with(['tournament', 'rewards'])->whereKey($id)->lockForUpdate()->firstOrFail();
            abort_unless($request->user()->role === User::ROLE_ADMIN || $claim->tournament->organizerId === $request->user()->id, 403);
            if ($claim->status !== ResultClaim::STATUS_PENDING) return response()->json($claim->load('rewards.user'));
            $overrides = collect($data['rewards'] ?? [])->keyBy('userId');
            if ($data['status'] === ResultClaim::STATUS_APPROVED) {
                foreach ($claim->rewards as $reward) {
                    $amount = (float) ($overrides[$reward->userId]['amount'] ?? $reward->suggestedAmount);
                    $transaction = $this->wallets->credit($reward->userId, $amount, Transaction::TYPE_PRIZE, 'claim:'.$claim->id.':user:'.$reward->userId, 'Tournament prize reward');
                    $reward->update(['approvedAmount' => $amount, 'transactionId' => $transaction->id]);
                    $this->notifications->send(
                        $reward->userId,
                        'REWARD_CREDITED',
                        'Tournament reward credited',
                        'Your tournament reward has been added to your wallet.',
                        ['tournamentId' => $claim->tournamentId, 'claimId' => $claim->id, 'amount' => $amount],
                        'claim-reward:'.$claim->id.':user:'.$reward->userId,
                    );
                }
            }
            $claim->update(['status' => $data['status'], 'adminNote' => $data['adminNote'] ?? null, 'reviewedById' => $request->user()->id, 'reviewedAt' => now()]);
            if ($data['status'] === ResultClaim::STATUS_REJECTED) {
                $this->notifications->send(
                    $claim->submittedById,
                    'RESULT_REJECTED',
                    'Result claim needs attention',
                    'Your tournament result claim was rejected. Review the note and contact support if needed.',
                    ['tournamentId' => $claim->tournamentId, 'claimId' => $claim->id],
                    'claim-rejected:'.$claim->id,
                );
            }
            return response()->json($claim->fresh()->load('rewards.user'));
        });
    }

    private function suggestedReward($tournament, int $placement, int $kills): float
    {
        $placementReward = (float) (($tournament->prizeDistribution ?? [])[(string) $placement] ?? 0);
        return $placementReward + ((float) $tournament->perKillReward * $kills);
    }

    private function validatedResultPayload(Request $request, $tournament): array
    {
        $type = $tournament->scoringConfig['type'] ?? $tournament->game?->scoringPreset['type'] ?? 'PLACEMENT_KILLS';
        if ($type === 'SCORELINE') {
            $data = $request->validate([
                'homeScore' => 'required|integer|min:0',
                'awayScore' => 'required|integer|min:0',
            ]);
            if ((int) $data['homeScore'] === (int) $data['awayScore']) {
                throw ValidationException::withMessages(['scoreline' => 'A winner is required; tied scorelines cannot be submitted.']);
            }
            return ['placement' => 1, 'kills' => 0, 'resultPayload' => ['type' => $type, ...$data, 'winner' => (int) $data['homeScore'] > (int) $data['awayScore'] ? 'HOME' : 'AWAY']];
        }
        if ($type === 'SERIES_WINNER') {
            $data = $request->validate([
                'winner' => 'required|string|max:255',
                'seriesScore' => 'nullable|string|max:50',
            ]);
            return ['placement' => 1, 'kills' => 0, 'resultPayload' => ['type' => $type, ...$data]];
        }
        $data = $request->validate(['placement' => 'required|integer|min:1', 'kills' => 'required|integer|min:0']);
        return ['placement' => (int) $data['placement'], 'kills' => (int) $data['kills'], 'resultPayload' => ['type' => 'PLACEMENT_KILLS', ...$data]];
    }
}
