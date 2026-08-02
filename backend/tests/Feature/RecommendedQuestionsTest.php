<?php

namespace Tests\Feature;

use App\Models\AnsweredQuestion;
use App\Models\Content;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecommendedQuestionsTest extends TestCase
{
    use RefreshDatabase;

    private function answer(User $user, Question $question, bool $isCorrect): void
    {
        AnsweredQuestion::factory()->create([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'is_correct' => $isCorrect,
            'points_earned' => $isCorrect ? 10 : 0,
            'answered_at' => Carbon::parse('2026-07-31 10:00:00', 'America/Sao_Paulo')->setTimezone('UTC'),
        ]);
    }

    private function questionIn(Content $content): Question
    {
        $question = Question::factory()->create();
        $question->contents()->attach($content->id);

        return $question;
    }

    public function test_interesse_unico_recomenda_questoes_do_conteudo_marcado(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $content = Content::factory()->create();
        $questions = collect([$this->questionIn($content), $this->questionIn($content), $this->questionIn($content)]);
        $user->interests()->sync([$content->id]);

        $response = $this->getJson('/api/me/recommended-questions')
            ->assertStatus(200)
            ->assertJsonCount(3, 'data');

        $ids = collect($response->json('data'))->pluck('id')->all();

        foreach ($ids as $id) {
            $this->assertTrue(
                DB::table('question_content')
                    ->where('question_id', $id)
                    ->where('content_id', $content->id)
                    ->exists(),
                "Questão {$id} deveria pertencer ao conteúdo marcado."
            );
        }
    }

    public function test_sem_interesse_recomenda_conteudo_com_mais_acertos(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $contentA = Content::factory()->create();
        $contentB = Content::factory()->create();

        $a1 = $this->questionIn($contentA);
        $a2 = $this->questionIn($contentA);
        $b1 = $this->questionIn($contentB);

        $this->answer($user, $a1, true);
        $this->answer($user, $a2, true);
        $this->answer($user, $b1, true);

        $response = $this->getJson('/api/me/recommended-questions')
            ->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->sort()->values()->all();

        $this->assertSame([$a1->id, $a2->id], $ids);
    }

    public function test_aluno_novo_sem_historico_recomenda_conteudo_aleatorio(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $content = Content::factory()->create();
        $this->questionIn($content);

        $this->getJson('/api/me/recommended-questions')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_sem_autenticacao_retorna_401(): void
    {
        $this->getJson('/api/me/recommended-questions')->assertStatus(401);
    }
}
