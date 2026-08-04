<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuestionResource;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(private readonly RecommendationService $recommendationService) {}

    public function index(Request $request)
    {
        $content = $this->recommendationService->pickContent($request->user());

        if (! $content) {
            return QuestionResource::collection(collect());
        }

        $questions = $content->questions()
            ->with(['options', 'contents', 'topics'])
            ->orderBy('id')
            ->get();

        return QuestionResource::collection($questions);
    }
}
