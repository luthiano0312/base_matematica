<?php

namespace Tests\Feature;

use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnswerQuestionTest extends TestCase
{
    use RefreshDatabase;

    private function makeMultipleChoice(): array
    {
        $question = Question::factory()->multipleChoice()->easy()->create();

        $correctOption = $question->options()->create([
            'text' => 'Resposta correta',
            'is_correct' => true,
            'order' => 0,
        ]);

        $question->options()->create([
            'text' => 'Resposta errada',
            'is_correct' => false,
            'order' => 1,
        ]);

        return [$question, $correctOption];
    }

    public function test_multipla_escolha_opcao_correta_ganha_pontos_e_cria_registro(): void
    {
        Sanctum::actingAs(User::factory()->create());
        [$question, $correctOption] = $this->makeMultipleChoice();

        $response = $this->postJson("/api/questions/{$question->id}/answers", [
            'option_id' => $correctOption->id,
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'is_correct' => true,
                'points_earned' => 10,
            ]);

        $this->assertDatabaseCount('answered_questions', 1);
        $this->assertDatabaseHas('answered_questions', [
            'question_id' => $question->id,
            'is_correct' => true,
            'points_earned' => 10,
        ]);
    }

    public function test_multipla_escolha_opcao_incorreta_nao_ganha_pontos(): void
    {
        Sanctum::actingAs(User::factory()->create());
        [$question, $correctOption] = $this->makeMultipleChoice();

        $wrongOption = $question->options()->where('is_correct', false)->first();

        $response = $this->postJson("/api/questions/{$question->id}/answers", [
            'option_id' => $wrongOption->id,
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'is_correct' => false,
                'points_earned' => 0,
            ]);
    }

    public function test_certo_errado_resposta_certa_ganha_pontos(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $question = Question::factory()->trueFalse()->create(['correct_answer' => 'certo']);

        $response = $this->postJson("/api/questions/{$question->id}/answers", [
            'answer' => 'certo',
        ]);

        $response
            ->assertStatus(201)
            ->assertJson(['is_correct' => true]);

        $this->assertDatabaseHas('answered_questions', [
            'question_id' => $question->id,
            'is_correct' => true,
        ]);
    }

    public function test_certo_errado_resposta_errada_nao_ganha_pontos(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $question = Question::factory()->trueFalse()->create(['correct_answer' => 'certo']);

        $response = $this->postJson("/api/questions/{$question->id}/answers", [
            'answer' => 'errado',
        ]);

        $response
            ->assertStatus(201)
            ->assertJson(['is_correct' => false]);

        $this->assertDatabaseHas('answered_questions', [
            'question_id' => $question->id,
            'is_correct' => false,
        ]);
    }

    public function test_dissertativa_autoavaliada_como_acertou_aplica_pontuacao_normal(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $question = Question::factory()->essay()->medium()->create();

        $response = $this->postJson("/api/questions/{$question->id}/answers", [
            'answer' => 'Minha resolução aqui',
            'self_corrected' => true,
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'is_correct' => true,
                'points_earned' => 15,
            ]);
    }

    public function test_dissertativa_autoavaliada_como_errou_nao_ganha_pontos(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $question = Question::factory()->essay()->medium()->create();

        $response = $this->postJson("/api/questions/{$question->id}/answers", [
            'answer' => 'Minha resolução aqui',
            'self_corrected' => false,
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'is_correct' => false,
                'points_earned' => 0,
            ]);
    }

    public function test_responder_a_mesma_questao_duas_vezes_cria_dois_registros(): void
    {
        Sanctum::actingAs(User::factory()->create());
        [$question, $correctOption] = $this->makeMultipleChoice();

        $this->postJson("/api/questions/{$question->id}/answers", ['option_id' => $correctOption->id]);
        $this->postJson("/api/questions/{$question->id}/answers", ['option_id' => $correctOption->id]);

        $this->assertDatabaseCount('answered_questions', 2);
        $this->assertSame(
            2,
            AnsweredQuestion::where('question_id', $question->id)->count()
        );
    }

    public function test_sem_autenticacao_retorna_401(): void
    {
        [$question] = $this->makeMultipleChoice();

        $this->postJson("/api/questions/{$question->id}/answers", [
            'option_id' => 1,
        ])->assertStatus(401);
    }

    public function test_option_id_que_nao_pertence_a_questao_e_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());
        [$question, $correctOption] = $this->makeMultipleChoice();

        $otherQuestion = Question::factory()->multipleChoice()->create();
        $foreignOption = $otherQuestion->options()->create([
            'text' => 'Opção de outra questão',
            'is_correct' => true,
            'order' => 0,
        ]);

        $this->postJson("/api/questions/{$question->id}/answers", [
            'option_id' => $foreignOption->id,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['option_id']);
    }

    public function test_questao_inexistente_retorna_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/questions/999999/answers', [
            'option_id' => 1,
        ])->assertStatus(404);
    }

    public function test_certo_errado_valor_invalido_e_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $question = Question::factory()->trueFalse()->create(['correct_answer' => 'certo']);

        $this->postJson("/api/questions/{$question->id}/answers", [
            'answer' => 'talvez',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['answer']);
    }

    public function test_resposta_inclui_gabarito_e_resolucao(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $question = Question::factory()->multipleChoice()->easy()->create([
            'text_resolution' => 'Resolução passo a passo',
        ]);
        $correctOption = $question->options()->create([
            'text' => 'Correta',
            'is_correct' => true,
            'order' => 0,
        ]);

        $this->postJson("/api/questions/{$question->id}/answers", [
            'option_id' => $correctOption->id,
        ])
            ->assertStatus(201)
            ->assertJson([
                'correct_answer' => $correctOption->text,
                'text_resolution' => 'Resolução passo a passo',
            ]);
    }
}
