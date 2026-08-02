<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicIndexQuestionsRequest;
use App\Http\Resources\PublicQuestionResource;
use App\Models\Question;
use Illuminate\Http\Request;

class PublicQuestionController extends Controller
{
    public function index(PublicIndexQuestionsRequest $request)
    {
        $questions = collect();

        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            $query = $this->baseQuery($request)
                ->where('difficulty', $difficulty)
                ->limit(2);

            $questions = $questions->merge($query->orderBy('id')->get());
        }

        return PublicQuestionResource::collection($questions->values());
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
