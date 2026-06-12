<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['slug', 'name', 'icon', 'banner', 'enabled', 'profileFields', 'lobbyLabels', 'scoringPreset'];
    protected $casts = ['enabled' => 'boolean', 'profileFields' => 'array', 'lobbyLabels' => 'array', 'scoringPreset' => 'array'];

    public function modes() { return $this->hasMany(GameMode::class, 'gameId'); }
    public function maps() { return $this->hasMany(GameMap::class, 'gameId'); }
}
