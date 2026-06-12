<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId');
            $table->foreign('userId')->references('id')->on('users')->cascadeOnDelete();
            $table->string('provider', 40);
            $table->string('providerId');
            $table->string('email')->nullable();
            $table->string('name')->nullable();
            $table->string('avatar', 2048)->nullable();
            $table->json('profile')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
            $table->unique(['provider', 'providerId']);
            $table->index(['email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
