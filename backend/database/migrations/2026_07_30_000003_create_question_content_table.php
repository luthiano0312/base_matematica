<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // N:N obrigatória — toda questão deve ter no mínimo 1 registro aqui (validado na FormRequest).
        Schema::create('question_content', function (Blueprint $table) {
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('content_id')->constrained()->cascadeOnDelete();
            $table->primary(['question_id', 'content_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_content');
    }
};