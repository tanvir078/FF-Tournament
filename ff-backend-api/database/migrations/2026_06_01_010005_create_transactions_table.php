<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('walletId')->notNull();
            $table->foreign('walletId')->references('id')->on('wallets')->onDelete('cascade');
            $table->string('type')->notNull();
            $table->string('status')->default('PENDING');
            $table->decimal('amount', 10, 2)->notNull();
            $table->string('description')->nullable();
            $table->string('reference')->nullable();
            $table->string('screenshotPath')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
