<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class PasswordVerifier
{
    public static function check(string $plainText, string $hashedValue): bool
    {
        if (str_starts_with($hashedValue, '$2b$')) {
            return password_verify($plainText, '$2y$'.substr($hashedValue, 4));
        }

        try {
            return Hash::check($plainText, $hashedValue);
        } catch (RuntimeException) {
            return false;
        }
    }

    public static function checkAndUpgrade(User $user, string $plainText): bool
    {
        if (! self::check($plainText, $user->password)) {
            return false;
        }

        if (str_starts_with($user->password, '$2b$') || Hash::needsRehash($user->password)) {
            $user->update(['password' => Hash::make($plainText)]);
        }

        return true;
    }
}
