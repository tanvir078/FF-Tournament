<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class MatchModel extends Model
{
    use HasUuid;

    protected $table = 'matches';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'tournamentId', 'matchNumber', 'stage', 'roomId', 'roomPassword', 'map',
        'scheduledTime', 'status', 'slots', 'results', 'mvpTeamId', 'screenshots', 'streamUrl'
    ];

    protected $casts = [
        'slots' => 'array',
        'results' => 'array',
        'screenshots' => 'array',
        'scheduledTime' => 'datetime',
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

    public function tournament()
    {
        return $this->belongsTo(Tournament::class, 'tournamentId');
    }

    const STATUS_SCHEDULED = 'SCHEDULED';
    const STATUS_IN_PROGRESS = 'IN_PROGRESS';
    const STATUS_COMPLETED = 'COMPLETED';
}
