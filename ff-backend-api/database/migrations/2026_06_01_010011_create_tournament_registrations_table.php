<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tournamentId')->notNull();
            $table->foreign('tournamentId')->references('id')->on('tournaments')->onDelete('cascade');
            $table->uuid('userId')->notNull();
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('APPROVED');
            $table->string('transactionId')->nullable();
            $table->string('ffUid')->nullable();
            $table->string('screenshotPath')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            
            $table->unique(['tournamentId', 'userId']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_registrations');
    }
};
