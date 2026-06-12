<?php

namespace App\Services;

use App\Models\MatchModel;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KnockoutBracketService
{
    public function stagesForSize(int $size): array
    {
        return match ($size) {
            16 => [
                Tournament::STAGE_QUALIFIER,
                Tournament::STAGE_ROUND_2,
                Tournament::STAGE_SEMI_FINAL,
                Tournament::STAGE_FINAL,
            ],
            32 => [
                Tournament::STAGE_QUALIFIER,
                Tournament::STAGE_ROUND_2,
                Tournament::STAGE_ROUND_3,
                Tournament::STAGE_SEMI_FINAL,
                Tournament::STAGE_FINAL,
            ],
            default => throw ValidationException::withMessages([
                'maxTeams' => 'Knockout brackets currently support exactly 16 or 32 participants.',
            ]),
        };
    }

    public function generate(Tournament $tournament): array
    {
        return DB::transaction(function () use ($tournament) {
            $tournament = Tournament::whereKey($tournament->id)->lockForUpdate()->firstOrFail();
            if ($tournament->competitionMode !== Tournament::MODE_KNOCKOUT) {
                throw ValidationException::withMessages(['competitionMode' => 'Only KNOCKOUT tournaments can generate a bracket.']);
            }
            $stages = $this->stagesForSize((int) $tournament->maxTeams);

            if (MatchModel::where('tournamentId', $tournament->id)->exists()) {
                throw ValidationException::withMessages([
                    'bracket' => 'This tournament already has matches. Delete them before regenerating the bracket.',
                ]);
            }

            $participants = $this->participants($tournament);
            if ($participants->count() !== (int) $tournament->maxTeams) {
                throw ValidationException::withMessages([
                    'participants' => "Exactly {$tournament->maxTeams} approved participants are required to generate this bracket.",
                ]);
            }

            $matchNumber = 1;
            $firstRoundSlots = $participants->shuffle()->values();
            $scheduledTime = Carbon::parse($tournament->startDate ?: now());
            $map = collect($tournament->maps)->filter()->first() ?: 'Bermuda';

            foreach ($stages as $stageIndex => $stage) {
                $matchesInStage = (int) ($tournament->maxTeams / (2 ** ($stageIndex + 1)));

                for ($index = 0; $index < $matchesInStage; $index++) {
                    $slots = [];
                    if ($stageIndex === 0) {
                        $slots = [
                            [...$firstRoundSlots[$index * 2], 'slotNumber' => 1],
                            [...$firstRoundSlots[($index * 2) + 1], 'slotNumber' => 2],
                        ];
                    }

                    MatchModel::create([
                        'tournamentId' => $tournament->id,
                        'matchNumber' => $matchNumber++,
                        'stage' => $stage,
                        'map' => $map,
                        'scheduledTime' => $scheduledTime->copy()->addHours($stageIndex * 2),
                        'status' => MatchModel::STATUS_SCHEDULED,
                        'slots' => $slots,
                    ]);
                }
            }

            $tournament->update([
                'status' => Tournament::STATUS_IN_PROGRESS,
                'currentStage' => $stages[0],
                'stages' => $stages,
                'matchCount' => $matchNumber - 1,
            ]);

            return $this->summary($tournament->fresh());
        });
    }

    public function recordWinner(MatchModel $match, string $winnerTeamId): array
    {
        return DB::transaction(function () use ($match, $winnerTeamId) {
            $match = MatchModel::whereKey($match->id)->lockForUpdate()->firstOrFail();
            $tournament = Tournament::whereKey($match->tournamentId)->lockForUpdate()->firstOrFail();
            $slots = collect($match->slots ?? [])->values();

            if ($match->status === MatchModel::STATUS_COMPLETED) {
                throw ValidationException::withMessages(['match' => 'This match is already completed.']);
            }
            if ($slots->count() !== 2) {
                throw ValidationException::withMessages(['match' => 'Both participant slots must be filled before selecting a winner.']);
            }

            $winner = $slots->firstWhere('teamId', $winnerTeamId);
            if (!$winner) {
                throw ValidationException::withMessages(['winnerTeamId' => 'The selected winner is not part of this match.']);
            }
            $loser = $slots->first(fn (array $slot) => $slot['teamId'] !== $winnerTeamId);

            $match->update([
                'status' => MatchModel::STATUS_COMPLETED,
                'results' => [
                    ['teamId' => $winner['teamId'], 'placement' => 1],
                    ['teamId' => $loser['teamId'], 'placement' => 2],
                ],
            ]);

            $stages = $this->stagesForSize((int) $tournament->maxTeams);
            $stageIndex = array_search($match->stage, $stages, true);

            if ($stageIndex === count($stages) - 1) {
                $tournament->update([
                    'status' => Tournament::STATUS_COMPLETED,
                    'currentStage' => Tournament::STAGE_FINAL,
                ]);
            } else {
                $this->advanceWinner($match, $winner, $stages[$stageIndex + 1]);

                if (!MatchModel::where('tournamentId', $tournament->id)
                    ->where('stage', $match->stage)
                    ->where('status', '!=', MatchModel::STATUS_COMPLETED)
                    ->exists()) {
                    $tournament->update(['currentStage' => $stages[$stageIndex + 1]]);
                }
            }

            return $this->summary($tournament->fresh());
        });
    }

    public function summary(Tournament $tournament): array
    {
        return [
            'tournament' => $tournament,
            'matches' => MatchModel::where('tournamentId', $tournament->id)
                ->orderBy('matchNumber')
                ->get(),
        ];
    }

    private function participants(Tournament $tournament)
    {
        $registrations = TournamentRegistration::with('user')
            ->where('tournamentId', $tournament->id)
            ->where('status', TournamentRegistration::STATUS_APPROVED)
            ->get();

        if ($tournament->format === 'SOLO') {
            return $registrations->map(fn (TournamentRegistration $registration) => [
                'teamId' => $registration->userId,
                'teamName' => $registration->user?->ign ?: $registration->user?->name ?: 'Player',
            ])->unique('teamId')->values();
        }

        $teams = Team::whereIn('captainId', $registrations->pluck('userId'))->get()->keyBy('captainId');

        if ($teams->count() !== $registrations->count()) {
            throw ValidationException::withMessages([
                'participants' => 'Every approved participant must captain a team before generating a team bracket.',
            ]);
        }

        return $registrations->map(fn (TournamentRegistration $registration) => [
            'teamId' => $teams[$registration->userId]->id,
            'teamName' => $teams[$registration->userId]->name,
        ])->unique('teamId')->values();
    }

    private function advanceWinner(MatchModel $match, array $winner, string $nextStage): void
    {
        $currentMatches = MatchModel::where('tournamentId', $match->tournamentId)
            ->where('stage', $match->stage)
            ->orderBy('matchNumber')
            ->get();
        $currentIndex = $currentMatches->search(fn (MatchModel $current) => $current->id === $match->id);

        $nextMatch = MatchModel::where('tournamentId', $match->tournamentId)
            ->where('stage', $nextStage)
            ->orderBy('matchNumber')
            ->skip((int) floor($currentIndex / 2))
            ->firstOrFail();

        $slots = collect($nextMatch->slots ?? [])
            ->reject(fn (array $slot) => ($slot['slotNumber'] ?? null) === ($currentIndex % 2) + 1)
            ->push([
                ...$winner,
                'slotNumber' => ($currentIndex % 2) + 1,
            ])
            ->sortBy('slotNumber')
            ->values()
            ->all();

        $nextMatch->update(['slots' => $slots]);
    }
}
