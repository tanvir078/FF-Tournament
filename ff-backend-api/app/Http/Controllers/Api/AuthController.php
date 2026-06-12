<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PasswordVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'uid' => 'nullable|string',
            'ign' => 'nullable|string',
            'platformHandle' => 'nullable|string|max:50|unique:users',
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'uid' => $validated['uid'] ?? null,
            'ign' => $validated['ign'] ?? null,
            'platformHandle' => $validated['platformHandle'] ?? 'player-'.Str::lower(Str::random(10)),
            'role' => User::ROLE_PLAYER,
        ]);

        return response()->json($user);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! PasswordVerifier::checkAndUpgrade($user, $validated['password'])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }

    public function adminLogin(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! PasswordVerifier::checkAndUpgrade($user, $validated['password'])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! in_array($user->role, [User::ROLE_ADMIN, User::ROLE_ORGANIZER], true)) {
            return response()->json(['message' => 'Access denied. Management privileges required.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json($user);
    }
}
