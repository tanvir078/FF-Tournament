<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->notNull();
            $table->string('slug')->unique()->notNull();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('socialLinks')->nullable();
            $table->boolean('isActive')->default(false);
            $table->json('packages')->nullable();
            $table->json('sponsoredTournaments')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};
