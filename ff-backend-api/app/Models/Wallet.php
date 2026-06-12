<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasUuid;

    protected $table = 'wallets';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['userId', 'teamId', 'balance', 'totalDeposited', 'totalWithdrawn', 'status'];

    protected $casts = [
        'balance' => 'decimal:2',
        'totalDeposited' => 'decimal:2',
        'totalWithdrawn' => 'decimal:2',
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
}
