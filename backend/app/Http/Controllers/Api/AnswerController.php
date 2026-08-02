<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnswerQuestionRequest;
use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Services\ScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    public function __construct(private readonly ScoringService $scoringService) {}

    public function store(AnswerQuestionRequest $request, Question $question): JsonResponse
    {
        $user = $request->user();
        $isCorrect = $this->isCorrect($request, $question);

        $answeredQuestion = AnsweredQuestion::create([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'is_correct' => $isCorrect,
            'points_earned' => $this->scoringService->pointsForAttempt($user, $question, $isCorrect),
            'answered_at' => now(),
        ]);

        return response()->json([
            'is_correct' => $isCorrect,
            'points_earned' => $answeredQuestion->points_earned,
            'correct_answer' => $this->correctAnswer($question),
            'text_resolution' => $question->text_resolution,
        ], 201);
    }

    private function isCorrect(Request $request, Question $question): bool
    {
        return match ($question->type) {
            'multiple_choice' => (bool) $question->options()
                ->where('id', $request->integer('option_id'))
                ->value('is_correct'),
            'true_false' => $request->input('answer') === $question->correct_answer,
            'essay' => $request->boolean('self_corrected'),
            default => false,
        };
    }

    private function correctAnswer(Question $question): ?string
    {
        return match ($question->type) {
            'multiple_choice' => $question->options()->where('is_correct', true)->value('text'),
            default => $question->correct_answer,
        };
    }
}
