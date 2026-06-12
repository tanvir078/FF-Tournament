<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuid;

    protected $table = 'users';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'email', 'password', 'name', 'phone', 'role', 'uid', 'ign', 'avatar', 'platformHandle',
        'isVerified', 'isBanned', 'banReason', 'referredById', 'referralCode', 'stats'
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'isVerified' => 'boolean',
        'isBanned' => 'boolean',
        'stats' => 'array',
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

    const ROLE_PLAYER = 'PLAYER';
    const ROLE_ORGANIZER = 'ORGANIZER';
    const ROLE_ADMIN = 'ADMIN';

    public function gameProfiles() { return $this->hasMany(UserGameProfile::class, 'userId'); }
    public function socialAccounts() { return $this->hasMany(SocialAccount::class, 'userId'); }
}
