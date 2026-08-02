<?php

namespace Database\Factories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'statement' => fake()->sentence(8).'?',
            'type' => 'multiple_choice',
            'correct_answer' => null,
            'difficulty' => fake()->randomElement(['easy', 'medium', 'hard']),
            'text_resolution' => fake()->paragraph(),
            'video_resolution_url' => null,
        ];
    }

    public function easy(): static
    {
        return $this->state(fn (array $attributes) => ['difficulty' => 'easy']);
    }

    public function medium(): static
    {
        return $this->state(fn (array $attributes) => ['difficulty' => 'medium']);
    }

    public function hard(): static
    {
        return $this->state(fn (array $attributes) => ['difficulty' => 'hard']);
    }

    public function multipleChoice(): static
    {
        return $this->state(fn (array $attributes) => ['type' => 'multiple_choice']);
    }

    public function trueFalse(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'true_false',
            'correct_answer' => fake()->randomElement(['certo', 'errado']),
        ]);
    }

    public function essay(): static
    {
        return $this->state(fn (array $attributes) => ['type' => 'essay']);
    }
}
