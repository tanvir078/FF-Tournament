<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasUuid;

    protected $table = 'teams';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name', 'tag', 'logo', 'captainId', 'players', 'stats', 'walletBalance', 'gameId', 'description'
    ];

    protected $casts = [
        'players' => 'array',
        'stats' => 'array',
        'walletBalance' => 'decimal:2',
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

    public function captain()
    {
        return $this->belongsTo(User::class, 'captainId');
    }

    public function memberships()
    {
        return $this->hasMany(TeamMembership::class, 'teamId');
    }

    public function game() { return $this->belongsTo(Game::class, 'gameId'); }
}
