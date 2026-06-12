<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('team_challenges')) {
            return;
        }

        Schema::create('team_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('challengerTeamId');
            $table->uuid('challengedTeamId');
            $table->string('matchId')->nullable();
            $table->string('message')->nullable();
            $table->string('status')->default('PENDING');
            $table->string('format');
            $table->decimal('entryFee', 10, 2)->default(0);
            $table->integer('prizePool')->default(0);
            $table->boolean('winnerPaid')->default(false);
            $table->timestamp('acceptedAt')->nullable();
            $table->timestamp('completedAt')->nullable();
            $table->timestamp('rejectedAt')->nullable();
            $table->string('rejectedReason')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_challenges');
    }
};
