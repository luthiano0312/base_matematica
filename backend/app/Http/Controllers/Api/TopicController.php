<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    /**
     * GET /admin/topics — opcionalmente filtrado por `content_id`
     * (select em cascata da listagem de questões).
     */
    public function index(Request $request): JsonResponse
    {
        $topics = Topic::query()
            ->when(
                $request->filled('content_id'),
                fn ($q) => $q->where('content_id', $request->integer('content_id')),
            )
            ->withCount('questions')
            ->orderBy('name')
            ->get()
            ->map(fn (Topic $topic) => [
                'id' => $topic->id,
                'name' => $topic->name,
                'content_id' => $topic->content_id,
                'questions_count' => $topic->questions_count,
            ]);

        return response()->json($topics);
    }

    public function store(StoreTopicRequest $request): JsonResponse
    {
        $topic = Topic::create($request->validated());

        return response()->json($topic, 201);
    }

    public function show(Topic $topic): JsonResponse
    {
        return response()->json($topic);
    }

    public function update(UpdateTopicRequest $request, Topic $topic): JsonResponse
    {
        // RN16 — mover um Tópico de Conteúdo quebraria a validação das questões
        // já vinculadas; bloqueado por decisão do time (decisão da Etapa 0 do plano).
        $newContentId = (int) $request->validated('content_id');

        if ($newContentId !== $topic->content_id && $topic->questions()->exists()) {
            return response()->json([
                'message' => 'Este tópico tem questões vinculadas e não pode mudar de conteúdo.',
            ], 422);
        }

        $topic->update($request->validated());

        return response()->json($topic->fresh());
    }

    /**
     * GET /admin/topics/{topic}/can-delete — verificação síncrona de
     * dependências (Spec_Modal_Confirmacao_Exclusao#3).
     */
    public function canDelete(Topic $topic): JsonResponse
    {
        $questionsCount = $topic->questions()->count();

        return response()->json([
            'can_delete' => $questionsCount === 0,
            'reason' => $questionsCount > 0
                ? "Este tópico tem {$questionsCount} questão(ões) vinculada(s)."
                : null,
            'counts' => [
                'questions' => $questionsCount,
            ],
        ]);
    }

    public function destroy(Topic $topic): JsonResponse
    {
        $questionsCount = $topic->questions()->count();

        if ($questionsCount > 0) {
            return response()->json([
                'message' => "Este tópico tem {$questionsCount} questão(ões) vinculada(s).",
            ], 409);
        }

        $topic->delete();

        return response()->json(null, 204);
    }
}
