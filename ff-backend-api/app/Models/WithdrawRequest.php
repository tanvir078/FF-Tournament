<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class WithdrawRequest extends Model
{
    use HasUuid;

    protected $table = 'withdraw_requests';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'userId', 'amount', 'method', 'accountNumber', 'accountName', 'bankName',
        'mobileNumber', 'transactionId', 'status', 'rejectionReason', 'adminNote', 'processedAt'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processedAt' => 'datetime',
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

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    const STATUS_PENDING = 'PENDING';
    const STATUS_APPROVED = 'APPROVED';
    const STATUS_REJECTED = 'REJECTED';
}
