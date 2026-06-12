<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultClaim;

class LeaderboardController extends Controller
{
    public function index()
    {
        $rows = ResultClaim::with(['submitter', 'team'])
            ->where('status', ResultClaim::STATUS_APPROVED)
            ->get()
            ->groupBy(fn (ResultClaim $claim) => $claim->teamId ?: $claim->submittedById)
            ->map(function ($claims) {
                $first = $claims->first();
                $kills = $claims->sum('kills');
                $wins = $claims->where('placement', 1)->count();
                $points = $claims->sum(fn (ResultClaim $claim) => max(0, 12 - (int) $claim->placement) * 10 + ((int) $claim->kills * 2));
                return [
                    'id' => $first->teamId ?: $first->submittedById,
                    'team' => $first->team?->name ?: ($first->submitter?->ign ?: $first->submitter?->name ?: 'Player'),
                    'tag' => $first->team?->tag ?: 'SOLO',
                    'points' => $points,
                    'kills' => $kills,
                    'matches' => $claims->count(),
                    'kd' => $claims->count() ? round($kills / $claims->count(), 2) : 0,
                    'wins' => $wins,
                ];
            })
            ->sortByDesc('points')
            ->values()
            ->map(fn (array $entry, int $index) => [...$entry, 'rank' => $index + 1]);

        return response()->json([
            'entries' => $rows,
            'totalTeams' => $rows->count(),
            'totalMatches' => ResultClaim::where('status', ResultClaim::STATUS_APPROVED)->distinct()->count('matchId'),
        ]);
    }
}
