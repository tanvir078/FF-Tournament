<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ResultClaim extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'matchId', 'tournamentId', 'submittedById', 'teamId', 'status', 'placement',
        'kills', 'resultPayload', 'proofPaths', 'evidenceUrl', 'adminNote', 'reviewedById', 'reviewedAt',
    ];
    protected $casts = ['proofPaths' => 'array', 'resultPayload' => 'array', 'reviewedAt' => 'datetime'];

    public function match() { return $this->belongsTo(MatchModel::class, 'matchId'); }
    public function tournament() { return $this->belongsTo(Tournament::class, 'tournamentId'); }
    public function submitter() { return $this->belongsTo(User::class, 'submittedById'); }
    public function team() { return $this->belongsTo(Team::class, 'teamId'); }
    public function rewards() { return $this->hasMany(ResultClaimReward::class, 'claimId'); }

    const STATUS_PENDING = 'PENDING';
    const STATUS_APPROVED = 'APPROVED';
    const STATUS_REJECTED = 'REJECTED';
}
