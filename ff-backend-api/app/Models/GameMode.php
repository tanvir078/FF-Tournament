<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class GameMode extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['gameId', 'slug', 'name', 'format', 'rosterSize', 'substituteLimit', 'config', 'enabled'];
    protected $casts = ['config' => 'array', 'enabled' => 'boolean'];
    public function game() { return $this->belongsTo(Game::class, 'gameId'); }
}
