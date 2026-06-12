<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title')->notNull();
            $table->string('description')->nullable();
            $table->string('imageUrl')->notNull();
            $table->string('linkUrl')->nullable();
            $table->boolean('isActive')->default(false);
            $table->integer('order')->default(0);
            $table->timestamp('startDate')->nullable();
            $table->timestamp('endDate')->nullable();
            $table->boolean('isFeatured')->default(false);
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
