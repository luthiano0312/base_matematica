<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContentRequest;
use App\Http\Requests\UpdateContentRequest;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    /**
     * GET /admin/contents — Conteúdos com Tópicos aninhados e contagens
     * (Spec_Admin_Conteudos_Topicos#Lista de cards de Conteúdo), sem N+1.
     */
    public function index(Request $request): JsonResponse
    {
        $contents = Content::query()
            ->with(['topics' => fn ($q) => $q->withCount('questions')->orderBy('name')])
            ->withCount(['topics', 'questions'])
            ->orderBy('name')
            ->get()
            ->map(fn (Content $content) => [
                'id' => $content->id,
                'name' => $content->name,
                'topics_count' => $content->topics_count,
                'questions_count' => $content->questions_count,
                'topics' => $content->topics->map(fn ($topic) => [
                    'id' => $topic->id,
                    'name' => $topic->name,
                    'content_id' => $topic->content_id,
                    'questions_count' => $topic->questions_count,
                ]),
            ]);

        return response()->json($contents);
    }

    public function store(StoreContentRequest $request): JsonResponse
    {
        $content = Content::create($request->validated());

        return response()->json($content, 201);
    }

    public function show(Content $content): JsonResponse
    {
        return response()->json($content);
    }

    public function update(UpdateContentRequest $request, Content $content): JsonResponse
    {
        $content->update($request->validated());

        return response()->json($content);
    }

    /**
     * GET /admin/contents/{content}/can-delete — verificação síncrona de
     * dependências antes de o modal de exclusão renderizar o estado final
     * (Spec_Modal_Confirmacao_Exclusao#3).
     */
    public function canDelete(Content $content): JsonResponse
    {
        $topicsCount = $content->topics()->count();
        $questionsCount = $content->questions()->count();

        return response()->json([
            'can_delete' => $topicsCount === 0 && $questionsCount === 0,
            'reason' => $this->blockReason($topicsCount, $questionsCount),
            'counts' => [
                'topics' => $topicsCount,
                'questions' => $questionsCount,
            ],
        ]);
    }

    public function destroy(Content $content): JsonResponse
    {
        $topicsCount = $content->topics()->count();
        $questionsCount = $content->questions()->count();

        // RN16 — bloqueia exclusão com dependentes (o modal avisa antes; aqui é defesa).
        if ($topicsCount > 0 || $questionsCount > 0) {
            return response()->json([
                'message' => $this->blockReason($topicsCount, $questionsCount),
            ], 409);
        }

        $content->delete();

        return response()->json(null, 204);
    }

    private function blockReason(int $topicsCount, int $questionsCount): ?string
    {
        if ($topicsCount > 0 && $questionsCount > 0) {
            return "Este conteúdo tem {$topicsCount} tópico(s) e {$questionsCount} questão(ões) vinculada(s).";
        }

        if ($topicsCount > 0) {
            return "Este conteúdo tem {$topicsCount} tópico(s) vinculado(s).";
        }

        if ($questionsCount > 0) {
            return "Este conteúdo tem {$questionsCount} questão(ões) vinculada(s).";
        }

        return null;
    }
}
