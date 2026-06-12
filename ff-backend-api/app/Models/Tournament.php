<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasUuid;

    protected $table = 'tournaments';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title', 'description', 'banner', 'format', 'status', 'currentStage', 'stages',
        'entryFee', 'isFree', 'prizePool', 'maxTeams', 'registeredTeams',
        'prizeDistribution', 'rules', 'maps', 'matchCount',
        'registrationStart', 'registrationEnd', 'registrationDeadline',
        'startDate', 'endDate', 'startTime', 'paymentMethods', 'roomDetails',
        'perKillReward', 'organizerId', 'sponsors', 'isFeatured', 'competitionMode',
        'rewardSettings', 'gameId', 'gameModeId', 'requiresVerifiedProfile', 'checkInEnabled',
        'checkInOpensAt', 'checkInClosesAt', 'scoringConfig', 'lobbyConfig'
    ];

    protected $casts = [
        'isFree' => 'boolean',
        'isFeatured' => 'boolean',
        'stages' => 'array',
        'prizeDistribution' => 'array',
        'rules' => 'array',
        'maps' => 'array',
        'paymentMethods' => 'array',
        'roomDetails' => 'array',
        'sponsors' => 'array',
        'rewardSettings' => 'array',
        'requiresVerifiedProfile' => 'boolean',
        'checkInEnabled' => 'boolean',
        'checkInOpensAt' => 'datetime',
        'checkInClosesAt' => 'datetime',
        'scoringConfig' => 'array',
        'lobbyConfig' => 'array',
        'entryFee' => 'decimal:2',
        'prizePool' => 'decimal:2',
        'perKillReward' => 'decimal:2',
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

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizerId');
    }

    public function game() { return $this->belongsTo(Game::class, 'gameId'); }
    public function gameMode() { return $this->belongsTo(GameMode::class, 'gameModeId'); }

    const STATUS_DRAFT = 'DRAFT';
    const STATUS_REGISTRATION_OPEN = 'REGISTRATION_OPEN';
    const STATUS_REGISTRATION_CLOSED = 'REGISTRATION_CLOSED';
    const STATUS_IN_PROGRESS = 'ONGOING';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_CANCELLED = 'CANCELLED';

    const MODE_STANDARD = 'STANDARD';
    const MODE_KNOCKOUT = 'KNOCKOUT';

    const STAGE_QUALIFIER = 'QUALIFIER';
    const STAGE_ROUND_2 = 'ROUND_2';
    const STAGE_ROUND_3 = 'ROUND_3';
    const STAGE_SEMI_FINAL = 'SEMI_FINAL';
    const STAGE_FINAL = 'FINAL';
}
