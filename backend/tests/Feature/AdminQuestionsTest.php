<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\AnsweredQuestion;
use App\Models\Content;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminQuestionsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): void
    {
        Sanctum::actingAs(Admin::factory()->create(), ['*'], 'admin');
    }

    public function test_can_delete_livre_quando_sem_respostas(): void
    {
        $this->admin();
        $question = Question::factory()->create();

        $this->getJson("/api/admin/questions/{$question->id}/can-delete")
            ->assertOk()
            ->assertJson([
                'can_delete' => true,
                'reason' => null,
                'counts' => ['answers' => 0],
            ]);
    }

    public function test_can_delete_permitido_mesmo_com_respostas_registradas(): void
    {
        $this->admin();
        $question = Question::factory()->create();
        AnsweredQuestion::factory()->create(['question_id' => $question->id]);

        $this->getJson("/api/admin/questions/{$question->id}/can-delete")
            ->assertOk()
            ->assertJson([
                'can_delete' => true,
                'counts' => ['answers' => 1],
            ])
            ->assertJsonPath('reason', fn ($reason) => $reason !== null);
    }

    public function test_destroy_remove_questao_mesmo_com_respostas_registradas(): void
    {
        $this->admin();
        $question = Question::factory()->create();
        $answer = AnsweredQuestion::factory()->create([
            'question_id' => $question->id,
            'points_earned' => 10,
        ]);

        $this->deleteJson("/api/admin/questions/{$question->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('questions', ['id' => $question->id]);

        // A resposta continua existindo, com question_id nulo e pontuação intacta.
        $this->assertDatabaseHas('answered_questions', [
            'id' => $answer->id,
            'question_id' => null,
            'points_earned' => 10,
        ]);
    }

    public function test_pontuacao_do_aluno_e_preservada_apos_exclusao_da_questao(): void
    {
        $this->admin();
        $user = User::factory()->create();
        $question = Question::factory()->create();
        AnsweredQuestion::factory()->create([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'points_earned' => 15,
            'is_correct' => true,
        ]);

        $pontosAntes = $user->answers()->sum('points_earned');

        $this->deleteJson("/api/admin/questions/{$question->id}")
            ->assertNoContent();

        $pontosDepois = $user->fresh()->answers()->sum('points_earned');

        $this->assertSame($pontosAntes, $pontosDepois);
    }

    public function test_destroy_remove_quando_sem_respostas(): void
    {
        $this->admin();
        $question = Question::factory()->create();

        $this->deleteJson("/api/admin/questions/{$question->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }

    public function test_statement_plain_substitui_data_latex_e_decodifica_entidades(): void
    {
        $this->admin();
        $question = Question::factory()->create([
            'statement' => '<p>Quanto é <span data-latex="\frac{1}{2}">\frac{1}{2}</span> &amp; um?</p>',
        ]);

        $this->getJson("/api/admin/questions/{$question->id}")
            ->assertOk()
            ->assertJsonPath('data.statement_plain', 'Quanto é \frac{1}{2} & um?');
    }

    public function test_statement_plain_e_null_quando_nao_sobra_texto(): void
    {
        $this->admin();
        $question = Question::factory()->create(['statement' => '<p>   </p>']);

        $this->getJson("/api/admin/questions/{$question->id}")
            ->assertOk()
            ->assertJsonPath('data.statement_plain', null);
    }

    public function test_index_filtra_por_search_no_enunciado(): void
    {
        $this->admin();
        Question::factory()->create(['statement' => '<p>Teorema de Pitágoras</p>']);
        Question::factory()->create(['statement' => '<p>Regra de três</p>']);

        $this->getJson('/api/admin/questions?search=pitágoras')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_overview_agrega_counts_e_recentes(): void
    {
        $this->admin();
        $content = Content::factory()->create([
            'name' => 'Frações',
            'created_at' => now()->subMinutes(3),
        ]);
        $topic = Topic::factory()->create([
            'content_id' => $content->id,
            'created_at' => now()->subMinutes(2),
        ]);
        $question = Question::factory()->create([
            'statement' => '<p>Quanto é 1+1?</p>',
            'type' => 'multiple_choice',
            'difficulty' => 'easy',
            'created_at' => now()->subMinute(),
        ]);
        $question->contents()->sync([$content->id]);
        $question->topics()->sync([$topic->id]);

        $this->getJson('/api/admin/overview')
            ->assertOk()
            ->assertJsonStructure([
                'counts' => ['questions', 'topics', 'contents'],
                'topics_without_questions',
                'recent' => [['type', 'id', 'title', 'subtitle', 'created_at']],
            ])
            ->assertJsonPath('counts.questions', 1)
            ->assertJsonPath('counts.topics', 1)
            ->assertJsonPath('counts.contents', 1)
            ->assertJsonPath('topics_without_questions', 0)
            ->assertJsonPath('recent.0.type', 'question')
            ->assertJsonPath('recent.0.title', 'Quanto é 1+1? — questão múltipla escolha')
            ->assertJsonPath('recent.0.subtitle', 'Frações · Fácil');
    }
}
