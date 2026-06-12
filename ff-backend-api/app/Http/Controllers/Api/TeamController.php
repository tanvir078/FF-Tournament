<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Team;
use App\Models\TeamMembership;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $query = Team::with(['game', 'captain', 'memberships.user']);
        if ($request->search) $query->where('name', 'like', '%'.$request->search.'%');
        if ($request->gameId) $query->where('gameId', $request->gameId);
        return response()->json($query->get()->map(fn (Team $team) => $this->visibleTeam($team, $request->user())));
    }

    public function myTeam(Request $request)
    {
        $team = Team::with(['game', 'captain', 'memberships.user'])
                ->when($request->gameId, fn ($q) => $q->where('gameId', $request->gameId))
                ->where(fn ($q) => $q->where('captainId', $request->user()->id)
                    ->orWhereHas('memberships', fn ($memberships) => $memberships->where('userId', $request->user()->id)->where('status', TeamMembership::STATUS_ACCEPTED)))
                ->first();
        return response()->json($team ? $this->visibleTeam($team, $request->user()) : null);
    }

    public function invitations(Request $request)
    {
        return response()->json(TeamMembership::with(['team.game', 'team.captain'])->where('userId', $request->user()->id)->where('status', TeamMembership::STATUS_PENDING)->get());
    }

    public function show(Request $request, $id)
    {
        return response()->json($this->visibleTeam(Team::with(['game', 'captain', 'memberships.user'])->findOrFail($id), $request->user()));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|unique:teams', 'tag' => 'nullable|string|max:10', 'description' => 'nullable|string', 'gameId' => 'nullable|uuid|exists:games,id']);
        $data['gameId'] ??= Game::where('slug', 'free-fire')->value('id');
        abort_if(Team::where('captainId', $request->user()->id)->where('gameId', $data['gameId'])->exists(), 422, 'You already captain a team for this game.');
        return response()->json(Team::create([...$data, 'captainId' => $request->user()->id])->load('captain'), 201);
    }

    public function update(Request $request, $id)
    {
        $team = Team::where('captainId', $request->user()->id)->findOrFail($id);
        $team->update($request->validate(['name' => 'sometimes|string', 'tag' => 'nullable|string|max:10', 'logo' => 'nullable|string', 'description' => 'nullable|string']));
        return response()->json($team->fresh(['captain', 'memberships.user']));
    }

    public function invite(Request $request, $id)
    {
        $data = $request->validate(['platformHandle' => 'nullable|string', 'ign' => 'required_without:platformHandle|string']);
        $team = Team::where('captainId', $request->user()->id)->findOrFail($id);
        $user = isset($data['platformHandle'])
            ? User::where('platformHandle', $data['platformHandle'])->firstOrFail()
            : User::where('ign', $data['ign'])->firstOrFail();
        abort_if($user->id === $request->user()->id, 422, 'Captain is already part of the team.');
        $membership = TeamMembership::updateOrCreate(
            ['teamId' => $team->id, 'userId' => $user->id],
            ['invitedById' => $request->user()->id, 'status' => TeamMembership::STATUS_PENDING],
        );
        return response()->json($membership->load(['team', 'user']), 201);
    }

    public function respond(Request $request, $id)
    {
        $data = $request->validate(['status' => 'required|in:ACCEPTED,REJECTED']);
        $membership = DB::transaction(function () use ($request, $id, $data) {
            $membership = TeamMembership::where('userId', $request->user()->id)
                ->where('status', TeamMembership::STATUS_PENDING)
                ->lockForUpdate()
                ->findOrFail($id);

            if ($data['status'] === TeamMembership::STATUS_ACCEPTED) {
                abort_if(
                    Team::where('captainId', $request->user()->id)->where('gameId', $membership->team->gameId)->exists()
                    || TeamMembership::where('userId', $request->user()->id)
                        ->where('status', TeamMembership::STATUS_ACCEPTED)
                        ->where('id', '!=', $membership->id)
                        ->whereHas('team', fn ($q) => $q->where('gameId', $membership->team->gameId))
                        ->exists(),
                    422,
                    'You are already part of another team.'
                );
            }

            $membership->update($data);
            return $membership;
        });

        return response()->json($membership->fresh(['team', 'user']));
    }

    public function removePlayer(Request $request, $id, $playerId)
    {
        $team = Team::where('captainId', $request->user()->id)->findOrFail($id);
        TeamMembership::where('teamId', $team->id)->where('userId', $playerId)->delete();
        return response()->json($team->fresh(['captain', 'memberships.user']));
    }

    public function revokeInvitation(Request $request, $id, $membershipId)
    {
        $team = Team::where('captainId', $request->user()->id)->findOrFail($id);
        TeamMembership::where('teamId', $team->id)
            ->where('status', TeamMembership::STATUS_PENDING)
            ->findOrFail($membershipId)
            ->delete();
        return response()->json(['message' => 'Invitation revoked']);
    }

    public function leave(Request $request, $id)
    {
        TeamMembership::where('teamId', $id)->where('userId', $request->user()->id)->delete();
        return response()->json(['message' => 'Left team successfully']);
    }

    public function destroy(Request $request, $id)
    {
        Team::where('captainId', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Team deleted']);
    }

    private function visibleTeam(Team $team, User $viewer): Team
    {
        if ($team->captainId !== $viewer->id) {
            $team->setRelation('memberships', $team->memberships->where('status', TeamMembership::STATUS_ACCEPTED)->values());
        }
        return $team;
    }
}
