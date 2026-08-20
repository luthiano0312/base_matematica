<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuestionResource;
use App\Models\Content;
use App\Models\Question;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

/**
 * GET /admin/overview — agregador da Visão Geral do painel
 * (Spec_Admin_Visao_Geral: cards de métrica, banner de tópicos sem questão
 * e lista "Cadastrado recentemente").
 */
class AdminOverviewController extends Controller
{
    private const TYPE_LABELS = [
        'multiple_choice' => 'múltipla escolha',
        'true_false' => 'verdadeiro/falso',
        'essay' => 'dissertativa',
    ];

    private const DIFFICULTY_LABELS = [
        'easy' => 'Fácil',
        'medium' => 'Média',
        'hard' => 'Difícil',
    ];

    public function index(): JsonResponse
    {
        return response()->json([
            'counts' => [
                'questions' => Question::count(),
                'topics' => Topic::count(),
                'contents' => Content::count(),
            ],
            'topics_without_questions' => Topic::whereDoesntHave('questions')->count(),
            'recent' => $this->recent(),
        ]);
    }

    /**
     * União das 5 criações mais recentes entre questions/topics/contents,
     * ordenadas por created_at desc (sem paginação — é só uma prévia).
     */
    private function recent(): array
    {
        $questions = Question::with('contents')->latest()->limit(5)->get()
            ->map(fn (Question $question) => [
                'type' => 'question',
                'id' => $question->id,
                'title' => Str::limit(
                    QuestionResource::extractPlainText($question->statement) ?? '(sem texto no enunciado)',
                    60,
                ).' — questão '.(self::TYPE_LABELS[$question->type] ?? $question->type),
                'subtitle' => $this->questionSubtitle($question),
                'created_at' => $question->created_at,
            ]);

        $topics = Topic::with('content')->latest()->limit(5)->get()
            ->map(fn (Topic $topic) => [
                'type' => 'topic',
                'id' => $topic->id,
                'title' => 'Tópico "'.$topic->name.'" criado',
                'subtitle' => 'Conteúdo: '.$topic->content->name,
                'created_at' => $topic->created_at,
            ]);

        $contents = Content::withCount('topics')->latest()->limit(5)->get()
            ->map(fn (Content $content) => [
                'type' => 'content',
                'id' => $content->id,
                'title' => 'Conteúdo "'.$content->name.'" criado',
                'subtitle' => $content->topics_count === 0
                    ? '0 tópicos ainda'
                    : "{$content->topics_count} tópico(s)",
                'created_at' => $content->created_at,
            ]);

        return $questions->concat($topics)->concat($contents)
            ->sortByDesc('created_at')
            ->take(5)
            ->values()
            ->map(fn (array $item) => [
                ...$item,
                'created_at' => $item['created_at']->toISOString(),
            ])
            ->all();
    }

    private function questionSubtitle(Question $question): string
    {
        $difficulty = self::DIFFICULTY_LABELS[$question->difficulty] ?? $question->difficulty;
        $content = $question->contents->first();

        return $content ? "{$content->name} · {$difficulty}" : $difficulty;
    }
}
