<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const FREE_FIRE_ID = '00000000-0000-4000-8000-000000000001';
    private const PUBG_ID = '00000000-0000-4000-8000-000000000002';
    private const EFOOTBALL_ID = '00000000-0000-4000-8000-000000000003';
    private const MOBILE_LEGENDS_ID = '00000000-0000-4000-8000-000000000004';

    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('banner')->nullable();
            $table->boolean('enabled')->default(true);
            $table->json('profileFields')->nullable();
            $table->json('lobbyLabels')->nullable();
            $table->json('scoringPreset')->nullable();
            $table->timestamps();
        });

        Schema::create('game_modes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('gameId');
            $table->string('slug');
            $table->string('name');
            $table->string('format');
            $table->unsignedInteger('rosterSize')->default(1);
            $table->unsignedInteger('substituteLimit')->default(0);
            $table->json('config')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->unique(['gameId', 'slug']);
            $table->foreign('gameId')->references('id')->on('games')->cascadeOnDelete();
        });

        Schema::create('game_maps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('gameId');
            $table->string('name');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->unique(['gameId', 'name']);
            $table->foreign('gameId')->references('id')->on('games')->cascadeOnDelete();
        });

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('brandName')->default('ArenaHub');
            $table->string('logoUrl')->nullable();
            $table->string('primaryColor')->default('#0ea5e9');
            $table->string('secondaryColor')->default('#7c3aed');
            $table->json('socialMetadata')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('platformHandle')->nullable()->unique();
        });

        Schema::create('user_game_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId');
            $table->uuid('gameId');
            $table->string('uid');
            $table->string('ign');
            $table->string('region')->nullable();
            $table->string('verificationStatus')->default('UNVERIFIED');
            $table->text('adminNote')->nullable();
            $table->uuid('reviewedById')->nullable();
            $table->timestamp('reviewedAt')->nullable();
            $table->timestamps();
            $table->unique(['userId', 'gameId']);
            $table->foreign('userId')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('gameId')->references('id')->on('games')->cascadeOnDelete();
            $table->foreign('reviewedById')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->uuid('gameId')->nullable();
            $table->text('description')->nullable();
            $table->foreign('gameId')->references('id')->on('games')->nullOnDelete();
        });

        Schema::table('tournaments', function (Blueprint $table) {
            $table->uuid('gameId')->nullable();
            $table->uuid('gameModeId')->nullable();
            $table->boolean('requiresVerifiedProfile')->default(false);
            $table->boolean('checkInEnabled')->default(false);
            $table->timestamp('checkInOpensAt')->nullable();
            $table->timestamp('checkInClosesAt')->nullable();
            $table->json('scoringConfig')->nullable();
            $table->json('lobbyConfig')->nullable();
            $table->foreign('gameId')->references('id')->on('games')->nullOnDelete();
            $table->foreign('gameModeId')->references('id')->on('game_modes')->nullOnDelete();
        });

        Schema::table('tournament_registrations', function (Blueprint $table) {
            $table->uuid('gameProfileId')->nullable();
            $table->string('checkInStatus')->default('NOT_REQUIRED');
            $table->timestamp('checkedInAt')->nullable();
            $table->foreign('gameProfileId')->references('id')->on('user_game_profiles')->nullOnDelete();
        });

        Schema::create('tournament_lineups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('registrationId')->unique();
            $table->uuid('teamId');
            $table->uuid('captainId');
            $table->string('status')->default('PENDING');
            $table->timestamp('checkedInAt')->nullable();
            $table->timestamps();
            $table->foreign('registrationId')->references('id')->on('tournament_registrations')->cascadeOnDelete();
            $table->foreign('teamId')->references('id')->on('teams')->cascadeOnDelete();
            $table->foreign('captainId')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('tournament_lineup_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lineupId');
            $table->uuid('userId');
            $table->uuid('gameProfileId')->nullable();
            $table->string('role')->default('STARTER');
            $table->timestamps();
            $table->unique(['lineupId', 'userId']);
            $table->foreign('lineupId')->references('id')->on('tournament_lineups')->cascadeOnDelete();
            $table->foreign('userId')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('gameProfileId')->references('id')->on('user_game_profiles')->nullOnDelete();
        });

        $this->seedCatalog();
        DB::table('platform_settings')->insert(['id' => 1, 'brandName' => 'ArenaHub', 'created_at' => now(), 'updated_at' => now()]);

        DB::table('users')->orderBy('id')->each(function ($user) {
            $handle = 'player-'.substr(str_replace('-', '', $user->id), 0, 10);
            DB::table('users')->where('id', $user->id)->update(['platformHandle' => $handle]);
            if ($user->uid || $user->ign) {
                DB::table('user_game_profiles')->insert([
                    'id' => (string) Str::uuid(), 'userId' => $user->id, 'gameId' => self::FREE_FIRE_ID,
                    'uid' => $user->uid ?: $handle, 'ign' => $user->ign ?: $user->name,
                    'verificationStatus' => 'UNVERIFIED', 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        });
        DB::table('teams')->update(['gameId' => self::FREE_FIRE_ID]);
        DB::table('tournaments')->update(['gameId' => self::FREE_FIRE_ID]);
    }

    private function seedCatalog(): void
    {
        $games = [
            [self::FREE_FIRE_ID, 'free-fire', 'Free Fire', ['uid', 'ign', 'region'], ['roomId' => 'Room ID', 'password' => 'Password'], ['type' => 'PLACEMENT_KILLS']],
            [self::PUBG_ID, 'pubg-mobile', 'PUBG Mobile', ['uid', 'ign', 'region'], ['roomId' => 'Room ID', 'password' => 'Password'], ['type' => 'PLACEMENT_KILLS']],
            [self::EFOOTBALL_ID, 'efootball', 'eFootball', ['uid', 'ign', 'region'], ['roomId' => 'Room Code'], ['type' => 'SCORELINE']],
            [self::MOBILE_LEGENDS_ID, 'mobile-legends', 'Mobile Legends', ['uid', 'ign', 'region'], ['roomId' => 'Lobby ID', 'password' => 'Password'], ['type' => 'SERIES_WINNER']],
        ];
        foreach ($games as [$id, $slug, $name, $fields, $labels, $scoring]) {
            DB::table('games')->insert(['id' => $id, 'slug' => $slug, 'name' => $name, 'profileFields' => json_encode($fields), 'lobbyLabels' => json_encode($labels), 'scoringPreset' => json_encode($scoring), 'created_at' => now(), 'updated_at' => now()]);
        }
        $modes = [
            [self::FREE_FIRE_ID, 'solo', 'Solo', 'SOLO', 1, 0], [self::FREE_FIRE_ID, 'duo', 'Duo', 'DUO', 2, 1], [self::FREE_FIRE_ID, 'squad', 'Squad', 'SQUAD', 4, 1], [self::FREE_FIRE_ID, 'clash-squad', 'Clash Squad', 'CLASH_SQUAD', 4, 1],
            [self::PUBG_ID, 'solo', 'Solo', 'SOLO', 1, 0], [self::PUBG_ID, 'duo', 'Duo', 'DUO', 2, 1], [self::PUBG_ID, 'squad', 'Squad', 'SQUAD', 4, 1],
            [self::EFOOTBALL_ID, 'one-v-one', '1v1', 'SOLO', 1, 0],
            [self::MOBILE_LEGENDS_ID, 'five-v-five', '5v5', 'SQUAD', 5, 2],
        ];
        foreach ($modes as [$gameId, $slug, $name, $format, $roster, $subs]) {
            DB::table('game_modes')->insert(['id' => (string) Str::uuid(), 'gameId' => $gameId, 'slug' => $slug, 'name' => $name, 'format' => $format, 'rosterSize' => $roster, 'substituteLimit' => $subs, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach ([[self::FREE_FIRE_ID, 'Bermuda'], [self::FREE_FIRE_ID, 'Purgatory'], [self::PUBG_ID, 'Erangel'], [self::PUBG_ID, 'Miramar'], [self::MOBILE_LEGENDS_ID, 'Land of Dawn']] as [$gameId, $name]) {
            DB::table('game_maps')->insert(['id' => (string) Str::uuid(), 'gameId' => $gameId, 'name' => $name, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_lineup_members');
        Schema::dropIfExists('tournament_lineups');
        Schema::table('tournament_registrations', fn (Blueprint $table) => $table->dropConstrainedForeignId('gameProfileId'));
        Schema::table('tournaments', function (Blueprint $table) { $table->dropConstrainedForeignId('gameModeId'); $table->dropConstrainedForeignId('gameId'); });
        Schema::table('teams', fn (Blueprint $table) => $table->dropConstrainedForeignId('gameId'));
        Schema::dropIfExists('user_game_profiles');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('platformHandle'));
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('game_maps');
        Schema::dropIfExists('game_modes');
        Schema::dropIfExists('games');
    }
};
