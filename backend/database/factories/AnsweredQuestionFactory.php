<?php

namespace Database\Factories;

use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<AnsweredQuestion>
 */
class AnsweredQuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'question_id' => Question::factory(),
            'is_correct' => fake()->boolean(),
            'points_earned' => 0,
            'answered_at' => Carbon::now(),
        ];
    }
}
