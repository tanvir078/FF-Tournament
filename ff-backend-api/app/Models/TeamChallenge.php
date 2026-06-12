<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TeamChallenge extends Model
{
    use HasUuid;

    public static $snakeAttributes = false;

    protected $table = 'team_challenges';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'challengerTeamId', 'challengedTeamId', 'matchId', 'message', 'status',
        'format', 'entryFee', 'prizePool', 'winnerPaid', 'acceptedAt',
        'completedAt', 'rejectedAt', 'rejectedReason',
    ];

    public function getCreatedAtColumn() { return 'createdAt'; }
    public function getUpdatedAtColumn() { return 'updatedAt'; }

    public function challengerTeam()
    {
        return $this->belongsTo(Team::class, 'challengerTeamId');
    }

    public function challengedTeam()
    {
        return $this->belongsTo(Team::class, 'challengedTeamId');
    }
}
