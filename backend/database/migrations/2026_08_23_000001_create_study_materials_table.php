<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            // Artigo em HTML rico (pipeline Tiptap → DOMPurify → KaTeX,
            // RN21/RN22). Nullable: o material pode ser só vídeo.
            $table->text('content')->nullable();
            // Deletar o conteúdo remove os materiais dele; deletar o tópico
            // preserva o material, apenas sem a referência de tópico.
            $table->foreignId('content_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('video_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_materials');
    }
};
