<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use HasUuid;

    protected $table = 'sponsors';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['name', 'slug', 'logo', 'website', 'description', 'socialLinks', 'isActive', 'packages', 'sponsoredTournaments'];

    protected $casts = [
        'isActive' => 'boolean',
        'socialLinks' => 'array',
        'packages' => 'array',
        'sponsoredTournaments' => 'array',
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
}
