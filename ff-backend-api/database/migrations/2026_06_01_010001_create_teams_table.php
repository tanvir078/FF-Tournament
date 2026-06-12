<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique()->notNull();
            $table->string('tag')->nullable();
            $table->string('logo')->nullable();
            $table->uuid('captainId')->notNull();
            $table->foreign('captainId')->references('id')->on('users')->onDelete('cascade');
            $table->json('players')->nullable();
            $table->json('stats')->nullable();
            $table->decimal('walletBalance', 10, 2)->default(0);
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
