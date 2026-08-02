<?php

namespace Tests\Feature;

use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function answer(User $user, Question $question, bool $isCorrect, int $points, string $datetimeInSaoPaulo): void
    {
        AnsweredQuestion::factory()->create([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'is_correct' => $isCorrect,
            'points_earned' => $points,
            'answered_at' => Carbon::parse($datetimeInSaoPaulo, 'America/Sao_Paulo')->setTimezone('UTC'),
        ]);
    }

    public function test_dashboard_sem_nenhuma_tentativa_retorna_contadores_zerados(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/me/dashboard')
            ->assertStatus(200)
            ->assertJson([
                'points' => 0,
                'streak' => 0,
                'total_answered' => 0,
                'correct' => 0,
                'incorrect' => 0,
                'accuracy_percentage' => null,
                'best_topic' => null,
            ]);
    }

    public function test_dashboard_com_tentativas_agrega_pontos_contadores_streak_e_melhor_topico(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $topicA = Topic::factory()->create();
        $topicB = Topic::factory()->create();

        $q1 = Question::factory()->easy()->create();
        $q1->topics()->attach($topicA);
        $this->answer($user, $q1, true, 10, '2026-07-30 10:00:00');

        $q2 = Question::factory()->medium()->create();
        $q2->topics()->attach($topicA);
        $this->answer($user, $q2, true, 15, '2026-07-30 11:00:00');

        $q3 = Question::factory()->hard()->create();
        $q3->topics()->attach($topicB);
        $this->answer($user, $q3, false, 0, '2026-07-31 10:00:00');

        $q4 = Question::factory()->easy()->create();
        $q4->topics()->attach($topicB);
        $this->answer($user, $q4, false, 0, '2026-08-01 09:00:00');

        $q5 = Question::factory()->medium()->create();
        $q5->topics()->attach($topicA);
        $this->answer($user, $q5, true, 5, '2026-08-01 10:00:00');

        $this->getJson('/api/me/dashboard')
            ->assertStatus(200)
            ->assertJson([
                'points' => 30,
                'streak' => 3,
                'total_answered' => 5,
                'correct' => 3,
                'incorrect' => 2,
                'accuracy_percentage' => 60,
                'best_topic' => [
                    'id' => $topicA->id,
                    'name' => $topicA->name,
                    'correct_count' => 3,
                ],
            ]);
    }

    public function test_dashboard_com_tentativas_mas_sem_acertos_retorna_percentual_zero_e_sem_melhor_topico(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $topic = Topic::factory()->create();

        $q1 = Question::factory()->easy()->create();
        $q1->topics()->attach($topic);
        $this->answer($user, $q1, false, 0, '2026-07-31 10:00:00');

        $q2 = Question::factory()->easy()->create();
        $q2->topics()->attach($topic);
        $this->answer($user, $q2, false, 0, '2026-08-01 10:00:00');

        $this->getJson('/api/me/dashboard')
            ->assertStatus(200)
            ->assertJson([
                'points' => 0,
                'streak' => 2,
                'total_answered' => 2,
                'correct' => 0,
                'incorrect' => 2,
                'accuracy_percentage' => 0,
                'best_topic' => null,
            ]);
    }

    public function test_acertos_apenas_em_questoes_sem_topico_retorna_sem_melhor_topico(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $q1 = Question::factory()->easy()->create();
        $this->answer($user, $q1, true, 10, '2026-08-01 09:00:00');

        $q2 = Question::factory()->easy()->create();
        $this->answer($user, $q2, true, 10, '2026-08-01 10:00:00');

        $this->getJson('/api/me/dashboard')
            ->assertStatus(200)
            ->assertJson([
                'correct' => 2,
                'best_topic' => null,
            ]);
    }

    public function test_empate_entre_topicos_retorna_o_primeiro_em_ordem_alfabetica(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $topicAritmetica = Topic::factory()->create(['name' => 'Aritmetica']);
        $topicGeometria = Topic::factory()->create(['name' => 'Geometria']);

        $q1 = Question::factory()->easy()->create();
        $q1->topics()->attach($topicGeometria);
        $this->answer($user, $q1, true, 10, '2026-08-01 09:00:00');

        $q2 = Question::factory()->easy()->create();
        $q2->topics()->attach($topicAritmetica);
        $this->answer($user, $q2, true, 10, '2026-08-01 10:00:00');

        $this->getJson('/api/me/dashboard')
            ->assertStatus(200)
            ->assertJson([
                'best_topic' => [
                    'id' => $topicAritmetica->id,
                    'name' => 'Aritmetica',
                    'correct_count' => 1,
                ],
            ]);
    }

    public function test_dashboard_sem_autenticacao_retorna_401(): void
    {
        $this->getJson('/api/me/dashboard')->assertStatus(401);
    }
}
