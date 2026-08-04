<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\FiltersQuestions;
use App\Http\Controllers\Controller;
use App\Http\Requests\PublicIndexQuestionsRequest;
use App\Http\Resources\PublicQuestionResource;

class PublicQuestionController extends Controller
{
    use FiltersQuestions;

    public function index(PublicIndexQuestionsRequest $request)
    {
        $questions = collect();

        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            $query = $this->questionQuery($request)
                ->where('difficulty', $difficulty)
                ->limit(2);

            $questions = $questions->merge($query->orderBy('id')->get());
        }

        return PublicQuestionResource::collection($questions->values());
    }
}
