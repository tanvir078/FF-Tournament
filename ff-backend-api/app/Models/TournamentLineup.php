<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TournamentLineup extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['registrationId', 'teamId', 'captainId', 'status', 'checkedInAt'];
    protected $casts = ['checkedInAt' => 'datetime'];
    public function members() { return $this->hasMany(TournamentLineupMember::class, 'lineupId'); }
    public function team() { return $this->belongsTo(Team::class, 'teamId'); }
    public function registration() { return $this->belongsTo(TournamentRegistration::class, 'registrationId'); }
}
