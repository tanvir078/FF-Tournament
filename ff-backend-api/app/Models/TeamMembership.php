<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TeamMembership extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['teamId', 'userId', 'invitedById', 'status'];

    public function team() { return $this->belongsTo(Team::class, 'teamId'); }
    public function user() { return $this->belongsTo(User::class, 'userId'); }

    const STATUS_PENDING = 'PENDING';
    const STATUS_ACCEPTED = 'ACCEPTED';
    const STATUS_REJECTED = 'REJECTED';
}
