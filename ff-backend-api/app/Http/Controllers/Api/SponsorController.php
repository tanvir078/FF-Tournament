<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SponsorController extends Controller
{
    public function index()
    {
        return response()->json(Sponsor::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'nullable|string|unique:sponsors,slug',
            'logo' => 'nullable|string',
            'website' => 'nullable|string',
            'description' => 'nullable|string',
            'socialLinks' => 'nullable|array',
            'isActive' => 'nullable|boolean',
            'packages' => 'nullable|array',
            'sponsoredTournaments' => 'nullable|array',
        ]);

        $validated['slug'] ??= Str::slug($validated['name']);
        return response()->json(Sponsor::create($validated), 201);
    }

    public function apply(Request $request)
    {
        $validated = $request->validate([
            'companyName' => 'required|string',
            'website' => 'nullable|string',
            'description' => 'nullable|string',
            'tier' => 'nullable|string',
        ]);

        return response()->json([
            'message' => 'Sponsor application submitted',
            'application' => $validated,
        ], 202);
    }

    public function update(Request $request, $id)
    {
        $sponsor = Sponsor::findOrFail($id);
        $sponsor->update($request->only($sponsor->getFillable()));
        return response()->json($sponsor);
    }

    public function destroy($id)
    {
        Sponsor::findOrFail($id)->delete();
        return response()->json(['message' => 'Sponsor deleted']);
    }
}
