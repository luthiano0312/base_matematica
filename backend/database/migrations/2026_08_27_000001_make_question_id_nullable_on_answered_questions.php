<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mudança de RN11: excluir uma questão não deve mais ser bloqueado por ter
 * respostas registradas. A pontuação e o histórico agregado do aluno em
 * answered_questions são preservados; apenas a referência à questão
 * excluída passa a ser nula.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('answered_questions', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreignId('question_id')->nullable()->change();
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreign('question_id')
                ->references('id')->on('questions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('answered_questions', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreignId('question_id')->nullable(false)->change();
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreign('question_id')
                ->references('id')->on('questions')
                ->noActionOnDelete();
        });
    }
};
