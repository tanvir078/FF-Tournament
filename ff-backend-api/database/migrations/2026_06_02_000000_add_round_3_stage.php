<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') return;
        if ($this->typeExists('matches_stage_enum')) {
            DB::statement("ALTER TYPE matches_stage_enum ADD VALUE IF NOT EXISTS 'ROUND_3' BEFORE 'SEMI_FINAL'");
        }
        if ($this->typeExists('tournaments_currentstage_enum')) {
            DB::statement("ALTER TYPE tournaments_currentstage_enum ADD VALUE IF NOT EXISTS 'ROUND_3' BEFORE 'SEMI_FINAL'");
        }
    }

    public function down(): void
    {
        // PostgreSQL enum values cannot be removed safely without rebuilding the type.
    }

    private function typeExists(string $type): bool
    {
        return (bool) DB::selectOne(
            'SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = ?) AS present',
            [$type]
        )->present;
    }
};
