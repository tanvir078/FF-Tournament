<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ResultClaimReward extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['claimId', 'userId', 'suggestedAmount', 'approvedAmount', 'transactionId'];
    protected $casts = ['suggestedAmount' => 'decimal:2', 'approvedAmount' => 'decimal:2'];

    public function user() { return $this->belongsTo(User::class, 'userId'); }
}
