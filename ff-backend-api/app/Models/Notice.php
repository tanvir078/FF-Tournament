<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use HasUuid;

    protected $table = 'notices';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title', 'content', 'type', 'isActive', 'isPinned', 'startDate', 'endDate',
        'showOnDashboard', 'showOnTournaments', 'showOnWallet', 'targetRoles'
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isPinned' => 'boolean',
        'showOnDashboard' => 'boolean',
        'showOnTournaments' => 'boolean',
        'showOnWallet' => 'boolean',
        'targetRoles' => 'array',
        'startDate' => 'datetime',
        'endDate' => 'datetime',
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

    const TYPE_GENERAL = 'GENERAL';
    const TYPE_ANNOUNCEMENT = 'ANNOUNCEMENT';
    const TYPE_ALERT = 'ALERT';
}
