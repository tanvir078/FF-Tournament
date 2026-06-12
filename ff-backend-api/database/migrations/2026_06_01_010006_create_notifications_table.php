<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId')->notNull();
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->string('type')->notNull();
            $table->string('title')->notNull();
            $table->text('message')->notNull();
            $table->json('data')->nullable();
            $table->string('channel')->default('PUSH');
            $table->boolean('isRead')->default(false);
            $table->timestamp('readAt')->nullable();
            $table->timestamp('createdAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
