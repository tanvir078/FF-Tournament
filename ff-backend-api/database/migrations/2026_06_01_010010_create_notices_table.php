<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title')->notNull();
            $table->text('content')->notNull();
            $table->enum('type', ['GENERAL', 'ANNOUNCEMENT', 'ALERT'])->default('GENERAL');
            $table->boolean('isActive')->default(true);
            $table->boolean('isPinned')->default(false);
            $table->timestamp('startDate')->nullable();
            $table->timestamp('endDate')->nullable();
            $table->boolean('showOnDashboard')->default(false);
            $table->boolean('showOnTournaments')->default(false);
            $table->boolean('showOnWallet')->default(false);
            $table->json('targetRoles')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
