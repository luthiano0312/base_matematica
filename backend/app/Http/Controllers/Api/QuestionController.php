<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    /** Mensagem exata da Spec_Modal_Confirmacao_Exclusao#3 (RN11). */
    private const BLOCK_REASON = 'Esta questão já tem respostas de alunos registradas. Excluir apagaria parte do histórico de pontuação deles.';

    /**
     * GET /api/questions
     * Filtros opcionais: content_id, topic_id, type, difficulty, search, per_page.
     */
    public function index(Request $request)
    {
        $query = Question::query()->with(['options', 'contents', 'topics']);

        if ($request->filled('content_id')) {
            $query->whereHas('contents', fn ($q) => $q->where('contents.id', $request->integer('content_id')));
        }

        if ($request->filled('topic_id')) {
            $query->whereHas('topics', fn ($q) => $q->where('topics.id', $request->integer('topic_id')));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->string('difficulty'));
        }

        if ($request->filled('search')) {
            // ILIKE no pgsql para busca case-insensitive no enunciado.
            $operator = $query->getModel()->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where('statement', $operator, '%'.$request->string('search')->value().'%');
        }

        $perPage = $request->integer('per_page', 20);

        return QuestionResource::collection($query->latest()->paginate($perPage));
    }

    /**
     * POST /api/questions
     */
    public function store(StoreQuestionRequest $request)
    {
        $question = DB::transaction(function () use ($request) {
            $question = Question::create($request->only([
                'statement',
                'type',
                'correct_answer',
                'difficulty',
                'text_resolution',
                'video_resolution_url',
            ]));

            $this->syncOptions($question, $request->input('options', []));

            $question->contents()->sync($request->input('content_ids'));
            $question->topics()->sync($request->input('topic_ids', []));

            return $question;
        });

        return new QuestionResource(
            $question->load(['options', 'contents', 'topics'])
        );
    }

    /**
     * GET /api/questions/{question}
     */
    public function show(Question $question)
    {
        return new QuestionResource(
            $question->load(['options', 'contents', 'topics'])
        );
    }

    /**
     * PUT /api/questions/{question}
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        DB::transaction(function () use ($request, $question) {
            $question->update($request->only([
                'statement',
                'type',
                'correct_answer',
                'difficulty',
                'text_resolution',
                'video_resolution_url',
            ]));

            // Replace total das options (mais simples e seguro que diff manual).
            $question->options()->delete();
            $this->syncOptions($question, $request->input('options', []));

            $question->contents()->sync($request->input('content_ids'));
            $question->topics()->sync($request->input('topic_ids', []));
        });

        return new QuestionResource(
            $question->load(['options', 'contents', 'topics'])
        );
    }

    /**
     * GET /admin/questions/{question}/can-delete — verificação síncrona de
     * dependências antes do modal de exclusão (Spec_Modal_Confirmacao_Exclusao#3).
     */
    public function canDelete(Question $question): JsonResponse
    {
        $answersCount = $question->answers()->count();

        return response()->json([
            'can_delete' => $answersCount === 0,
            'reason' => $answersCount > 0 ? self::BLOCK_REASON : null,
            'counts' => [
                'answers' => $answersCount,
            ],
        ]);
    }

    /**
     * DELETE /api/questions/{question}
     */
    public function destroy(Question $question)
    {
        // RN11 — answered_questions preserva o histórico de pontuação dos alunos;
        // bloqueia exclusão em vez de apagar (o modal avisa antes; aqui é defesa).
        if ($question->answers()->exists()) {
            return response()->json(['message' => self::BLOCK_REASON], 409);
        }

        // options/question_content/question_topic caem em cascata (FK cascadeOnDelete).
        $question->delete();

        return response()->noContent();
    }

    protected function syncOptions(Question $question, array $options): void
    {
        if ($question->type !== 'multiple_choice' || empty($options)) {
            return;
        }

        foreach ($options as $index => $option) {
            $question->options()->create([
                'text' => $option['text'],
                'is_correct' => $option['is_correct'],
                'order' => $index,
            ]);
        }
    }
}
