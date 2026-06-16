<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->time('checked_out_at')->nullable()->after('checked_in_at');
            $table->time('break_started_at')->nullable()->after('checked_out_at');
            $table->unsignedSmallInteger('break_minutes')->default(0)->after('break_started_at');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['checked_out_at', 'break_started_at', 'break_minutes']);
        });
    }
};
