<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserGameProfile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserGameProfileController extends Controller
{
    public function mine(Request $request)
    {
        return response()->json(UserGameProfile::with('game')->where('userId', $request->user()->id)->get());
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $profile = UserGameProfile::updateOrCreate(
            ['userId' => $request->user()->id, 'gameId' => $data['gameId']],
            [...$data, 'verificationStatus' => UserGameProfile::STATUS_UNVERIFIED, 'reviewedById' => null, 'reviewedAt' => null]
        );
        return response()->json($profile->load('game'), 201);
    }

    public function update(Request $request, string $id)
    {
        $profile = UserGameProfile::where('userId', $request->user()->id)->findOrFail($id);
        $profile->update([...$this->validated($request, true), 'verificationStatus' => UserGameProfile::STATUS_UNVERIFIED, 'reviewedById' => null, 'reviewedAt' => null]);
        return response()->json($profile->fresh('game'));
    }

    public function managed(Request $request)
    {
        $query = UserGameProfile::with(['game', 'user'])->latest();
        if ($request->status) $query->where('verificationStatus', $request->status);
        return response()->json($query->get());
    }

    public function review(Request $request, string $id)
    {
        $data = $request->validate(['verificationStatus' => ['required', Rule::in([UserGameProfile::STATUS_VERIFIED, UserGameProfile::STATUS_REJECTED])], 'adminNote' => 'nullable|string']);
        $profile = UserGameProfile::findOrFail($id);
        $profile->update([...$data, 'reviewedById' => $request->user()->id, 'reviewedAt' => now()]);
        return response()->json($profile->fresh(['game', 'user']));
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'gameId' => [$required, 'uuid', 'exists:games,id'], 'uid' => [$required, 'string', 'max:255'],
            'ign' => [$required, 'string', 'max:255'], 'region' => 'nullable|string|max:100',
        ]);
    }
}
