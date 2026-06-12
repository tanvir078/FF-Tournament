<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SocialAuthController extends Controller
{
    private const PROVIDERS = ['google', 'facebook', 'linkedin'];

    public function redirect(Request $request, string $provider)
    {
        $provider = $this->validateProvider($provider);
        $redirectUri = $this->redirectUri($request->input('redirectUri'));
        $config = $this->providerConfig($provider);

        if (!$config['client_id'] || !$config['client_secret']) {
            throw ValidationException::withMessages([
                'provider' => ucfirst($provider).' OAuth is not configured.',
            ]);
        }

        $state = $this->makeState($provider, $redirectUri);
        $params = [
            'client_id' => $config['client_id'],
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => $config['scope'],
            'state' => $state,
        ];

        if ($provider === 'google') {
            $params['access_type'] = 'offline';
            $params['prompt'] = 'select_account';
        }

        return response()->json([
            'url' => $config['authorize_url'].'?'.http_build_query($params),
            'provider' => $provider,
            'state' => $state,
        ]);
    }

    public function callback(Request $request, string $provider)
    {
        $provider = $this->validateProvider($provider);
        $data = $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
            'redirectUri' => 'nullable|url',
        ]);

        $redirectUri = $this->redirectUri($data['redirectUri'] ?? null);
        $state = $this->verifyState($data['state'], $provider, $redirectUri);
        if (!$state) {
            throw ValidationException::withMessages(['state' => 'Invalid social login state.']);
        }

        $profile = $this->fetchProfile($provider, $data['code'], $redirectUri);
        if (!$profile['providerId']) {
            throw ValidationException::withMessages(['provider' => 'Unable to read social profile.']);
        }

        $account = SocialAccount::where('provider', $provider)->where('providerId', $profile['providerId'])->first();
        $user = $account?->user;

        if (!$user && $profile['email']) {
            $user = User::where('email', $profile['email'])->first();
        }

        if (!$user) {
            $user = User::create([
                'email' => $profile['email'] ?: $provider.'-'.$profile['providerId'].'@social.local',
                'name' => $profile['name'] ?: ucfirst($provider).' Player',
                'password' => Hash::make(Str::random(40)),
                'avatar' => $profile['avatar'],
                'platformHandle' => $this->uniqueHandle($profile['name'] ?: $provider.' player'),
                'role' => User::ROLE_PLAYER,
                'isVerified' => (bool) $profile['email'],
            ]);
            Wallet::firstOrCreate(['userId' => $user->id], ['balance' => 0, 'totalDeposited' => 0, 'totalWithdrawn' => 0]);
        } else {
            $updates = [];
            if (!$user->avatar && $profile['avatar']) $updates['avatar'] = $profile['avatar'];
            if (!$user->name && $profile['name']) $updates['name'] = $profile['name'];
            if ($updates) $user->update($updates);
        }

        SocialAccount::updateOrCreate(
            ['provider' => $provider, 'providerId' => $profile['providerId']],
            [
                'userId' => $user->id,
                'email' => $profile['email'],
                'name' => $profile['name'],
                'avatar' => $profile['avatar'],
                'profile' => $profile['raw'],
            ]
        );

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user->fresh(),
            'provider' => $provider,
        ]);
    }

    private function fetchProfile(string $provider, string $code, string $redirectUri): array
    {
        $config = $this->providerConfig($provider);
        $tokenResponse = Http::asForm()->post($config['token_url'], [
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
            'code' => $code,
        ]);

        if (!$tokenResponse->successful()) {
            throw ValidationException::withMessages(['code' => 'Unable to exchange social login code.']);
        }

        $token = $tokenResponse->json('access_token');
        if (!$token) {
            throw ValidationException::withMessages(['code' => 'Social provider did not return an access token.']);
        }

        $userResponse = Http::withToken($token)->get($config['profile_url'], $config['profile_params'] ?? []);
        if (!$userResponse->successful()) {
            throw ValidationException::withMessages(['provider' => 'Unable to fetch social profile.']);
        }

        return $this->normalizeProfile($provider, $userResponse->json());
    }

    private function normalizeProfile(string $provider, array $raw): array
    {
        return match ($provider) {
            'google' => [
                'providerId' => (string) ($raw['sub'] ?? ''),
                'email' => $raw['email'] ?? null,
                'name' => $raw['name'] ?? null,
                'avatar' => $raw['picture'] ?? null,
                'raw' => $raw,
            ],
            'facebook' => [
                'providerId' => (string) ($raw['id'] ?? ''),
                'email' => $raw['email'] ?? null,
                'name' => $raw['name'] ?? null,
                'avatar' => $raw['picture']['data']['url'] ?? null,
                'raw' => $raw,
            ],
            'linkedin' => [
                'providerId' => (string) ($raw['sub'] ?? ''),
                'email' => $raw['email'] ?? null,
                'name' => $raw['name'] ?? null,
                'avatar' => $raw['picture'] ?? null,
                'raw' => $raw,
            ],
        };
    }

    private function providerConfig(string $provider): array
    {
        return match ($provider) {
            'google' => [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'authorize_url' => 'https://accounts.google.com/o/oauth2/v2/auth',
                'token_url' => 'https://oauth2.googleapis.com/token',
                'profile_url' => 'https://openidconnect.googleapis.com/v1/userinfo',
                'scope' => 'openid profile email',
            ],
            'facebook' => [
                'client_id' => config('services.facebook.client_id'),
                'client_secret' => config('services.facebook.client_secret'),
                'authorize_url' => 'https://www.facebook.com/v20.0/dialog/oauth',
                'token_url' => 'https://graph.facebook.com/v20.0/oauth/access_token',
                'profile_url' => 'https://graph.facebook.com/me',
                'profile_params' => ['fields' => 'id,name,email,picture.type(large)'],
                'scope' => 'email,public_profile',
            ],
            'linkedin' => [
                'client_id' => config('services.linkedin.client_id'),
                'client_secret' => config('services.linkedin.client_secret'),
                'authorize_url' => 'https://www.linkedin.com/oauth/v2/authorization',
                'token_url' => 'https://www.linkedin.com/oauth/v2/accessToken',
                'profile_url' => 'https://api.linkedin.com/v2/userinfo',
                'scope' => 'openid profile email',
            ],
        };
    }

    private function redirectUri(?string $value): string
    {
        return $value ?: rtrim(config('services.frontend_url'), '/').'/auth/social/callback';
    }

    private function validateProvider(string $provider): string
    {
        $provider = strtolower($provider);
        abort_unless(in_array($provider, self::PROVIDERS, true), 404, 'Unsupported social login provider.');
        return $provider;
    }

    private function makeState(string $provider, string $redirectUri): string
    {
        $payload = base64_encode(json_encode([
            'provider' => $provider,
            'redirectUri' => $redirectUri,
            'nonce' => Str::random(24),
            'iat' => time(),
        ]));

        return $payload.'.'.$this->signature($payload);
    }

    private function verifyState(string $state, string $provider, string $redirectUri): ?array
    {
        [$payload, $signature] = array_pad(explode('.', $state, 2), 2, null);
        if (!$payload || !$signature || !hash_equals($this->signature($payload), $signature)) return null;
        $data = json_decode(base64_decode($payload), true);
        if (!$data || ($data['provider'] ?? null) !== $provider || ($data['redirectUri'] ?? null) !== $redirectUri) return null;
        if (($data['iat'] ?? 0) < time() - 600) return null;
        return $data;
    }

    private function signature(string $payload): string
    {
        return hash_hmac('sha256', $payload, (string) config('services.social.state_secret'));
    }

    private function uniqueHandle(string $name): string
    {
        $base = Str::slug($name) ?: 'player';
        $base = Str::limit($base, 28, '');
        $handle = $base;
        $index = 1;
        while (User::where('platformHandle', $handle)->exists()) {
            $handle = $base.'-'.$index++;
        }
        return $handle;
    }
}
