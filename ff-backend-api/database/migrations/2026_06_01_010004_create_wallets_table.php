<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId')->nullable();
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('teamId')->nullable();
            $table->foreign('teamId')->references('id')->on('teams')->onDelete('cascade');
            $table->decimal('balance', 10, 2)->default(0);
            $table->decimal('totalDeposited', 10, 2)->default(0);
            $table->decimal('totalWithdrawn', 10, 2)->default(0);
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
