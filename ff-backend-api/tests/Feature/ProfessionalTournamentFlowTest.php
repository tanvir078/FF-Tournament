<?php

namespace Tests\Feature;

use App\Events\SupportMessageCreated;
use App\Models\Tournament;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\MatchModel;
use App\Models\Notification;
use App\Models\ResultClaim;
use App\Models\ResultClaimReward;
use App\Models\Game;
use App\Models\GameMode;
use App\Models\Team;
use App\Models\TeamMembership;
use App\Models\TournamentLineup;
use App\Models\TournamentRegistration;
use App\Models\UserGameProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfessionalTournamentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_paid_join_debits_main_wallet_once_and_creates_approved_registration(): void
    {
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        Wallet::create(['userId' => $player->id, 'balance' => 100]);
        $tournament = $this->tournament($organizer, ['entryFee' => 25, 'isFree' => false]);

        $this->actingAs($player)->postJson("/api/tournaments/{$tournament->id}/join", ['ffUid' => '123'])
            ->assertCreated()->assertJsonPath('paymentStatus', 'wallet');
        $this->actingAs($player)->postJson("/api/tournaments/{$tournament->id}/join")->assertStatus(422);

        $this->assertSame('75.00', Wallet::where('userId', $player->id)->value('balance'));
        $this->assertDatabaseCount('tournament_registrations', 1);
        $this->assertDatabaseHas('transactions', ['type' => Transaction::TYPE_ENTRY_FEE, 'amount' => -25]);
    }

    public function test_deposit_approval_is_idempotent(): void
    {
        $player = $this->user();
        $admin = $this->user(User::ROLE_ADMIN);
        $this->actingAs($player)->postJson('/api/wallet/deposit', ['amount' => 50, 'method' => 'bkash', 'transactionId' => 'TX-1'])->assertOk();
        $transaction = Transaction::firstOrFail();

        $this->actingAs($admin)->putJson("/api/payments/{$transaction->id}/status", ['status' => Transaction::STATUS_COMPLETED])->assertOk();
        $this->actingAs($admin)->putJson("/api/payments/{$transaction->id}/status", ['status' => Transaction::STATUS_COMPLETED])->assertOk();

        $this->assertSame('50.00', Wallet::where('userId', $player->id)->value('balance'));
    }

    public function test_rejected_withdrawal_refunds_reserved_balance_once(): void
    {
        $player = $this->user();
        $admin = $this->user(User::ROLE_ADMIN);
        Wallet::create(['userId' => $player->id, 'balance' => 200]);
        $this->actingAs($player)->postJson('/api/withdraw', ['amount' => 100, 'method' => 'bkash', 'mobileNumber' => '01700000000'])->assertOk();
        $withdrawal = \App\Models\WithdrawRequest::firstOrFail();
        $this->assertSame('100.00', Wallet::where('userId', $player->id)->value('balance'));

        $this->actingAs($admin)->putJson("/api/withdraw/{$withdrawal->id}", ['status' => 'REJECTED'])->assertOk();
        $this->actingAs($admin)->putJson("/api/withdraw/{$withdrawal->id}", ['status' => 'REJECTED'])->assertOk();
        $this->assertSame('200.00', Wallet::where('userId', $player->id)->value('balance'));
    }

    public function test_support_unread_state_is_viewer_aware_and_ticket_private(): void
    {
        Event::fake([SupportMessageCreated::class]);
        $player = $this->user();
        $otherPlayer = $this->user();
        $admin = $this->user(User::ROLE_ADMIN);

        $ticketId = $this->actingAs($player)->postJson('/api/support/tickets', [
            'subject' => 'Room help', 'message' => 'I cannot enter the room.',
        ])->assertCreated()->assertJsonPath('unreadCount', 0)->json('id');

        $this->actingAs($admin)->getJson('/api/support/tickets')
            ->assertOk()->assertJsonPath('0.unreadCount', 1);
        $this->actingAs($otherPlayer)->putJson("/api/support/tickets/{$ticketId}/read")
            ->assertForbidden();
        $this->actingAs($admin)->putJson("/api/support/tickets/{$ticketId}/read")
            ->assertOk()->assertJsonPath('unreadCount', 0);

        $this->actingAs($admin)->postJson("/api/support/tickets/{$ticketId}/replies", [
            'message' => 'Please try the updated password.',
        ])->assertOk()->assertJsonPath('unreadCount', 0);
        $this->actingAs($player)->getJson('/api/support/tickets')
            ->assertOk()->assertJsonPath('0.unreadCount', 1);
        $this->actingAs($player)->putJson("/api/support/tickets/{$ticketId}/read")
            ->assertOk()->assertJsonPath('unreadCount', 0);
    }

    public function test_admin_financial_report_uses_wallet_ledger_and_balance_adjustments_are_recorded(): void
    {
        $player = $this->user();
        $admin = $this->user(User::ROLE_ADMIN);
        $wallet = Wallet::create(['userId' => $player->id, 'balance' => 20]);

        $this->actingAs($admin)->patchJson("/api/admin/wallets/{$wallet->id}", ['balance' => 35])
            ->assertOk()->assertJsonPath('balance', '35.00');

        $this->assertDatabaseHas('transactions', [
            'walletId' => $wallet->id,
            'type' => Transaction::TYPE_ADJUSTMENT,
            'status' => Transaction::STATUS_COMPLETED,
            'amount' => 15,
        ]);
        $this->actingAs($admin)->getJson('/api/admin/financial-reports')
            ->assertOk()
            ->assertJsonPath('wallets.0.totalBalance', 35)
            ->assertJsonPath('transactions.0.type', Transaction::TYPE_ADJUSTMENT)
            ->assertJsonPath('transactions.0.amount', 15);
    }

    public function test_organizer_dashboard_and_match_updates_are_limited_to_owned_tournaments(): void
    {
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $otherOrganizer = $this->user(User::ROLE_ORGANIZER);
        $ownedTournament = $this->tournament($organizer);
        $otherTournament = $this->tournament($otherOrganizer, ['title' => 'Other Tournament']);
        $ownedMatch = MatchModel::create([
            'tournamentId' => $ownedTournament->id, 'matchNumber' => 1, 'stage' => 'QUALIFIER',
            'map' => 'Bermuda', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_SCHEDULED,
        ]);
        $otherMatch = MatchModel::create([
            'tournamentId' => $otherTournament->id, 'matchNumber' => 1, 'stage' => 'QUALIFIER',
            'map' => 'Purgatory', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_SCHEDULED,
        ]);

        $this->actingAs($organizer)->getJson('/api/management/dashboard')
            ->assertOk()->assertJsonPath('totalTournaments', 1)->assertJsonPath('totalMatches', 1);
        $this->actingAs($organizer)->patchJson("/api/matches/{$ownedMatch->id}", [
            'status' => MatchModel::STATUS_IN_PROGRESS, 'roomId' => 'ROOM-1', 'roomPassword' => 'PASS-1',
        ])->assertOk()->assertJsonPath('roomId', 'ROOM-1');
        $this->actingAs($organizer)->patchJson("/api/matches/{$otherMatch->id}", [
            'status' => MatchModel::STATUS_IN_PROGRESS,
        ])->assertForbidden();
    }

    public function test_leaderboard_is_derived_from_approved_result_claims(): void
    {
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer);
        $match = MatchModel::create([
            'tournamentId' => $tournament->id, 'matchNumber' => 1, 'stage' => 'FINAL',
            'map' => 'Bermuda', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_COMPLETED,
        ]);
        ResultClaim::create([
            'matchId' => $match->id, 'tournamentId' => $tournament->id, 'submittedById' => $player->id,
            'status' => ResultClaim::STATUS_APPROVED, 'placement' => 1, 'kills' => 3, 'proofPaths' => [],
        ]);

        $this->actingAs($player)->getJson('/api/leaderboard')
            ->assertOk()
            ->assertJsonPath('entries.0.rank', 1)
            ->assertJsonPath('entries.0.kills', 3)
            ->assertJsonPath('entries.0.points', 116)
            ->assertJsonPath('totalTeams', 1)
            ->assertJsonPath('totalMatches', 1);
    }

    public function test_team_member_can_accept_an_ign_invitation_but_cannot_join_a_second_team(): void
    {
        $captain = $this->user();
        $otherCaptain = $this->user();
        $member = $this->user();
        $member->update(['ign' => 'JoinPlayer']);
        $team = Team::create(['name' => 'Alpha Team', 'tag' => 'ALP', 'captainId' => $captain->id]);
        $otherTeam = Team::create(['name' => 'Beta Team', 'tag' => 'BET', 'captainId' => $otherCaptain->id]);

        $invitationId = $this->actingAs($captain)->postJson("/api/teams/{$team->id}/invite", ['ign' => 'JoinPlayer'])
            ->assertCreated()
            ->assertJsonPath('status', TeamMembership::STATUS_PENDING)
            ->json('id');

        $this->actingAs($member)->getJson('/api/teams/invitations/mine')
            ->assertOk()
            ->assertJsonPath('0.team.name', 'Alpha Team');
        $this->actingAs($member)->putJson("/api/teams/invitations/{$invitationId}", ['status' => TeamMembership::STATUS_ACCEPTED])
            ->assertOk()
            ->assertJsonPath('status', TeamMembership::STATUS_ACCEPTED);
        $this->actingAs($member)->getJson('/api/teams/my-team')
            ->assertOk()
            ->assertJsonPath('name', 'Alpha Team');

        $otherInvitationId = $this->actingAs($otherCaptain)->postJson("/api/teams/{$otherTeam->id}/invite", ['ign' => 'JoinPlayer'])
            ->assertCreated()
            ->json('id');
        $this->actingAs($member)->putJson("/api/teams/invitations/{$otherInvitationId}", ['status' => TeamMembership::STATUS_ACCEPTED])
            ->assertStatus(422)
            ->assertJsonPath('message', 'You are already part of another team.');
    }

    public function test_team_captain_can_revoke_pending_invitation_without_exposing_it_publicly(): void
    {
        $captain = $this->user();
        $invitee = $this->user();
        $viewer = $this->user();
        $invitee->update(['platformHandle' => 'pending-player']);
        $team = Team::create(['name' => 'Pending Team', 'tag' => 'PEN', 'captainId' => $captain->id]);
        $membershipId = $this->actingAs($captain)->postJson("/api/teams/{$team->id}/invite", ['platformHandle' => 'pending-player'])
            ->assertCreated()->json('id');

        $this->actingAs($viewer)->getJson("/api/teams/{$team->id}")->assertOk()->assertJsonCount(0, 'memberships');
        $this->actingAs($captain)->getJson("/api/teams/{$team->id}")->assertOk()->assertJsonPath('memberships.0.id', $membershipId);
        $this->actingAs($captain)->deleteJson("/api/teams/{$team->id}/invitations/{$membershipId}")->assertOk();
        $this->assertDatabaseMissing('team_memberships', ['id' => $membershipId]);
    }

    public function test_seeded_catalog_profiles_lineup_and_captain_check_in_flow(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $captain = $this->user();
        $member = $this->user();
        $captain->update(['platformHandle' => 'alpha-captain']);
        $member->update(['platformHandle' => 'alpha-member']);
        $game = Game::where('slug', 'free-fire')->firstOrFail();
        $mode = GameMode::where('gameId', $game->id)->where('slug', 'duo')->firstOrFail();

        $this->actingAs($captain)->getJson('/api/games')->assertOk()->assertJsonCount(4);
        $captainProfileId = $this->actingAs($captain)->postJson('/api/game-profiles', [
            'gameId' => $game->id, 'uid' => 'FF-1', 'ign' => 'CaptainIGN',
        ])->assertCreated()->json('id');
        $memberProfileId = $this->actingAs($member)->postJson('/api/game-profiles', [
            'gameId' => $game->id, 'uid' => 'FF-2', 'ign' => 'MemberIGN',
        ])->assertCreated()->json('id');
        foreach ([$captainProfileId, $memberProfileId] as $profileId) {
            $this->actingAs($admin)->patchJson("/api/admin/game-profiles/{$profileId}", ['verificationStatus' => UserGameProfile::STATUS_VERIFIED])->assertOk();
        }

        $teamId = $this->actingAs($captain)->postJson('/api/teams', ['name' => 'Arena Alpha', 'tag' => 'AA', 'gameId' => $game->id])
            ->assertCreated()->assertJsonPath('gameId', $game->id)->json('id');
        $membershipId = $this->actingAs($captain)->postJson("/api/teams/{$teamId}/invite", ['platformHandle' => 'alpha-member'])
            ->assertCreated()->json('id');
        $this->actingAs($member)->putJson("/api/teams/invitations/{$membershipId}", ['status' => TeamMembership::STATUS_ACCEPTED])->assertOk();

        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer, [
            'title' => 'Arena Duo', 'format' => 'DUO', 'gameId' => $game->id, 'gameModeId' => $mode->id,
            'requiresVerifiedProfile' => true, 'checkInEnabled' => true,
            'checkInOpensAt' => now()->subMinute(), 'checkInClosesAt' => now()->addHour(),
        ]);
        $this->actingAs($captain)->postJson("/api/tournaments/{$tournament->id}/join", [
            'gameProfileId' => $captainProfileId, 'starterUserIds' => [$captain->id, $member->id],
        ])->assertCreated()->assertJsonPath('registration.checkInStatus', 'PENDING');
        $this->assertDatabaseHas('tournament_lineup_members', ['userId' => $member->id, 'role' => 'STARTER']);
        $this->actingAs($organizer)->getJson("/api/tournaments/{$tournament->id}/lineups")
            ->assertOk()->assertJsonFragment(['userId' => $member->id, 'role' => 'STARTER']);
        $this->actingAs($this->user(User::ROLE_ORGANIZER))->getJson("/api/tournaments/{$tournament->id}/lineups")->assertForbidden();
        MatchModel::create([
            'tournamentId' => $tournament->id, 'matchNumber' => 1, 'stage' => 'QUALIFIER', 'map' => 'Bermuda',
            'scheduledTime' => now()->addHour(), 'status' => MatchModel::STATUS_SCHEDULED, 'roomId' => 'ROOM-PRIVATE', 'roomPassword' => 'PASS-PRIVATE',
        ]);
        $this->actingAs($member)->getJson('/api/matches/my-matches')
            ->assertOk()->assertJsonPath('0.roomId', null)->assertJsonPath('0.roomPassword', null);
        $this->actingAs($captain)->postJson("/api/tournaments/{$tournament->id}/check-in")
            ->assertOk()->assertJsonPath('checkInStatus', 'CHECKED_IN');
        $this->actingAs($captain)->postJson("/api/tournaments/{$tournament->id}/check-in")->assertStatus(422);
        $this->actingAs($member)->getJson('/api/matches/my-matches')
            ->assertOk()->assertJsonPath('0.roomId', 'ROOM-PRIVATE')->assertJsonPath('0.roomPassword', 'PASS-PRIVATE');
    }

    public function test_disabled_game_cannot_be_used_for_new_tournament(): void
    {
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $game = Game::where('slug', 'pubg-mobile')->firstOrFail();
        $game->update(['enabled' => false]);
        $this->actingAs($organizer)->postJson('/api/tournaments', [
            'title' => 'Disabled Game Cup', 'format' => 'SQUAD', 'gameId' => $game->id,
        ])->assertStatus(422)->assertJsonValidationErrors('gameId');
    }

    public function test_missed_captain_check_in_expires_registration_and_releases_slot(): void
    {
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer, [
            'registeredTeams' => 1,
            'checkInEnabled' => true,
            'checkInClosesAt' => now()->subMinute(),
        ]);
        $registration = TournamentRegistration::create([
            'tournamentId' => $tournament->id,
            'userId' => $player->id,
            'status' => TournamentRegistration::STATUS_APPROVED,
            'checkInStatus' => 'PENDING',
        ]);

        Artisan::call('tournaments:expire-check-ins');

        $this->assertSame(TournamentRegistration::STATUS_EXPIRED, $registration->fresh()->status);
        $this->assertSame('EXPIRED', $registration->fresh()->checkInStatus);
        $this->assertSame(0, $tournament->fresh()->registeredTeams);
    }

    public function test_check_in_reminder_command_is_idempotent(): void
    {
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer, [
            'checkInEnabled' => true,
            'checkInOpensAt' => now()->subMinute(),
            'checkInClosesAt' => now()->addHour(),
        ]);
        $registration = TournamentRegistration::create([
            'tournamentId' => $tournament->id,
            'userId' => $player->id,
            'status' => TournamentRegistration::STATUS_APPROVED,
            'checkInStatus' => 'PENDING',
        ]);

        Artisan::call('tournaments:send-check-in-reminders');
        Artisan::call('tournaments:send-check-in-reminders');

        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'userId' => $player->id,
            'type' => 'CHECK_IN_REQUIRED',
            'dedupeKey' => 'checkin-reminder:'.$registration->id.':user:'.$player->id,
        ]);
    }

    public function test_room_ready_notification_is_private_and_idempotent(): void
    {
        $player = $this->user();
        $outsider = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer);
        TournamentRegistration::create([
            'tournamentId' => $tournament->id,
            'userId' => $player->id,
            'status' => TournamentRegistration::STATUS_APPROVED,
        ]);
        $match = MatchModel::create([
            'tournamentId' => $tournament->id, 'matchNumber' => 1, 'stage' => 'FINAL',
            'map' => 'Bermuda', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_SCHEDULED,
        ]);

        $payload = ['roomId' => 'ROOM-READY', 'roomPassword' => 'PASS-READY'];
        $this->actingAs($organizer)->patchJson("/api/matches/{$match->id}", $payload)->assertOk();
        $this->actingAs($organizer)->patchJson("/api/matches/{$match->id}", $payload)->assertOk();

        $this->assertSame(1, Notification::where('userId', $player->id)->where('type', 'ROOM_AVAILABLE')->count());
        $this->assertSame(0, Notification::where('userId', $outsider->id)->count());
        $this->assertDatabaseMissing('notifications', ['message' => 'PASS-READY']);
    }

    public function test_reward_approval_credit_and_notification_are_idempotent(): void
    {
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer);
        $match = MatchModel::create([
            'tournamentId' => $tournament->id, 'matchNumber' => 1, 'stage' => 'FINAL',
            'map' => 'Bermuda', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_COMPLETED,
        ]);
        $claim = ResultClaim::create([
            'matchId' => $match->id, 'tournamentId' => $tournament->id, 'submittedById' => $player->id,
            'status' => ResultClaim::STATUS_PENDING, 'placement' => 1, 'kills' => 3, 'proofPaths' => [],
        ]);
        ResultClaimReward::create(['claimId' => $claim->id, 'userId' => $player->id, 'suggestedAmount' => 125]);

        $payload = ['status' => ResultClaim::STATUS_APPROVED];
        $this->actingAs($organizer)->putJson("/api/management/result-claims/{$claim->id}", $payload)->assertOk();
        $this->actingAs($organizer)->putJson("/api/management/result-claims/{$claim->id}", $payload)->assertOk();

        $this->assertSame('125.00', Wallet::where('userId', $player->id)->value('balance'));
        $this->assertSame(1, Notification::where('userId', $player->id)->where('type', 'REWARD_CREDITED')->count());
        $this->assertSame(1, Transaction::where('reference', 'claim:'.$claim->id.':user:'.$player->id)->count());
    }

    public function test_efootball_claim_accepts_scoreline_payload_and_preserves_reward_compatibility(): void
    {
        Storage::fake('public');
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $game = Game::where('slug', 'efootball')->firstOrFail();
        $mode = GameMode::where('gameId', $game->id)->firstOrFail();
        $profileId = $this->actingAs($player)->postJson('/api/game-profiles', [
            'gameId' => $game->id, 'uid' => 'EF-1', 'ign' => 'Arena Striker',
        ])->assertCreated()->json('id');
        $tournament = $this->tournament($organizer, [
            'title' => 'Arena Football', 'gameId' => $game->id, 'gameModeId' => $mode->id,
            'prizeDistribution' => ['1' => 500],
        ]);
        $this->actingAs($player)->postJson("/api/tournaments/{$tournament->id}/join", ['gameProfileId' => $profileId])->assertCreated();
        $match = MatchModel::create([
            'tournamentId' => $tournament->id, 'matchNumber' => 1, 'stage' => 'FINAL',
            'map' => 'Online Friendly', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_COMPLETED,
        ]);

        $this->actingAs($player)->post("/api/matches/{$match->id}/result-claims", [
            'homeScore' => 3, 'awayScore' => 1, 'proofs' => [UploadedFile::fake()->image('scoreline.jpg')],
        ])->assertCreated()
            ->assertJsonPath('placement', 1)
            ->assertJsonPath('kills', 0)
            ->assertJsonPath('resultPayload.type', 'SCORELINE')
            ->assertJsonPath('resultPayload.winner', 'HOME')
            ->assertJsonPath('rewards.0.suggestedAmount', '500.00');
    }

    public function test_duplicate_result_claim_for_same_match_is_rejected(): void
    {
        Storage::fake('public');
        $player = $this->user();
        $organizer = $this->user(User::ROLE_ORGANIZER);
        $tournament = $this->tournament($organizer);
        $this->actingAs($player)->postJson("/api/tournaments/{$tournament->id}/join", ['ffUid' => 'DUP-1'])->assertCreated();
        $match = MatchModel::create([
            'tournamentId' => $tournament->id, 'matchNumber' => 1, 'stage' => 'FINAL',
            'map' => 'Bermuda', 'scheduledTime' => now(), 'status' => MatchModel::STATUS_COMPLETED,
        ]);

        $payload = ['placement' => 1, 'kills' => 2, 'proofs' => [UploadedFile::fake()->image('result.jpg')]];
        $this->actingAs($player)->post("/api/matches/{$match->id}/result-claims", $payload)->assertCreated();
        $this->actingAs($player)->post("/api/matches/{$match->id}/result-claims", [
            'placement' => 1, 'kills' => 2, 'proofs' => [UploadedFile::fake()->image('result-again.jpg')],
        ])->assertStatus(422)->assertJsonValidationErrors('claim');
    }

    private function user(string $role = User::ROLE_PLAYER): User
    {
        return User::create(['name' => fake()->name(), 'email' => fake()->unique()->safeEmail(), 'password' => Hash::make('secret'), 'role' => $role]);
    }

    private function tournament(User $organizer, array $overrides = []): Tournament
    {
        return Tournament::create([...[
            'title' => 'Test Tournament', 'format' => 'SOLO', 'organizerId' => $organizer->id,
            'status' => Tournament::STATUS_REGISTRATION_OPEN, 'maxTeams' => 16, 'entryFee' => 0, 'isFree' => true,
        ], ...$overrides]);
    }
}
