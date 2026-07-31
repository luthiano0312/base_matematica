<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // N:N opcional — uma questão pode não ter nenhum tópico vinculado (RN16 validada em código).
        Schema::create('question_topic', function (Blueprint $table) {
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->primary(['question_id', 'topic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_topic');
    }
};