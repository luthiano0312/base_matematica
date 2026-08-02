<?php

namespace App\Services;

use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Models\User;

class ScoringService
{
    public const EASY_POINTS = 10;

    public const MEDIUM_POINTS = 15;

    public const HARD_POINTS = 20;

    public const RETRY_POINTS = 5;

    public function pointsForAttempt(User $user, Question $question, bool $isCorrect): int
    {
        $history = AnsweredQuestion::query()
            ->where('user_id', $user->id)
            ->where('question_id', $question->id)
            ->get();

        if ($history->contains('is_correct', true)) {
            return 0;
        }

        if ($history->isNotEmpty()) {
            return $isCorrect ? self::RETRY_POINTS : 0;
        }

        return $isCorrect ? $this->fullPointsForDifficulty($question->difficulty) : 0;
    }

    public function fullPointsForDifficulty(string $difficulty): int
    {
        return match ($difficulty) {
            'easy' => self::EASY_POINTS,
            'medium' => self::MEDIUM_POINTS,
            'hard' => self::HARD_POINTS,
            default => 0,
        };
    }
}
