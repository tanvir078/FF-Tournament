<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use Illuminate\Support\Collection;

class NotificationService
{
    public function send(
        string $userId,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?string $dedupeKey = null,
    ): Notification {
        $attributes = compact('userId', 'type', 'title', 'message', 'data');

        return $dedupeKey
            ? Notification::firstOrCreate(['dedupeKey' => $dedupeKey], $attributes)
            : Notification::create($attributes);
    }

    public function sendMany(
        iterable $userIds,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?string $dedupePrefix = null,
    ): void {
        foreach (collect($userIds)->filter()->unique() as $userId) {
            $this->send(
                $userId,
                $type,
                $title,
                $message,
                $data,
                $dedupePrefix ? $dedupePrefix.':user:'.$userId : null,
            );
        }
    }

    public function registrationUserIds(TournamentRegistration $registration): Collection
    {
        $registration->loadMissing('lineup.members');

        return collect([$registration->userId])
            ->merge($registration->lineup?->members->pluck('userId') ?? [])
            ->filter()
            ->unique()
            ->values();
    }

    public function tournamentParticipantIds(Tournament $tournament): Collection
    {
        return TournamentRegistration::with('lineup.members')
            ->where('tournamentId', $tournament->id)
            ->where('status', TournamentRegistration::STATUS_APPROVED)
            ->when($tournament->checkInEnabled, fn ($query) => $query->where('checkInStatus', 'CHECKED_IN'))
            ->get()
            ->flatMap(fn (TournamentRegistration $registration) => $this->registrationUserIds($registration))
            ->unique()
            ->values();
    }
}
