<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('statement');
            $table->enum('type', ['multiple_choice', 'true_false', 'essay']);
            $table->string('correct_answer')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard']);
            $table->text('text_resolution');
            $table->string('video_resolution_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};