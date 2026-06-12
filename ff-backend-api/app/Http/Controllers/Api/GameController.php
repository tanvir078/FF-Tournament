<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameMap;
use App\Models\GameMode;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::with(['modes', 'maps'])->orderBy('name');
        if ($request->user()?->role !== 'ADMIN') $query->where('enabled', true);
        return response()->json($query->get());
    }

    public function show(string $slug)
    {
        return response()->json(Game::with(['modes', 'maps'])->where('slug', $slug)->where('enabled', true)->firstOrFail());
    }

    public function store(Request $request)
    {
        return response()->json(Game::create($this->validated($request))->load(['modes', 'maps']), 201);
    }

    public function update(Request $request, string $id)
    {
        $game = Game::findOrFail($id);
        $game->update($this->validated($request, true));
        return response()->json($game->fresh(['modes', 'maps']));
    }

    public function destroy(string $id)
    {
        Game::findOrFail($id)->update(['enabled' => false]);
        return response()->json(['message' => 'Game disabled']);
    }

    public function storeMode(Request $request, string $gameId)
    {
        Game::findOrFail($gameId);
        return response()->json(GameMode::create(['gameId' => $gameId, ...$this->validatedMode($request)]), 201);
    }

    public function updateMode(Request $request, string $gameId, string $id)
    {
        $mode = GameMode::where('gameId', $gameId)->findOrFail($id);
        $mode->update($this->validatedMode($request, true));
        return response()->json($mode);
    }

    public function destroyMode(string $gameId, string $id)
    {
        GameMode::where('gameId', $gameId)->findOrFail($id)->update(['enabled' => false]);
        return response()->json(['message' => 'Mode disabled']);
    }

    public function storeMap(Request $request, string $gameId)
    {
        Game::findOrFail($gameId);
        return response()->json(GameMap::create(['gameId' => $gameId, ...$request->validate(['name' => 'required|string|max:255', 'enabled' => 'nullable|boolean'])]), 201);
    }

    public function updateMap(Request $request, string $gameId, string $id)
    {
        $map = GameMap::where('gameId', $gameId)->findOrFail($id);
        $map->update($request->validate(['name' => 'sometimes|string|max:255', 'enabled' => 'nullable|boolean']));
        return response()->json($map);
    }

    public function destroyMap(string $gameId, string $id)
    {
        GameMap::where('gameId', $gameId)->findOrFail($id)->delete();
        return response()->json(['message' => 'Map deleted']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'slug' => [$required, 'string', 'max:100', Rule::unique('games')->ignore($request->route('id'))],
            'name' => [$required, 'string', 'max:255'], 'icon' => 'nullable|string|max:2048',
            'banner' => 'nullable|string|max:2048', 'enabled' => 'nullable|boolean',
            'profileFields' => 'nullable|array', 'lobbyLabels' => 'nullable|array', 'scoringPreset' => 'nullable|array',
        ]);
    }

    private function validatedMode(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'slug' => [$required, 'string', 'max:100'], 'name' => [$required, 'string', 'max:255'],
            'format' => [$required, 'string', 'max:100'], 'rosterSize' => [$required, 'integer', 'min:1'],
            'substituteLimit' => 'nullable|integer|min:0', 'config' => 'nullable|array', 'enabled' => 'nullable|boolean',
        ]);
    }
}
