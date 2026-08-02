<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnsweredQuestion;
use App\Models\User;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly StreakService $streakService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalAnswered = $user->answers()->count();
        $correct = $user->answers()->where('is_correct', true)->count();

        return response()->json([
            'points' => (int) $user->answers()->sum('points_earned'),
            'streak' => $this->streakService->currentStreak($user),
            'total_answered' => $totalAnswered,
            'correct' => $correct,
            'incorrect' => $totalAnswered - $correct,
            'accuracy_percentage' => $totalAnswered > 0
                ? (int) round($correct / $totalAnswered * 100)
                : null,
            'best_topic' => $this->bestTopic($user),
        ]);
    }

    private function bestTopic(User $user): ?array
    {
        $best = AnsweredQuestion::query()
            ->join('question_topic', 'answered_questions.question_id', '=', 'question_topic.question_id')
            ->join('topics', 'question_topic.topic_id', '=', 'topics.id')
            ->where('answered_questions.user_id', $user->id)
            ->where('answered_questions.is_correct', true)
            ->selectRaw('topics.id, topics.name, count(*) as correct_count')
            ->groupBy('topics.id', 'topics.name')
            ->orderByDesc('correct_count')
            ->orderBy('topics.name')
            ->first();

        if (! $best) {
            return null;
        }

        return [
            'id' => (int) $best->id,
            'name' => $best->name,
            'correct_count' => (int) $best->correct_count,
        ];
    }
}
