<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdraw_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId')->notNull();
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2)->notNull();
            $table->string('method')->notNull();
            $table->string('accountNumber')->nullable();
            $table->string('accountName')->nullable();
            $table->string('bankName')->nullable();
            $table->string('mobileNumber')->nullable();
            $table->string('transactionId')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->string('rejectionReason')->nullable();
            $table->string('adminNote')->nullable();
            $table->timestamp('processedAt')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdraw_requests');
    }
};
