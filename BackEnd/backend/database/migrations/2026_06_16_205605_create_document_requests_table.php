<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('employee_name');
            $table->string('dept')->default('');
            $table->string('job_title')->default('');
            $table->string('hired_date')->default('');
            $table->enum('type', ['attestation_travail', 'attestation_salaire']);
            $table->enum('status', ['en_attente', 'approuve', 'refuse'])->default('en_attente');
            $table->string('admin_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
