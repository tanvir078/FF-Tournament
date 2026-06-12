<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->string('competitionMode')->default('STANDARD');
            $table->json('rewardSettings')->nullable();
            $table->index(['organizerId', 'status']);
        });

        Schema::create('team_memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('teamId');
            $table->uuid('userId');
            $table->uuid('invitedById');
            $table->string('status')->default('PENDING');
            $table->timestamps();
            $table->unique(['teamId', 'userId']);
            $table->foreign('teamId')->references('id')->on('teams')->cascadeOnDelete();
            $table->foreign('userId')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('invitedById')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('result_claims', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('matchId');
            $table->uuid('tournamentId');
            $table->uuid('submittedById');
            $table->uuid('teamId')->nullable();
            $table->string('status')->default('PENDING');
            $table->unsignedInteger('placement');
            $table->unsignedInteger('kills')->default(0);
            $table->json('proofPaths');
            $table->string('evidenceUrl')->nullable();
            $table->text('adminNote')->nullable();
            $table->uuid('reviewedById')->nullable();
            $table->timestamp('reviewedAt')->nullable();
            $table->timestamps();
            $table->unique(['matchId', 'submittedById']);
            $table->foreign('matchId')->references('id')->on('matches')->cascadeOnDelete();
            $table->foreign('tournamentId')->references('id')->on('tournaments')->cascadeOnDelete();
            $table->foreign('submittedById')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('teamId')->references('id')->on('teams')->nullOnDelete();
            $table->foreign('reviewedById')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('result_claim_rewards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('claimId');
            $table->uuid('userId');
            $table->decimal('suggestedAmount', 10, 2)->default(0);
            $table->decimal('approvedAmount', 10, 2)->nullable();
            $table->uuid('transactionId')->nullable();
            $table->timestamps();
            $table->unique(['claimId', 'userId']);
            $table->foreign('claimId')->references('id')->on('result_claims')->cascadeOnDelete();
            $table->foreign('userId')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('transactionId')->references('id')->on('transactions')->nullOnDelete();
        });

        Schema::create('support_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticketId');
            $table->uuid('senderId');
            $table->text('message');
            $table->timestamp('readAt')->nullable();
            $table->timestamps();
            $table->foreign('ticketId')->references('id')->on('support_tickets')->cascadeOnDelete();
            $table->foreign('senderId')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('support_settings', function (Blueprint $table) {
            $table->id();
            $table->string('telegramUrl')->nullable();
            $table->string('whatsappUrl')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_settings');
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('result_claim_rewards');
        Schema::dropIfExists('result_claims');
        Schema::dropIfExists('team_memberships');

        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropIndex(['organizerId', 'status']);
            $table->dropColumn(['competitionMode', 'rewardSettings']);
        });
    }
};
