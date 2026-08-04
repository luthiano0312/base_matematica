<?php

namespace App\Services;

use App\Models\Content;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    /**
     * Escolhe o conteúdo recomendado em cascata (RF12):
     * 1. Sorteia aleatoriamente entre os conteúdos marcados como interesse (RN12/RN13).
     * 2. Sem interesses: conteúdo com mais acertos do aluno.
     * 3. Aluno novo (sem interesses e sem respostas): conteúdo aleatório.
     */
    public function pickContent(User $user): ?Content
    {
        $interests = $user->interests()->get();

        if ($interests->isNotEmpty()) {
            return $interests->random();
        }

        $bestId = DB::table('contents')
            ->join('question_content', 'question_content.content_id', '=', 'contents.id')
            ->join('answered_questions', 'answered_questions.question_id', '=', 'question_content.question_id')
            ->where('answered_questions.user_id', $user->id)
            ->where('answered_questions.is_correct', true)
            ->groupBy('contents.id')
            ->orderByRaw('count(*) desc')
            ->value('contents.id');

        if ($bestId) {
            return Content::find($bestId);
        }

        return Content::query()->inRandomOrder()->first();
    }
}
