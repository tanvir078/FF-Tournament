<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\WithdrawController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TeamChallengeController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\BracketController;
use App\Http\Controllers\Api\ResultClaimController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\PlatformSettingController;
use App\Http\Controllers\Api\UserGameProfileController;
use App\Http\Controllers\Api\SocialAuthController;

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/admin/login', [AuthController::class, 'adminLogin']);
Route::get('auth/social/{provider}/redirect', [SocialAuthController::class, 'redirect']);
Route::post('auth/social/{provider}/callback', [SocialAuthController::class, 'callback']);
Route::get('support/settings', [SupportTicketController::class, 'settings']);
Route::get('platform/settings', [PlatformSettingController::class, 'show']);
Route::get('games', [GameController::class, 'index']);
Route::get('games/{slug}', [GameController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::middleware('role:ADMIN,ORGANIZER')->get('management/dashboard', [AdminController::class, 'dashboard']);
});

Route::middleware(['auth:sanctum', 'role:ADMIN'])->prefix('admin')->group(function () {
    Route::get('dashboard', [AdminController::class, 'dashboard']);
    Route::get('dashboard/revenue-chart', [AdminController::class, 'revenueChart']);
    Route::get('analytics/activity', [AdminController::class, 'activity']);
    Route::get('financial-reports', [AdminController::class, 'financialReports']);
    Route::post('games', [GameController::class, 'store']);
    Route::patch('games/{id}', [GameController::class, 'update']);
    Route::delete('games/{id}', [GameController::class, 'destroy']);
    Route::post('games/{gameId}/modes', [GameController::class, 'storeMode']);
    Route::patch('games/{gameId}/modes/{id}', [GameController::class, 'updateMode']);
    Route::delete('games/{gameId}/modes/{id}', [GameController::class, 'destroyMode']);
    Route::post('games/{gameId}/maps', [GameController::class, 'storeMap']);
    Route::patch('games/{gameId}/maps/{id}', [GameController::class, 'updateMap']);
    Route::delete('games/{gameId}/maps/{id}', [GameController::class, 'destroyMap']);
    Route::patch('platform/settings', [PlatformSettingController::class, 'update']);
    Route::get('game-profiles', [UserGameProfileController::class, 'managed']);
    Route::patch('game-profiles/{id}', [UserGameProfileController::class, 'review']);
    Route::get('users', [AdminController::class, 'users']);
    Route::get('users/{id}', [AdminController::class, 'showUser']);
    Route::put('users/{id}', [AdminController::class, 'updateUser']);
    Route::put('users/{id}/ban', [AdminController::class, 'banUser']);
    Route::put('users/{id}/unban', [AdminController::class, 'unbanUser']);
    Route::get('tournaments', [AdminController::class, 'tournaments']);
    Route::patch('tournaments/{id}', [AdminController::class, 'updateTournament']);
    Route::delete('tournaments/{id}', [AdminController::class, 'destroyTournament']);
    Route::patch('wallets/{id}', [AdminController::class, 'updateWallet']);
    Route::patch('participants/{id}', [AdminController::class, 'updateParticipant']);
    Route::post('matches/{id}/publish', [AdminController::class, 'publishResults']);
    Route::patch('rooms/{id}', [AdminController::class, 'updateRoom']);
    Route::patch('payments/{id}', [PaymentController::class, 'updateStatus']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:ADMIN')->get('payments', [PaymentController::class, 'index']);
    Route::middleware('role:ADMIN')->get('payments/tournament/{id}', [PaymentController::class, 'byTournament']);
    Route::middleware('role:ADMIN')->put('payments/{id}/status', [PaymentController::class, 'updateStatus']);

    Route::post('team-challenges', [TeamChallengeController::class, 'store']);
    Route::get('team-challenges/pending', [TeamChallengeController::class, 'pending']);
    Route::get('team-challenges/my-challenges', [TeamChallengeController::class, 'mine']);
    Route::post('team-challenges/{id}/accept', [TeamChallengeController::class, 'accept']);
    Route::post('team-challenges/{id}/reject', [TeamChallengeController::class, 'reject']);
    Route::post('team-challenges/{id}/cancel', [TeamChallengeController::class, 'cancel']);

    Route::get('support/tickets', [SupportTicketController::class, 'index']);
    Route::post('support/tickets', [SupportTicketController::class, 'store']);
    Route::post('support/tickets/{id}/replies', [SupportTicketController::class, 'reply']);
    Route::put('support/tickets/{id}/read', [SupportTicketController::class, 'markRead']);
    Route::middleware('role:ADMIN')->put('support/settings', [SupportTicketController::class, 'updateSettings']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('sponsors', [SponsorController::class, 'index']);
    Route::post('sponsors/apply', [SponsorController::class, 'apply']);
    Route::middleware('role:ADMIN')->post('sponsors', [SponsorController::class, 'store']);
    Route::middleware('role:ADMIN')->put('sponsors/{id}', [SponsorController::class, 'update']);
    Route::middleware('role:ADMIN')->delete('sponsors/{id}', [SponsorController::class, 'destroy']);

    Route::get('banners', [BannerController::class, 'index']);
    Route::middleware('role:ADMIN')->post('banners', [BannerController::class, 'store']);
    Route::middleware('role:ADMIN')->put('banners/{id}', [BannerController::class, 'update']);
    Route::middleware('role:ADMIN')->put('banners/{id}/order', [BannerController::class, 'updateOrder']);
    Route::middleware('role:ADMIN')->put('banners/{id}/toggle', [BannerController::class, 'toggle']);
    Route::middleware('role:ADMIN')->delete('banners/{id}', [BannerController::class, 'destroy']);

    Route::get('notices', [NoticeController::class, 'index']);
    Route::middleware('role:ADMIN')->post('notices', [NoticeController::class, 'store']);
    Route::middleware('role:ADMIN')->put('notices/{id}', [NoticeController::class, 'update']);
    Route::middleware('role:ADMIN')->put('notices/{id}/toggle', [NoticeController::class, 'toggle']);
    Route::middleware('role:ADMIN')->put('notices/{id}/pin', [NoticeController::class, 'pin']);
    Route::middleware('role:ADMIN')->delete('notices/{id}', [NoticeController::class, 'destroy']);

    Route::middleware('role:ADMIN')->get('withdraw', [WithdrawController::class, 'index']);
    Route::middleware('role:ADMIN')->get('withdraw/stats', [WithdrawController::class, 'stats']);
    Route::middleware('role:ADMIN')->put('withdraw/{id}', [WithdrawController::class, 'update']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('users/profile', [UserController::class, 'profile']);
    Route::put('users/profile', [UserController::class, 'updateProfile']);
    Route::put('users/change-password', [UserController::class, 'changePassword']);
    Route::middleware('role:ADMIN,ORGANIZER')->get('users', [UserController::class, 'index']);
    Route::get('game-profiles/mine', [UserGameProfileController::class, 'mine']);
    Route::post('game-profiles', [UserGameProfileController::class, 'store']);
    Route::patch('game-profiles/{id}', [UserGameProfileController::class, 'update']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('teams', [TeamController::class, 'index']);
    Route::post('teams', [TeamController::class, 'store']);
    Route::get('teams/my-team', [TeamController::class, 'myTeam']);
    Route::get('teams/invitations/mine', [TeamController::class, 'invitations']);
    Route::put('teams/invitations/{id}', [TeamController::class, 'respond']);
    Route::get('teams/{id}', [TeamController::class, 'show']);
    Route::put('teams/{id}', [TeamController::class, 'update']);
    Route::post('teams/{id}/invite', [TeamController::class, 'invite']);
    Route::delete('teams/{id}/invitations/{membershipId}', [TeamController::class, 'revokeInvitation']);
    Route::post('teams/{id}/leave', [TeamController::class, 'leave']);
    Route::delete('teams/{id}/players/{playerId}', [TeamController::class, 'removePlayer']);
    Route::delete('teams/{id}', [TeamController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('tournaments/featured', [TournamentController::class, 'featured']);
    Route::get('tournaments/my-registrations', [TournamentController::class, 'myRegistrations']);
    Route::get('tournaments', [TournamentController::class, 'index']);
    Route::get('tournaments/{id}', [TournamentController::class, 'show']);
    Route::get('tournaments/{id}/bracket', [TournamentController::class, 'bracket']);
    Route::get('tournaments/{id}/registration-status', [TournamentController::class, 'registrationStatus']);
    Route::middleware('role:ORGANIZER,ADMIN')->get('tournaments/{id}/registrations', [TournamentController::class, 'registrations']);
    Route::middleware('role:ORGANIZER,ADMIN')->get('tournaments/{id}/lineups', [TournamentController::class, 'lineups']);
    Route::middleware('role:ORGANIZER,ADMIN')->get('management/tournaments', [TournamentController::class, 'managed']);
    Route::middleware('role:ORGANIZER,ADMIN')->get('management/registrations', [TournamentController::class, 'managedRegistrations']);
    Route::middleware('role:ORGANIZER,ADMIN')->post('tournaments', [TournamentController::class, 'store']);
    Route::middleware('role:ORGANIZER,ADMIN')->put('tournaments/{id}', [TournamentController::class, 'update']);
    Route::post('tournaments/{id}/join', [TournamentController::class, 'join']);
    Route::post('tournaments/{id}/register', [TournamentController::class, 'register']);
    Route::post('tournaments/{id}/check-in', [TournamentController::class, 'checkIn']);
    Route::middleware('role:ORGANIZER,ADMIN')->put('tournaments/{id}/status', [TournamentController::class, 'updateStatus']);
    Route::middleware('role:ORGANIZER,ADMIN')->put('tournaments/registrations/{id}/approve', [TournamentController::class, 'approveRegistration']);
    Route::middleware('role:ORGANIZER,ADMIN')->put('tournaments/registrations/{id}/reject', [TournamentController::class, 'rejectRegistration']);
    Route::middleware('role:ORGANIZER,ADMIN')->post('tournaments/{id}/bracket/generate', [BracketController::class, 'generate']);
    Route::middleware('role:ORGANIZER,ADMIN')->post('matches/{id}/winner', [BracketController::class, 'winner']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('matches', [MatchController::class, 'index']);
    Route::get('matches/my-matches', [MatchController::class, 'myMatches']);
    Route::get('matches/by-tournament/{id}', [MatchController::class, 'byTournament']);
    Route::middleware('role:ORGANIZER,ADMIN')->post('matches', [MatchController::class, 'store']);
    Route::middleware('role:ORGANIZER,ADMIN')->patch('matches/{id}', [MatchController::class, 'update']);
    Route::get('matches/{id}', [MatchController::class, 'show']);
    Route::middleware('role:ORGANIZER,ADMIN')->get('management/rooms', [MatchController::class, 'rooms']);
    Route::middleware('role:ORGANIZER,ADMIN')->patch('management/rooms/{id}', [MatchController::class, 'updateRoom']);
    Route::get('result-claims/mine', [ResultClaimController::class, 'mine']);
    Route::get('leaderboard', [LeaderboardController::class, 'index']);
    Route::middleware('role:ORGANIZER,ADMIN')->get('management/result-claims', [ResultClaimController::class, 'managed']);
    Route::post('matches/{id}/result-claims', [ResultClaimController::class, 'store']);
    Route::middleware('role:ORGANIZER,ADMIN')->put('management/result-claims/{id}', [ResultClaimController::class, 'review']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('wallet', [WalletController::class, 'show']);
    Route::get('wallet/user', [WalletController::class, 'show']);
    Route::get('wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('wallet/deposit', [WalletController::class, 'deposit']);
    Route::post('withdraw', [WalletController::class, 'withdraw']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
