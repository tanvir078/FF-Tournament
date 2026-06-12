<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title')->notNull();
            $table->text('description')->nullable();
            $table->string('banner')->nullable();
            $table->string('format')->notNull();
            $table->enum('status', ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'])->default('DRAFT');
            $table->enum('currentStage', ['QUALIFIER', 'ROUND_2', 'ROUND_3', 'SEMI_FINAL', 'FINAL'])->default('QUALIFIER');
            $table->json('stages')->nullable();
            $table->decimal('entryFee', 10, 2)->default(0);
            $table->boolean('isFree')->default(false);
            $table->decimal('prizePool', 10, 2)->default(0);
            $table->integer('maxTeams')->default(0);
            $table->integer('registeredTeams')->default(0);
            $table->json('prizeDistribution')->nullable();
            $table->json('rules')->nullable();
            $table->json('maps')->nullable();
            $table->integer('matchCount')->default(0);
            $table->timestamp('registrationStart')->nullable();
            $table->timestamp('registrationEnd')->nullable();
            $table->timestamp('registrationDeadline')->nullable();
            $table->timestamp('startDate')->nullable();
            $table->timestamp('endDate')->nullable();
            $table->string('startTime')->nullable();
            $table->json('paymentMethods')->nullable();
            $table->json('roomDetails')->nullable();
            $table->decimal('perKillReward', 10, 2)->default(0);
            $table->uuid('organizerId')->notNull();
            $table->foreign('organizerId')->references('id')->on('users');
            $table->json('sponsors')->nullable();
            $table->boolean('isFeatured')->default(false);
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
