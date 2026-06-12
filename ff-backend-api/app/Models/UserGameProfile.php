<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class UserGameProfile extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['userId', 'gameId', 'uid', 'ign', 'region', 'verificationStatus', 'adminNote', 'reviewedById', 'reviewedAt'];
    protected $casts = ['reviewedAt' => 'datetime'];
    public function user() { return $this->belongsTo(User::class, 'userId'); }
    public function game() { return $this->belongsTo(Game::class, 'gameId'); }

    const STATUS_UNVERIFIED = 'UNVERIFIED';
    const STATUS_VERIFIED = 'VERIFIED';
    const STATUS_REJECTED = 'REJECTED';
}
