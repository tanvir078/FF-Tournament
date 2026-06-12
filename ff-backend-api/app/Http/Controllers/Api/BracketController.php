<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\Tournament;
use App\Models\User;
use App\Services\KnockoutBracketService;
use Illuminate\Http\Request;

class BracketController extends Controller
{
    public function __construct(private readonly KnockoutBracketService $brackets)
    {
    }

    public function generate(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $this->authorizeTournament($request, $tournament);

        return response()->json($this->brackets->generate($tournament), 201);
    }

    public function winner(Request $request, $id)
    {
        $validated = $request->validate([
            'winnerTeamId' => 'required|uuid',
        ]);
        $match = MatchModel::findOrFail($id);
        $this->authorizeTournament($request, $match->tournament()->firstOrFail());

        return response()->json($this->brackets->recordWinner($match, $validated['winnerTeamId']));
    }

    private function authorizeTournament(Request $request, Tournament $tournament): void
    {
        abort_unless(
            $request->user()->role === User::ROLE_ADMIN || $tournament->organizerId === $request->user()->id,
            403,
            'You cannot manage this tournament.'
        );
    }
}
