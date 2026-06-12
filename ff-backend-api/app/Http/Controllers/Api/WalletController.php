<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\WithdrawRequest;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    public function show(Request $request)
    {
        $wallet = Wallet::firstOrCreate(['userId' => $request->user()->id]);
        return response()->json([
            ...$wallet->load('user')->toArray(),
            'totalBalance' => $wallet->balance,
            'totalDeposits' => $wallet->totalDeposited,
            'totalWithdrawals' => $wallet->totalWithdrawn,
        ]);
    }

    public function transactions(Request $request)
    {
        $wallet = Wallet::firstOrCreate(['userId' => $request->user()->id]);

        return response()->json(
            Transaction::where('walletId', $wallet->id)
                ->orderByDesc('createdAt')
                ->get()
        );
    }

    public function deposit(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10',
            'method' => 'nullable|string',
            'transactionId' => 'required|string|max:255|unique:transactions,reference',
        ]);

        $wallet = Wallet::firstOrCreate(['userId' => $request->user()->id]);

        Transaction::create([
            'walletId' => $wallet->id,
            'type' => Transaction::TYPE_DEPOSIT,
            'amount' => $validated['amount'],
            'status' => Transaction::STATUS_PENDING,
            'description' => 'Deposit via ' . ($validated['method'] ?? 'manual'),
            'reference' => $validated['transactionId'],
            'metadata' => ['method' => $validated['method'] ?? 'manual'],
        ]);

        return response()->json(['message' => 'Deposit request submitted']);
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'method' => 'required|string',
            'accountNumber' => 'nullable|string',
            'mobileNumber' => 'nullable|string',
        ]);

        $wallet = Wallet::firstOrCreate(['userId' => $request->user()->id]);

        if ($wallet->balance < $validated['amount']) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }

        $withdrawal = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $wallet, $request) {
            $wallet = Wallet::whereKey($wallet->id)->lockForUpdate()->firstOrFail();
            if ((float) $wallet->balance < (float) $validated['amount']) {
                abort(422, 'Insufficient balance');
            }
            $wallet->decrement('balance', $validated['amount']);
            $transaction = Transaction::create([
                'walletId' => $wallet->id,
                'type' => Transaction::TYPE_WITHDRAWAL,
                'amount' => -$validated['amount'],
                'status' => Transaction::STATUS_PENDING,
                'description' => 'Withdrawal request',
                'reference' => 'withdrawal:'.\Illuminate\Support\Str::uuid(),
            ]);
            return WithdrawRequest::create([
                ...$validated,
                'userId' => $request->user()->id,
                'transactionId' => $transaction->id,
                'status' => WithdrawRequest::STATUS_PENDING,
            ]);
        });

        return response()->json([
            'message' => 'Withdrawal request submitted',
            'withdrawal' => $withdrawal,
        ]);
    }
}
