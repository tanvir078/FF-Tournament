<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('role')->default('PLAYER');
            $table->string('uid')->nullable();
            $table->string('ign')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('isVerified')->default(false);
            $table->boolean('isBanned')->default(false);
            $table->string('banReason')->nullable();
            $table->uuid('referredById')->nullable();
            $table->string('referralCode')->nullable();
            $table->json('stats')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
