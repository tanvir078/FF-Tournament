<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use App\Services\NotificationService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('tournaments:expire-check-ins', function () {
    $expired = 0;

    DB::transaction(function () use (&$expired) {
        $registrations = TournamentRegistration::with('lineup')
            ->where('status', TournamentRegistration::STATUS_APPROVED)
            ->where('checkInStatus', 'PENDING')
            ->whereHas('tournament', fn ($query) => $query
                ->where('checkInEnabled', true)
                ->whereNotNull('checkInClosesAt')
                ->where('checkInClosesAt', '<', now()))
            ->lockForUpdate()
            ->get();

        foreach ($registrations as $registration) {
            $registration->update([
                'status' => TournamentRegistration::STATUS_EXPIRED,
                'checkInStatus' => 'EXPIRED',
            ]);
            $registration->lineup?->update(['status' => 'EXPIRED']);
            app(NotificationService::class)->sendMany(
                app(NotificationService::class)->registrationUserIds($registration),
                'CHECK_IN_EXPIRED',
                'Tournament check-in expired',
                'The check-in window for '.$registration->tournament->title.' has closed.',
                ['tournamentId' => $registration->tournamentId, 'registrationId' => $registration->id],
                'checkin-expired:'.$registration->id,
            );
            $expired++;
        }

        foreach ($registrations->pluck('tournamentId')->unique() as $tournamentId) {
            Tournament::whereKey($tournamentId)->update([
                'registeredTeams' => TournamentRegistration::where('tournamentId', $tournamentId)
                    ->where('status', TournamentRegistration::STATUS_APPROVED)
                    ->count(),
            ]);
        }
    });

    $this->info("Expired {$expired} missed tournament check-in(s).");
})->purpose('Expire approved tournament registrations that missed their check-in window');

Artisan::command('tournaments:send-check-in-reminders', function () {
    $sent = 0;
    $notifications = app(NotificationService::class);

    TournamentRegistration::with(['tournament', 'lineup.members'])
        ->where('status', TournamentRegistration::STATUS_APPROVED)
        ->where('checkInStatus', 'PENDING')
        ->whereHas('tournament', fn ($query) => $query
            ->where('checkInEnabled', true)
            ->where(fn ($window) => $window->whereNull('checkInOpensAt')->orWhere('checkInOpensAt', '<=', now()))
            ->where(fn ($window) => $window->whereNull('checkInClosesAt')->orWhere('checkInClosesAt', '>', now())))
        ->each(function (TournamentRegistration $registration) use ($notifications, &$sent) {
            $notifications->sendMany(
                $notifications->registrationUserIds($registration),
                'CHECK_IN_REQUIRED',
                'Tournament check-in is open',
                'Check in your line-up for '.$registration->tournament->title.'.',
                ['tournamentId' => $registration->tournamentId, 'registrationId' => $registration->id],
                'checkin-reminder:'.$registration->id,
            );
            $sent++;
        });

    $this->info("Sent {$sent} tournament check-in reminder(s).");
})->purpose('Notify approved tournament registrations when their check-in window is open');

Schedule::command('tournaments:expire-check-ins')->everyMinute()->withoutOverlapping();
Schedule::command('tournaments:send-check-in-reminders')->everyMinute()->withoutOverlapping();
