<?php

namespace Tests\Unit;

use App\Support\PasswordVerifier;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordVerifierTest extends TestCase
{
    public function test_it_verifies_native_laravel_bcrypt_hashes(): void
    {
        $this->assertTrue(PasswordVerifier::check('secret', Hash::make('secret')));
    }

    public function test_it_verifies_legacy_node_bcrypt_hashes(): void
    {
        $hash = Hash::make('secret');
        $legacyHash = '$2b$'.substr($hash, 4);

        $this->assertTrue(PasswordVerifier::check('secret', $legacyHash));
        $this->assertFalse(PasswordVerifier::check('wrong', $legacyHash));
    }

    public function test_it_rejects_unsupported_password_hashes_without_crashing(): void
    {
        $this->assertFalse(PasswordVerifier::check('secret', 'not-a-password-hash'));
    }
}
