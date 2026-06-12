<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        return response()->json(Banner::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'imageUrl' => 'required|string',
            'description' => 'nullable|string',
            'linkUrl' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'order' => 'nullable|integer',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date',
            'isFeatured' => 'nullable|boolean',
        ]);

        return response()->json(Banner::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->update($request->only($banner->getFillable()));
        return response()->json($banner);
    }

    public function updateOrder(Request $request, $id)
    {
        $validated = $request->validate(['order' => 'required|integer']);
        $banner = Banner::findOrFail($id);
        $banner->update($validated);
        return response()->json($banner);
    }

    public function toggle($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->update(['isActive' => !$banner->isActive]);
        return response()->json($banner);
    }

    public function destroy($id)
    {
        Banner::findOrFail($id)->delete();
        return response()->json(['message' => 'Banner deleted']);
    }
}
