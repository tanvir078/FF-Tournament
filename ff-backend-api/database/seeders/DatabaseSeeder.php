<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;



class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => User::ROLE_PLAYER,
            ]
        );

        User::updateOrCreate([
            'email' => env('DEFAULT_ADMIN_EMAIL', 'admin@example.com'),
        ], [
            'name' => env('DEFAULT_ADMIN_NAME', 'Admin User'),
            'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'admin123456')),
            'role' => User::ROLE_ADMIN,
        ]);
    }
}
