<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function debit(string $userId, float $amount, string $type, string $reference, string $description): Transaction
    {
        return DB::transaction(function () use ($userId, $amount, $type, $reference, $description) {
            $wallet = $this->lockedWallet($userId);
            $existing = Transaction::where('walletId', $wallet->id)
                ->where('type', $type)
                ->where('reference', $reference)
                ->first();
            if ($existing) {
                return $existing;
            }
            if ((float) $wallet->balance < $amount) {
                throw ValidationException::withMessages(['wallet' => 'Insufficient wallet balance.']);
            }

            $wallet->decrement('balance', $amount);
            return Transaction::create([
                'walletId' => $wallet->id,
                'type' => $type,
                'status' => Transaction::STATUS_COMPLETED,
                'amount' => -$amount,
                'description' => $description,
                'reference' => $reference,
            ]);
        });
    }

    public function credit(string $userId, float $amount, string $type, string $reference, string $description): Transaction
    {
        return DB::transaction(function () use ($userId, $amount, $type, $reference, $description) {
            $wallet = $this->lockedWallet($userId);
            $existing = Transaction::where('walletId', $wallet->id)
                ->where('type', $type)
                ->where('reference', $reference)
                ->first();
            if ($existing) {
                return $existing;
            }

            $wallet->increment('balance', $amount);
            if ($type === Transaction::TYPE_DEPOSIT) {
                $wallet->increment('totalDeposited', $amount);
            }

            return Transaction::create([
                'walletId' => $wallet->id,
                'type' => $type,
                'status' => Transaction::STATUS_COMPLETED,
                'amount' => $amount,
                'description' => $description,
                'reference' => $reference,
            ]);
        });
    }

    public function lockedWallet(string $userId): Wallet
    {
        Wallet::firstOrCreate(['userId' => $userId]);

        return Wallet::where('userId', $userId)->lockForUpdate()->firstOrFail();
    }
}
