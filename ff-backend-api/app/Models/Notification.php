<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasUuid;

    protected $table = 'notifications';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['userId', 'type', 'title', 'message', 'data', 'channel', 'dedupeKey', 'isRead', 'readAt'];

    protected $casts = [
        'isRead' => 'boolean',
        'data' => 'array',
        'readAt' => 'datetime',
        'createdAt' => 'datetime',
    ];

    public function getCreatedAtColumn()
    {
        return 'createdAt';
    }

    public $timestamps = false;
}
