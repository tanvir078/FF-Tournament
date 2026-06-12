<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\TournamentRegistration;
use App\Models\WithdrawRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $tournaments = Tournament::query();
        $matches = MatchModel::query();
        $registrations = TournamentRegistration::query();
        if ($request->user()->role === User::ROLE_ORGANIZER) {
            $tournaments->where('organizerId', $request->user()->id);
            $matches->whereHas('tournament', fn ($query) => $query->where('organizerId', $request->user()->id));
            $registrations->whereHas('tournament', fn ($query) => $query->where('organizerId', $request->user()->id));
        }
        $totalTournaments = (clone $tournaments)->count();
        $completedTournaments = (clone $tournaments)->where('status', Tournament::STATUS_COMPLETED)->count();
        $isAdmin = $request->user()->role === User::ROLE_ADMIN;

        return response()->json([
            'totalUsers' => $isAdmin ? User::count() : (clone $registrations)->distinct()->count('userId'),
            'totalTeams' => $isAdmin ? Team::count() : (clone $registrations)->distinct()->count('userId'),
            'totalTournaments' => $totalTournaments,
            'totalMatches' => (clone $matches)->count(),
            'activeTournaments' => (clone $tournaments)->where('status', Tournament::STATUS_IN_PROGRESS)->count(),
            'registrationOpenTournaments' => (clone $tournaments)->where('status', Tournament::STATUS_REGISTRATION_OPEN)->count(),
            'completedTournaments' => $completedTournaments,
            'totalRevenue' => $isAdmin ? Transaction::where('type', Transaction::TYPE_DEPOSIT)
                ->where('status', Transaction::STATUS_COMPLETED)
                ->sum('amount') : 0,
            'walletBalance' => $isAdmin ? Wallet::sum('balance') : 0,
            'thisMonthRevenue' => 0,
            'lastMonthRevenue' => 0,
            'revenueGrowth' => 0,
            'pendingWithdrawals' => $isAdmin ? WithdrawRequest::where('status', WithdrawRequest::STATUS_PENDING)->count() : 0,
            'pendingDeposits' => $isAdmin ? Transaction::where('type', Transaction::TYPE_DEPOSIT)->where('status', Transaction::STATUS_PENDING)->count() : 0,
            'totalDeposited' => $isAdmin ? Wallet::sum('totalDeposited') : 0,
            'totalWithdrawn' => $isAdmin ? Wallet::sum('totalWithdrawn') : 0,
            'newUsersLast7Days' => 0,
            'newUsersLast30Days' => 0,
            'newTournamentsLast30Days' => (clone $tournaments)->where('createdAt', '>=', now()->subDays(30))->count(),
            'revenueBreakdown' => ['bkash' => 0, 'nagad' => 0, 'stripe' => 0],
            'tournamentCompletionRate' => $totalTournaments ? round(($completedTournaments / $totalTournaments) * 100, 1) : 0,
            'userGrowth' => ['last7Days' => 0, 'last30Days' => 0],
            'tournamentParticipation' => [
                'totalRegistrations' => (clone $registrations)->count(),
                'averagePerTournament' => $totalTournaments ? round((clone $registrations)->count() / $totalTournaments, 1) : 0,
            ],
            'topOrganizers' => [],
        ]);
    }

    public function activity()
    {
        return response()->json([]);
    }

    public function revenueChart()
    {
        return response()->json([]);
    }

    public function financialReports()
    {
        return response()->json([
            'wallets' => Wallet::with('user')->orderByDesc('createdAt')->get()->map(fn (Wallet $wallet) => [
                'id' => $wallet->id,
                'userId' => $wallet->userId,
                'username' => $wallet->user?->ign ?: $wallet->user?->name ?: 'Unknown user',
                'email' => $wallet->user?->email ?: '',
                'mainWallet' => (float) $wallet->balance,
                'winningWallet' => 0,
                'referralWallet' => 0,
                'totalBalance' => (float) $wallet->balance,
                'totalDeposits' => (float) $wallet->totalDeposited,
                'totalWithdrawals' => (float) $wallet->totalWithdrawn,
                'status' => $wallet->status,
            ]),
            'transactions' => Transaction::with('wallet.user')->orderByDesc('createdAt')->limit(100)->get()->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'userId' => $transaction->wallet?->userId,
                'username' => $transaction->wallet?->user?->ign ?: $transaction->wallet?->user?->name ?: 'Unknown user',
                'type' => $transaction->type,
                'amount' => (float) $transaction->amount,
                'walletType' => 'main',
                'status' => $transaction->status,
                'date' => $transaction->createdAt,
                'description' => $transaction->description,
            ]),
        ]);
    }

    public function users()
    {
        return response()->json(User::orderByDesc('createdAt')->get());
    }

    public function showUser($id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['name', 'phone', 'role', 'uid', 'ign', 'avatar']));
        return response()->json($user);
    }

    public function banUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['isBanned' => true, 'banReason' => $request->input('reason')]);
        return response()->json($user);
    }

    public function unbanUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['isBanned' => false, 'banReason' => null]);
        return response()->json($user);
    }

    public function tournaments()
    {
        return response()->json(Tournament::orderByDesc('createdAt')->get());
    }

    public function updateTournament(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $tournament->update($request->only(['status']));
        return response()->json($tournament);
    }

    public function destroyTournament($id)
    {
        Tournament::findOrFail($id)->delete();
        return response()->json(['message' => 'Tournament deleted']);
    }

    public function updateWallet(Request $request, $id)
    {
        $data = $request->validate([
            'balance' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:ACTIVE,FROZEN,BANNED',
        ]);
        return DB::transaction(function () use ($request, $id, $data) {
            $wallet = Wallet::whereKey($id)->lockForUpdate()->firstOrFail();
            if (array_key_exists('balance', $data)) {
                $difference = round((float) $data['balance'] - (float) $wallet->balance, 2);
                if ($difference !== 0.0) {
                    Transaction::create([
                        'walletId' => $wallet->id,
                        'type' => Transaction::TYPE_ADJUSTMENT,
                        'status' => Transaction::STATUS_COMPLETED,
                        'amount' => $difference,
                        'description' => 'Admin wallet balance adjustment',
                        'reference' => 'admin-adjustment:'.Str::uuid(),
                        'metadata' => ['adminId' => $request->user()->id],
                    ]);
                }
            }
            $wallet->update($data);
            return response()->json($wallet->fresh());
        });
    }

    public function updateParticipant(Request $request, $id)
    {
        $registration = TournamentRegistration::findOrFail($id);
        $registration->update($request->only(['status']));
        return response()->json($registration);
    }

    public function publishResults(Request $request, $id)
    {
        $match = MatchModel::findOrFail($id);
        $match->update(['results' => $request->input('results', []), 'status' => 'COMPLETED']);
        return response()->json($match);
    }

    public function updateRoom(Request $request, $id)
    {
        $match = MatchModel::findOrFail($id);
        $match->update([
            'roomId' => $request->input('roomId', $match->roomId),
            'roomPassword' => $request->input('password', $match->roomPassword),
        ]);
        return response()->json($match);
    }
}
