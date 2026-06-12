<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlatformSettingController extends Controller
{
    public function show()
    {
        return response()->json(DB::table('platform_settings')->first() ?? [
            'id' => 1, 'brandName' => 'ArenaHub', 'primaryColor' => '#0ea5e9', 'secondaryColor' => '#7c3aed',
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'brandName' => 'sometimes|string|max:255', 'logoUrl' => 'nullable|url|max:2048',
            'primaryColor' => 'sometimes|string|max:20', 'secondaryColor' => 'sometimes|string|max:20',
            'socialMetadata' => 'nullable|array',
        ]);
        DB::table('platform_settings')->updateOrInsert(['id' => 1], [...$data, 'updated_at' => now(), 'created_at' => now()]);
        return $this->show();
    }
}
