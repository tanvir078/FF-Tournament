<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasUuid;

    protected $table = 'transactions';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['walletId', 'type', 'status', 'amount', 'description', 'reference', 'screenshotPath', 'metadata'];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function getCreatedAtColumn()
    {
        return 'createdAt';
    }

    public function getUpdatedAtColumn()
    {
        return 'updatedAt';
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'walletId');
    }

    const TYPE_ENTRY_FEE = 'ENTRY_FEE';
    const TYPE_DEPOSIT = 'DEPOSIT';
    const TYPE_WITHDRAWAL = 'WITHDRAWAL';
    const TYPE_PRIZE = 'PRIZE';
    const TYPE_REFUND = 'REFUND';
    const TYPE_ADJUSTMENT = 'ADJUSTMENT';

    const STATUS_PENDING = 'PENDING';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_FAILED = 'FAILED';
}
