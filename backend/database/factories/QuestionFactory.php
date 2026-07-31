<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(8) . '?',
            'description' => fake()->optional()->paragraph(),
            'options' => [
                'A) ' . fake()->word(),
                'B) ' . fake()->word(),
                'C) ' . fake()->word(),
                'D) ' . fake()->word(),
                'E) ' . fake()->word(),
            ],
            'correct_answer' => 'A',
            'difficulty' => fake()->randomElement(['facil', 'medio', 'dificil']),
        ];
    }
}