<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Question;
use Illuminate\Http\Request;

trait FiltersQuestions
{
    protected function questionQuery(Request $request)
    {
        $query = Question::query()->with(['options', 'contents', 'topics']);

        if ($request->filled('content_id')) {
            $query->whereHas('contents', fn ($q) => $q->where('contents.id', $request->integer('content_id')));
        }

        if ($request->filled('topic_id')) {
            $query->whereHas('topics', fn ($q) => $q->where('topics.id', $request->integer('topic_id')));
        }

        $types = $this->typesFrom($request);

        if ($types !== []) {
            $query->whereIn('type', $types);
        }

        return $query;
    }

    /**
     * Suporta filtro por um ou mais tipos: `types[]` (array) ou `type` (único).
     *
     * @return list<string>
     */
    protected function typesFrom(Request $request): array
    {
        if ($request->filled('types')) {
            return $request->input('types');
        }

        if ($request->filled('type')) {
            return [$request->input('type')];
        }

        return [];
    }
}
