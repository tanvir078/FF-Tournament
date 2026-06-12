<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TournamentRegistration extends Model
{
    use HasUuid;

    protected $table = 'tournament_registrations';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['tournamentId', 'userId', 'status', 'transactionId', 'ffUid', 'screenshotPath', 'gameProfileId', 'checkInStatus', 'checkedInAt'];

    protected $casts = [
        'createdAt' => 'datetime',
        'checkedInAt' => 'datetime',
    ];

    public function getCreatedAtColumn()
    {
        return 'createdAt';
    }

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class, 'tournamentId');
    }

    public function gameProfile() { return $this->belongsTo(UserGameProfile::class, 'gameProfileId'); }
    public function lineup() { return $this->hasOne(TournamentLineup::class, 'registrationId'); }

    const STATUS_PENDING = 'PENDING';
    const STATUS_APPROVED = 'APPROVED';
    const STATUS_REJECTED = 'REJECTED';
    const STATUS_EXPIRED = 'EXPIRED';
}
