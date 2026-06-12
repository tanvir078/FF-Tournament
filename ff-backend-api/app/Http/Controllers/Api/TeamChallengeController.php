<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\TeamChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TeamChallengeController extends Controller
{
    public function store(Request $request)
    {
        $team = Team::where('captainId', $request->user()->id)->firstOrFail();
        $validated = $request->validate([
            'challengedTeamId' => 'required|uuid|exists:teams,id',
            'message' => 'nullable|string',
            'format' => 'required|string',
            'entryFee' => 'nullable|numeric|min:0',
            'prizePool' => 'nullable|numeric|min:0',
        ]);
        abort_if($validated['challengedTeamId'] === $team->id, 422, 'You cannot challenge your own team.');

        return response()->json(TeamChallenge::create([
            ...$validated,
            'challengerTeamId' => $team->id,
            'matchId' => (string) Str::uuid(),
            'status' => 'PENDING',
            'prizePool' => $validated['prizePool'] ?? (($validated['entryFee'] ?? 0) * 2),
        ])->load(['challengerTeam', 'challengedTeam']), 201);
    }

    public function pending(Request $request)
    {
        $team = Team::where('captainId', $request->user()->id)->first();
        return response()->json($team ? TeamChallenge::with(['challengerTeam', 'challengedTeam'])->where('challengedTeamId', $team->id)->where('status', 'PENDING')->get() : []);
    }

    public function mine(Request $request)
    {
        $team = Team::where('captainId', $request->user()->id)->first();
        return response()->json($team ? TeamChallenge::with(['challengerTeam', 'challengedTeam'])->where('challengerTeamId', $team->id)->orWhere('challengedTeamId', $team->id)->get() : []);
    }

    public function accept(Request $request, $id)
    {
        return $this->updateStatus($request, $id, 'ACCEPTED', 'challengedTeamId', ['acceptedAt' => now()]);
    }

    public function reject(Request $request, $id)
    {
        return $this->updateStatus($request, $id, 'REJECTED', 'challengedTeamId', [
            'rejectedAt' => now(),
            'rejectedReason' => $request->input('reason'),
        ]);
    }

    public function cancel(Request $request, $id)
    {
        return $this->updateStatus($request, $id, 'CANCELLED', 'challengerTeamId');
    }

    private function updateStatus(Request $request, $id, string $status, string $teamColumn, array $extra = [])
    {
        $team = Team::where('captainId', $request->user()->id)->firstOrFail();
        $challenge = TeamChallenge::where($teamColumn, $team->id)->findOrFail($id);
        abort_if($challenge->status !== 'PENDING', 422, 'Only pending challenges can be updated.');
        $challenge->update(['status' => $status, ...$extra]);
        return response()->json($challenge->load(['challengerTeam', 'challengedTeam']));
    }
}
