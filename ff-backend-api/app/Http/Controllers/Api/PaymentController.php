<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function __construct(private WalletService $wallets) {}

    public function index(Request $request)
    {
        $query = Transaction::with('wallet.user')->where('type', Transaction::TYPE_DEPOSIT)->orderByDesc('createdAt');
        if ($request->status) $query->where('status', $request->status);
        return response()->json($query->paginate((int) $request->input('limit', 20)));
    }

    public function byTournament($id)
    {
        return response()->json([]);
    }

    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate(['status' => ['required', Rule::in([Transaction::STATUS_COMPLETED, Transaction::STATUS_FAILED])]]);
        return DB::transaction(function () use ($id, $data) {
            $transaction = Transaction::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_unless($transaction->type === Transaction::TYPE_DEPOSIT, 422, 'Only deposits can be reviewed here.');
            if ($transaction->status !== Transaction::STATUS_PENDING) return response()->json($transaction);

            if ($data['status'] === Transaction::STATUS_COMPLETED) {
                $wallet = Wallet::whereKey($transaction->walletId)->lockForUpdate()->firstOrFail();
                $wallet->increment('balance', $transaction->amount);
                $wallet->increment('totalDeposited', $transaction->amount);
            }
            $transaction->update($data);
            return response()->json($transaction->fresh('wallet.user'));
        });
    }
}
