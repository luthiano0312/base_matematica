<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('answered_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->noActionOnDelete();
            $table->foreignId('question_id')->constrained()->noActionOnDelete();
            $table->boolean('is_correct');
            $table->unsignedInteger('points_earned')->default(0);
            $table->timestamp('answered_at');
            $table->timestamps();

            $table->index(['user_id', 'question_id']);
            $table->index('answered_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('answered_questions');
    }
};
