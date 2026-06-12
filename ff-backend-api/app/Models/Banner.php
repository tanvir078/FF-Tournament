<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasUuid;

    protected $table = 'banners';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['title', 'description', 'imageUrl', 'linkUrl', 'isActive', 'order', 'startDate', 'endDate', 'isFeatured'];

    protected $casts = [
        'isActive' => 'boolean',
        'isFeatured' => 'boolean',
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
}
