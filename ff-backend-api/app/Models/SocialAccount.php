<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class SocialAccount extends Model
{
    use HasUuid;

    protected $table = 'social_accounts';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['userId', 'provider', 'providerId', 'email', 'name', 'avatar', 'profile'];

    protected $casts = [
        'profile' => 'array',
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
