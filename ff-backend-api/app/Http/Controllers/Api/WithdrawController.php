<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\WithdrawRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WithdrawController extends Controller
{
    public function index(Request $request)
    {
        $query = WithdrawRequest::with('user')->orderByDesc('createdAt');
        if ($request->status) $query->where('status', $request->status);
        return response()->json($query->get());
    }

    public function stats()
    {
        return response()->json([
            'total' => WithdrawRequest::count(),
            'pending' => WithdrawRequest::where('status', WithdrawRequest::STATUS_PENDING)->count(),
            'approved' => WithdrawRequest::where('status', WithdrawRequest::STATUS_APPROVED)->count(),
            'rejected' => WithdrawRequest::where('status', WithdrawRequest::STATUS_REJECTED)->count(),
            'totalProcessedAmount' => WithdrawRequest::where('status', WithdrawRequest::STATUS_APPROVED)->sum('amount'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([WithdrawRequest::STATUS_APPROVED, WithdrawRequest::STATUS_REJECTED])],
            'rejectionReason' => 'nullable|string',
            'adminNote' => 'nullable|string',
        ]);
        return DB::transaction(function () use ($id, $data) {
            $withdrawal = WithdrawRequest::whereKey($id)->lockForUpdate()->firstOrFail();
            if ($withdrawal->status !== WithdrawRequest::STATUS_PENDING) return response()->json($withdrawal);
            $transaction = Transaction::whereKey($withdrawal->transactionId)->lockForUpdate()->firstOrFail();
            $wallet = Wallet::where('userId', $withdrawal->userId)->lockForUpdate()->firstOrFail();

            if ($data['status'] === WithdrawRequest::STATUS_APPROVED) {
                $transaction->update(['status' => Transaction::STATUS_COMPLETED]);
                $wallet->increment('totalWithdrawn', $withdrawal->amount);
            } else {
                $transaction->update(['status' => Transaction::STATUS_FAILED]);
                $wallet->increment('balance', $withdrawal->amount);
            }
            $withdrawal->update([...$data, 'processedAt' => now()]);
            return response()->json($withdrawal->fresh('user'));
        });
    }
}
