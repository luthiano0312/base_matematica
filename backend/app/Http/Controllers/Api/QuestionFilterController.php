<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexQuestionsRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionFilterController extends Controller
{
    public function index(IndexQuestionsRequest $request)
    {
        $questions = $request->input('mode') === 'progression'
            ? $this->inProgressionMode($request)
            : $this->inNormalMode($request);

        return QuestionResource::collection($questions);
    }

    protected function inNormalMode(Request $request)
    {
        $query = $this->baseQuery($request);

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
            $query = $this->baseQuery($request)
                ->where('difficulty', $difficulty)
                ->limit($quotas[$difficulty]);

            $questions = $questions->merge($query->orderBy('id')->get());
        }

        return $questions->values();
    }

    protected function baseQuery(Request $request)
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

        return $query;
    }
}
