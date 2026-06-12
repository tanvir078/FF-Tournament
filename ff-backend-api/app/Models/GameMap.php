<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class GameMap extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['gameId', 'name', 'enabled'];
    protected $casts = ['enabled' => 'boolean'];
    public function game() { return $this->belongsTo(Game::class, 'gameId'); }
}
