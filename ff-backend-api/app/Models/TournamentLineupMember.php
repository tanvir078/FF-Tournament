<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TournamentLineupMember extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['lineupId', 'userId', 'gameProfileId', 'role'];
    public function user() { return $this->belongsTo(User::class, 'userId'); }
    public function profile() { return $this->belongsTo(UserGameProfile::class, 'gameProfileId'); }
}
