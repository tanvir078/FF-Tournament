<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') return;
        if ($this->typeExists('tournaments_status_enum')) {
            DB::statement("ALTER TYPE tournaments_status_enum ADD VALUE IF NOT EXISTS 'ONGOING' BEFORE 'COMPLETED'");
            DB::statement("ALTER TYPE tournaments_status_enum ADD VALUE IF NOT EXISTS 'CANCELLED'");
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
