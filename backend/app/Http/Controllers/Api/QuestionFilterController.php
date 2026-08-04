<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\FiltersQuestions;
use App\Http\Controllers\Controller;
use App\Http\Requests\IndexQuestionsRequest;
use App\Http\Resources\QuestionResource;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class QuestionFilterController extends Controller
{
    use FiltersQuestions;

    public function __construct(private readonly RecommendationService $recommendationService) {}

    public function index(IndexQuestionsRequest $request)
    {
        if ($this->hasNoFilters($request)) {
            return QuestionResource::collection($this->defaultLot($request));
        }

        $questions = $request->input('mode') === 'progression'
            ? $this->inProgressionMode($request)
            : $this->inNormalMode($request);

        return QuestionResource::collection($questions);
    }

    protected function inNormalMode(Request $request)
    {
        $query = $this->questionQuery($request);

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->string('difficulty'));
        }

        if ($request->filled('quantidade')) {
            $query->limit($request->integer('quantidade'));
        }

        return $query->orderBy('id')->get();
    }

    protected function inProgressionMode(Request $request)
    {
        $total = $request->integer('quantidade');
        $base = intdiv($total, 3);
        $remainder = $total % 3;

        $quotas = [
            'easy' => $base + ($remainder >= 1 ? 1 : 0),
            'medium' => $base + ($remainder >= 2 ? 1 : 0),
            'hard' => $base,
        ];

        $questions = collect();

        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            $query = $this->questionQuery($request)
                ->where('difficulty', $difficulty)
                ->limit($quotas[$difficulty]);

            $questions = $questions->merge($query->orderBy('id')->get());
        }

        return $questions->values();
    }

    protected function hasNoFilters(Request $request): bool
    {
        foreach (['content_id', 'topic_id', 'difficulty', 'type', 'types', 'mode', 'quantidade'] as $key) {
            if ($request->filled($key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Lote padrão para filtros vazios (RF12): conteúdo recomendado em cascata,
     * 3 fáceis + 3 médias + 3 difíceis (fallback por insuficiência não completa a diferença).
     */
    protected function defaultLot(Request $request)
    {
        $content = $this->recommendationService->pickContent($request->user());

        if (! $content) {
            return collect();
        }

        $questions = collect();

        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            $questions = $questions->merge(
                $content->questions()
                    ->with(['options', 'contents', 'topics'])
                    ->where('difficulty', $difficulty)
                    ->limit(3)
                    ->orderBy('id')
                    ->get()
            );
        }

        return $questions->values();
    }
}
