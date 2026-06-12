<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tournamentId')->notNull();
            $table->foreign('tournamentId')->references('id')->on('tournaments')->onDelete('cascade');
            $table->integer('matchNumber')->notNull();
            $table->enum('stage', ['QUALIFIER', 'ROUND_2', 'ROUND_3', 'SEMI_FINAL', 'FINAL'])->notNull();
            $table->string('roomId')->nullable();
            $table->string('roomPassword')->nullable();
            $table->string('map')->notNull();
            $table->timestamp('scheduledTime')->notNull();
            $table->enum('status', ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'])->default('SCHEDULED');
            $table->json('slots')->nullable();
            $table->json('results')->nullable();
            $table->uuid('mvpTeamId')->nullable();
            $table->json('screenshots')->nullable();
            $table->string('streamUrl')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
