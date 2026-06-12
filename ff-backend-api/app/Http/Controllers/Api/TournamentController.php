<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\TeamMembership;
use App\Models\Game;
use App\Models\GameMode;
use App\Models\Tournament;
use App\Models\TournamentLineup;
use App\Models\TournamentLineupMember;
use App\Models\TournamentRegistration;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\UserGameProfile;
use App\Models\MatchModel;
use App\Services\WalletService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TournamentController extends Controller
{
    public function __construct(private WalletService $wallets, private NotificationService $notifications) {}

    public function featured()
    {
        return response()->json(
            Tournament::where('isFeatured', true)
                ->where('status', Tournament::STATUS_REGISTRATION_OPEN)
                ->with(['organizer', 'game', 'gameMode'])
                ->latest()
                ->get()
                ->map(fn (Tournament $tournament) => $this->publicTournament($tournament))
        );
    }

    public function myRegistrations(Request $request)
    {
        return response()->json(
            TournamentRegistration::with(['tournament.game', 'tournament.gameMode', 'lineup.members.user'])
                ->where(fn ($q) => $q->where('userId', $request->user()->id)
                    ->orWhereHas('lineup.members', fn ($members) => $members->where('userId', $request->user()->id)))
                ->orderByDesc('createdAt')
                ->get()
                ->map(fn (TournamentRegistration $registration) => [
                    ...$this->publicTournament($registration->tournament),
                    'name' => $registration->tournament->title,
                    'registrationStatus' => $registration->status,
                    'checkInStatus' => $registration->checkInStatus,
                    'registeredAt' => $registration->createdAt,
                    'roomDetails' => $registration->status === TournamentRegistration::STATUS_APPROVED
                        && (!$registration->tournament->checkInEnabled || $registration->checkInStatus === 'CHECKED_IN')
                        ? $registration->tournament->roomDetails
                        : null,
                ])
        );
    }

    public function index(Request $request)
    {
        $query = Tournament::with(['organizer', 'game', 'gameMode']);
        if ($request->search) $query->where('title', 'like', '%'.$request->search.'%');
        if ($request->status) $query->where('status', $request->status);
        if ($request->format) $query->where('format', $request->format);
        if ($request->gameId) $query->where('gameId', $request->gameId);

        return response()->json($query->latest()->get()->map(fn (Tournament $tournament) => [
            ...$this->publicTournament($tournament),
            'name' => $tournament->title,
            'stage' => $tournament->currentStage,
        ]));
    }

    public function managed(Request $request)
    {
        $query = Tournament::with(['organizer', 'game', 'gameMode'])->latest();
        if ($request->user()->role === User::ROLE_ORGANIZER) $query->where('organizerId', $request->user()->id);
        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $tournament = Tournament::with(['organizer', 'game', 'gameMode'])->findOrFail($id);
        $registration = TournamentRegistration::where('tournamentId', $id)
            ->where('userId', $request->user()->id)
            ->first();
        $canManage = $this->canManage($request, $tournament);

        return response()->json([
            ...$this->publicTournament($tournament),
            'participants' => $this->publicParticipants($tournament),
            'roomDetails' => $canManage || ($registration?->status === TournamentRegistration::STATUS_APPROVED && (!$tournament->checkInEnabled || $registration?->checkInStatus === 'CHECKED_IN'))
                ? $tournament->roomDetails
                : null,
        ]);
    }

    public function bracket(Request $request, $id)
    {
        $tournament = Tournament::with(['organizer', 'game', 'gameMode'])->findOrFail($id);
        $matches = MatchModel::where('tournamentId', $id)
            ->orderBy('matchNumber')
            ->get()
            ->map(fn (MatchModel $match) => $this->publicMatchForBracket($request, $match));

        return response()->json([
            'tournament' => [
                ...$this->publicTournament($tournament),
                'participants' => $this->publicParticipants($tournament),
            ],
            'participants' => $this->publicParticipants($tournament),
            'matches' => $matches,
            'stages' => $matches->pluck('stage')->filter()->unique()->values(),
            'generated' => $matches->isNotEmpty(),
        ]);
    }

    public function registrationStatus(Request $request, $id)
    {
        $registration = TournamentRegistration::where('tournamentId', $id)
            ->where('userId', $request->user()->id)
            ->first();

        return response()->json(['isRegistered' => (bool) $registration, 'registration' => $registration]);
    }

    public function registrations(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $this->authorizeManager($request, $tournament);

        return response()->json(
            TournamentRegistration::with(['user', 'gameProfile.game', 'lineup.team.game', 'lineup.members.user', 'lineup.members.profile'])
                ->where('tournamentId', $id)
                ->orderByDesc('createdAt')
                ->get()
        );
    }

    public function lineups(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $this->authorizeManager($request, $tournament);

        return response()->json(
            TournamentLineup::with(['team.game', 'registration.user', 'members.user', 'members.profile'])
                ->whereHas('registration', fn ($query) => $query->where('tournamentId', $id))
                ->latest()
                ->get()
        );
    }

    public function managedRegistrations(Request $request)
    {
        $query = TournamentRegistration::with(['user', 'tournament'])->orderByDesc('createdAt');
        if ($request->user()->role === User::ROLE_ORGANIZER) {
            $query->whereHas('tournament', fn ($q) => $q->where('organizerId', $request->user()->id));
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $this->validatedTournament($request);
        $this->validateCatalogSelection($data);
        $data['organizerId'] = $request->user()->id;
        $data['isFree'] = ((float) ($data['entryFee'] ?? 0)) <= 0;
        $data['status'] ??= Tournament::STATUS_DRAFT;

        return response()->json(Tournament::create($data)->load('organizer'), 201);
    }

    public function update(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $this->authorizeManager($request, $tournament);
        $data = $this->validatedTournament($request, true);
        $this->validateCatalogSelection($data, $tournament);
        if (array_key_exists('entryFee', $data)) $data['isFree'] = ((float) $data['entryFee']) <= 0;
        $tournament->update($data);

        return response()->json($tournament->fresh('organizer'));
    }

    public function updateStatus(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        if ($tournament->gameId && !Game::whereKey($tournament->gameId)->where('enabled', true)->exists()) {
            throw ValidationException::withMessages(['gameId' => 'This game is currently disabled.']);
        }
        $this->authorizeManager($request, $tournament);
        $validated = $request->validate(['status' => ['required', Rule::in($this->statuses())]]);
        $tournament->update($validated);

        return response()->json($tournament);
    }

    public function approveRegistration(Request $request, $id)
    {
        return $this->updateRegistrationStatus($request, $id, TournamentRegistration::STATUS_APPROVED);
    }

    public function rejectRegistration(Request $request, $id)
    {
        return $this->updateRegistrationStatus($request, $id, TournamentRegistration::STATUS_REJECTED);
    }

    public function join(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        if ($tournament->gameId && !Game::whereKey($tournament->gameId)->where('enabled', true)->exists()) {
            throw ValidationException::withMessages(['gameId' => 'This game is currently disabled.']);
        }
        if ($tournament->status !== Tournament::STATUS_REGISTRATION_OPEN) {
            throw ValidationException::withMessages(['tournament' => 'Registration is not open.']);
        }

        $payload = $request->validate([
            'gameProfileId' => 'nullable|uuid|exists:user_game_profiles,id', 'ffUid' => 'nullable|string',
            'starterUserIds' => 'nullable|array', 'starterUserIds.*' => 'uuid',
            'substituteUserIds' => 'nullable|array', 'substituteUserIds.*' => 'uuid',
        ]);

        return DB::transaction(function () use ($request, $id, $payload) {
            $tournament = Tournament::with('gameMode')->whereKey($id)->lockForUpdate()->firstOrFail();
            if (TournamentRegistration::where('tournamentId', $id)->where('userId', $request->user()->id)->exists()) {
                throw ValidationException::withMessages(['tournament' => 'Already registered for this tournament.']);
            }
            if ($this->registrationCount($id) >= (int) $tournament->maxTeams) {
                throw ValidationException::withMessages(['tournament' => 'This tournament is full.']);
            }
            $profile = $this->resolveGameProfile($tournament, $request->user(), $payload);
            $lineup = $this->resolveLineup($tournament, $request->user(), $payload);

            $transaction = null;
            if (!$tournament->isFree && (float) $tournament->entryFee > 0) {
                $transaction = $this->wallets->debit(
                    $request->user()->id,
                    (float) $tournament->entryFee,
                    Transaction::TYPE_ENTRY_FEE,
                    'tournament:'.$tournament->id.':user:'.$request->user()->id,
                    'Entry fee for tournament: '.$tournament->title,
                );
            }

            $registration = TournamentRegistration::create([
                'tournamentId' => $id,
                'userId' => $request->user()->id,
                'ffUid' => $profile?->uid ?? $request->input('ffUid', $request->user()->uid),
                'gameProfileId' => $profile?->id,
                'transactionId' => $transaction?->id,
                'status' => TournamentRegistration::STATUS_APPROVED,
                'checkInStatus' => $tournament->checkInEnabled ? 'PENDING' : 'NOT_REQUIRED',
            ]);
            if ($lineup) $this->persistLineup($registration, $lineup);
            $this->syncRegisteredTeams($id);
            $this->notifications->send(
                $registration->userId,
                'REGISTRATION_APPROVED',
                'Tournament registration confirmed',
                'Your registration for '.$tournament->title.' is approved.',
                ['tournamentId' => $tournament->id, 'registrationId' => $registration->id],
                'registration-approved:'.$registration->id,
            );

            return response()->json([
                'message' => 'Successfully joined tournament.',
                'registration' => $registration,
                'paymentStatus' => $transaction ? 'wallet' : 'free',
            ], 201);
        });
    }

    public function register(Request $request, $id) { return $this->join($request, $id); }

    public function checkIn(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $registration = TournamentRegistration::with(['tournament', 'lineup'])->where('tournamentId', $id)
                ->where('userId', $request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless($registration->tournament->checkInEnabled, 422, 'Check-in is not required for this tournament.');
            abort_if($registration->checkInStatus === 'CHECKED_IN', 422, 'Line-up is already checked in.');
            abort_if($registration->checkInStatus === 'EXPIRED', 422, 'Check-in window has expired.');
            abort_if($registration->tournament->checkInOpensAt && now()->isBefore($registration->tournament->checkInOpensAt), 422, 'Check-in is not open yet.');
            abort_if($registration->tournament->checkInClosesAt && now()->isAfter($registration->tournament->checkInClosesAt), 422, 'Check-in window has closed.');
            $registration->update(['checkInStatus' => 'CHECKED_IN', 'checkedInAt' => now()]);
            $registration->lineup?->update(['status' => 'CHECKED_IN', 'checkedInAt' => now()]);
            $userIds = $this->notifications->registrationUserIds($registration);
            $this->notifications->sendMany(
                $userIds,
                'CHECK_IN_CONFIRMED',
                'Tournament check-in confirmed',
                'Your line-up is checked in for '.$registration->tournament->title.'.',
                ['tournamentId' => $registration->tournamentId, 'registrationId' => $registration->id],
                'checkin-confirmed:'.$registration->id,
            );
            if ($registration->tournament->roomDetails['roomId'] ?? null) {
                $this->notifications->sendMany(
                    $userIds,
                    'ROOM_AVAILABLE',
                    'Tournament room is ready',
                    'Private lobby details are available for '.$registration->tournament->title.'.',
                    ['tournamentId' => $registration->tournamentId],
                    'default-room-ready:'.$registration->id,
                );
            }
            return response()->json($registration->fresh(['lineup.members.user', 'tournament']));
        });
    }

    private function validatedTournament(Request $request, bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'title' => [$sometimes, 'string', 'max:255'],
            'description' => 'nullable|string',
            'banner' => 'nullable|string|max:2048',
            'gameId' => ['nullable', 'uuid', 'exists:games,id'],
            'gameModeId' => ['nullable', 'uuid', 'exists:game_modes,id'],
            'format' => [$sometimes, Rule::in(['SOLO', 'DUO', 'SQUAD', 'CLASH_SQUAD'])],
            'competitionMode' => ['nullable', Rule::in([Tournament::MODE_STANDARD, Tournament::MODE_KNOCKOUT])],
            'status' => ['nullable', Rule::in($this->statuses())],
            'entryFee' => 'nullable|numeric|min:0',
            'prizePool' => 'nullable|numeric|min:0',
            'perKillReward' => 'nullable|numeric|min:0',
            'maxTeams' => 'nullable|integer|min:1',
            'rules' => 'nullable|array',
            'maps' => 'nullable|array',
            'prizeDistribution' => 'nullable|array',
            'rewardSettings' => 'nullable|array',
            'roomDetails' => 'nullable|array',
            'roomDetails.roomId' => 'nullable|string|max:255',
            'roomDetails.password' => 'nullable|string|max:255',
            'registrationStart' => 'nullable|date',
            'registrationEnd' => 'nullable|date|after_or_equal:registrationStart',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date|after_or_equal:startDate',
            'startTime' => 'nullable|string|max:20',
            'isFeatured' => 'nullable|boolean',
            'requiresVerifiedProfile' => 'nullable|boolean', 'checkInEnabled' => 'nullable|boolean',
            'checkInOpensAt' => 'nullable|date', 'checkInClosesAt' => 'nullable|date|after_or_equal:checkInOpensAt',
            'scoringConfig' => 'nullable|array', 'lobbyConfig' => 'nullable|array',
        ]);
    }

    private function validateCatalogSelection(array $data, ?Tournament $tournament = null): void
    {
        $gameId = $data['gameId'] ?? $tournament?->gameId;
        $modeId = $data['gameModeId'] ?? $tournament?->gameModeId;
        if ($gameId && !Game::whereKey($gameId)->where('enabled', true)->exists()) {
            throw ValidationException::withMessages(['gameId' => 'Select an enabled game.']);
        }
        if ($modeId && !GameMode::whereKey($modeId)->where('gameId', $gameId)->where('enabled', true)->exists()) {
            throw ValidationException::withMessages(['gameModeId' => 'Select an enabled mode for this game.']);
        }
    }

    private function resolveGameProfile(Tournament $tournament, User $user, array $payload): ?UserGameProfile
    {
        if (!$tournament->gameId) return null;
        $profile = UserGameProfile::where('userId', $user->id)->where('gameId', $tournament->gameId)
            ->when($payload['gameProfileId'] ?? null, fn ($q, $id) => $q->whereKey($id))->first();
        if (!$profile && $tournament->gameModeId) throw ValidationException::withMessages(['gameProfileId' => 'Add your game profile before joining this tournament.']);
        if ($profile && $tournament->requiresVerifiedProfile && $profile->verificationStatus !== UserGameProfile::STATUS_VERIFIED) {
            throw ValidationException::withMessages(['gameProfileId' => 'A verified game profile is required.']);
        }
        return $profile;
    }

    private function resolveLineup(Tournament $tournament, User $captain, array $payload): ?array
    {
        $required = (int) ($tournament->gameMode?->rosterSize ?? ($tournament->format === 'SOLO' ? 1 : (in_array($tournament->format, ['SQUAD', 'CLASH_SQUAD']) ? 4 : 2)));
        if ($required === 1) return null;
        $team = Team::where('captainId', $captain->id)->when($tournament->gameId, fn ($q) => $q->where('gameId', $tournament->gameId))->first();
        if (!$team) throw ValidationException::withMessages(['team' => 'Create a team for this game before joining.']);
        $allowed = collect([$captain->id])->merge(TeamMembership::where('teamId', $team->id)->where('status', TeamMembership::STATUS_ACCEPTED)->pluck('userId'))->unique();
        $starters = collect($payload['starterUserIds'] ?? $allowed->take($required)->all())->unique();
        $subs = collect($payload['substituteUserIds'] ?? [])->unique();
        if ($starters->count() !== $required || $starters->diff($allowed)->isNotEmpty() || $subs->diff($allowed)->isNotEmpty() || $subs->intersect($starters)->isNotEmpty()) {
            throw ValidationException::withMessages(['lineup' => "Select exactly {$required} accepted starters and valid substitutes."]);
        }
        if ($subs->count() > (int) ($tournament->gameMode?->substituteLimit ?? 0)) throw ValidationException::withMessages(['lineup' => 'Too many substitutes selected.']);
        $profiles = UserGameProfile::where('gameId', $tournament->gameId)->whereIn('userId', $starters->merge($subs))->get()->keyBy('userId');
        if ($tournament->gameModeId && $profiles->count() !== $starters->merge($subs)->count()) throw ValidationException::withMessages(['lineup' => 'Every selected player needs a profile for this game.']);
        if ($tournament->requiresVerifiedProfile && $profiles->contains(fn ($profile) => $profile->verificationStatus !== UserGameProfile::STATUS_VERIFIED)) throw ValidationException::withMessages(['lineup' => 'Every selected player needs a verified game profile.']);
        return compact('team', 'starters', 'subs', 'profiles');
    }

    private function persistLineup(TournamentRegistration $registration, array $selection): void
    {
        $lineup = TournamentLineup::create(['registrationId' => $registration->id, 'teamId' => $selection['team']->id, 'captainId' => $registration->userId]);
        foreach (['STARTER' => $selection['starters'], 'SUBSTITUTE' => $selection['subs']] as $role => $users) {
            foreach ($users as $userId) TournamentLineupMember::create(['lineupId' => $lineup->id, 'userId' => $userId, 'gameProfileId' => $selection['profiles']->get($userId)?->id, 'role' => $role]);
        }
    }

    private function updateRegistrationStatus(Request $request, string $id, string $status)
    {
        $registration = TournamentRegistration::findOrFail($id);
        $tournament = Tournament::findOrFail($registration->tournamentId);
        $this->authorizeManager($request, $tournament);
        $registration->update(['status' => $status]);
        $this->syncRegisteredTeams($registration->tournamentId);
        return response()->json($registration);
    }

    private function registrationCount(string $id): int
    {
        return TournamentRegistration::where('tournamentId', $id)
            ->where('status', TournamentRegistration::STATUS_APPROVED)->count();
    }

    private function syncRegisteredTeams(string $id): void
    {
        Tournament::whereKey($id)->update(['registeredTeams' => $this->registrationCount($id)]);
    }

    private function publicTournament(Tournament $tournament): array
    {
        return $tournament->makeHidden(['roomDetails'])->toArray();
    }

    private function publicParticipants(Tournament $tournament)
    {
        return TournamentRegistration::with([
                'user',
                'gameProfile.game',
                'lineup.team.game',
                'lineup.members.user',
                'lineup.members.profile.game',
            ])
            ->where('tournamentId', $tournament->id)
            ->where('status', TournamentRegistration::STATUS_APPROVED)
            ->orderBy('createdAt')
            ->get()
            ->values()
            ->map(function (TournamentRegistration $registration, int $index) use ($tournament) {
                $lineup = $registration->lineup;
                $teamMode = (int) ($tournament->gameMode?->rosterSize ?? ($tournament->format === 'SOLO' ? 1 : (in_array($tournament->format, ['SQUAD', 'CLASH_SQUAD']) ? 4 : 2))) > 1;

                return [
                    'id' => $registration->id,
                    'seed' => $index + 1,
                    'status' => $registration->status,
                    'checkInStatus' => $registration->checkInStatus,
                    'name' => $teamMode
                        ? ($lineup?->team?->name ?? $registration->user?->platformHandle ?? $registration->user?->name)
                        : ($registration->gameProfile?->ign ?? $registration->user?->platformHandle ?? $registration->user?->ign ?? $registration->user?->name),
                    'teamName' => $lineup?->team?->name,
                    'team' => $lineup?->team ? [
                        'id' => $lineup->team->id,
                        'name' => $lineup->team->name,
                        'tag' => $lineup->team->tag ?? null,
                        'game' => $lineup->team->game ? ['id' => $lineup->team->game->id, 'name' => $lineup->team->game->name] : null,
                    ] : null,
                    'user' => [
                        'id' => $registration->user?->id,
                        'name' => $registration->user?->name,
                        'ign' => $registration->user?->ign,
                        'platformHandle' => $registration->user?->platformHandle,
                        'avatar' => $registration->user?->avatar,
                    ],
                    'gameProfile' => $registration->gameProfile ? [
                        'id' => $registration->gameProfile->id,
                        'ign' => $registration->gameProfile->ign,
                        'region' => $registration->gameProfile->region,
                        'verificationStatus' => $registration->gameProfile->verificationStatus,
                        'game' => $registration->gameProfile->game ? ['id' => $registration->gameProfile->game->id, 'name' => $registration->gameProfile->game->name] : null,
                    ] : null,
                    'starters' => $lineup ? $this->publicLineupMembers($lineup, 'STARTER') : [],
                    'substitutes' => $lineup ? $this->publicLineupMembers($lineup, 'SUBSTITUTE') : [],
                ];
            });
    }

    private function publicLineupMembers(TournamentLineup $lineup, string $role)
    {
        return $lineup->members
            ->where('role', $role)
            ->values()
            ->map(fn (TournamentLineupMember $member) => [
                'id' => $member->user?->id,
                'name' => $member->user?->name,
                'ign' => $member->profile?->ign ?? $member->user?->ign,
                'platformHandle' => $member->user?->platformHandle,
                'region' => $member->profile?->region,
                'verificationStatus' => $member->profile?->verificationStatus,
            ]);
    }

    private function publicMatchForBracket(Request $request, MatchModel $match): array
    {
        $data = $match->makeHidden(['roomId', 'roomPassword'])->toArray();
        unset($data['roomId'], $data['roomPassword']);
        return $data;
    }

    private function authorizeManager(Request $request, Tournament $tournament): void
    {
        abort_unless($this->canManage($request, $tournament), 403, 'You cannot manage this tournament.');
    }

    private function canManage(Request $request, Tournament $tournament): bool
    {
        return $request->user()->role === User::ROLE_ADMIN || $tournament->organizerId === $request->user()->id;
    }

    private function statuses(): array
    {
        return [
            Tournament::STATUS_DRAFT, Tournament::STATUS_REGISTRATION_OPEN,
            Tournament::STATUS_REGISTRATION_CLOSED, Tournament::STATUS_IN_PROGRESS,
            Tournament::STATUS_COMPLETED, Tournament::STATUS_CANCELLED,
        ];
    }
}
