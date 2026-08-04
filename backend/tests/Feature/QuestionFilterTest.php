<?php

namespace Tests\Feature;

use App\Models\AnsweredQuestion;
use App\Models\Content;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class QuestionFilterTest extends TestCase
{
    use RefreshDatabase;

    private function makeQuestion(string $difficulty, ?Content $content = null): Question
    {
        $question = Question::factory()->create(['difficulty' => $difficulty]);

        if ($content) {
            $question->contents()->attach($content);
        }

        return $question;
    }

    /**
     * @return Collection<string, int>
     */
    private function difficultyCounts(TestResponse $response): Collection
    {
        return collect($response->json('data'))->pluck('difficulty')->countBy();
    }

    public function test_modo_progressao_n4_distribui_2_facil_1_medio_1_dificil(): void
    {
        Sanctum::actingAs(User::factory()->create());
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty);
            }
        }

        $response = $this->getJson('/api/questions?mode=progression&quantidade=4');

        $response->assertStatus(200);
        $this->assertSame(4, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['easy'] ?? 0);
        $this->assertSame(1, $counts['medium'] ?? 0);
        $this->assertSame(1, $counts['hard'] ?? 0);
    }

    public function test_modo_progressao_n5_distribui_2_facil_2_medio_1_dificil(): void
    {
        Sanctum::actingAs(User::factory()->create());
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty);
            }
        }

        $response = $this->getJson('/api/questions?mode=progression&quantidade=5');

        $response->assertStatus(200);
        $this->assertSame(5, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['easy'] ?? 0);
        $this->assertSame(2, $counts['medium'] ?? 0);
        $this->assertSame(1, $counts['hard'] ?? 0);
    }

    public function test_modo_progressao_sem_quantidade_e_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/questions?mode=progression')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['quantidade']);
    }

    public static function quantidadeInvalidaProvider(): array
    {
        return [
            'zero' => ['0'],
            'negativa' => ['-5'],
            'nao_numerica' => ['abc'],
        ];
    }

    #[DataProvider('quantidadeInvalidaProvider')]
    public function test_quantidade_invalida_e_rejeitada(string $quantidade): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/questions?mode=progression&quantidade={$quantidade}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['quantidade']);
    }

    public function test_topic_que_nao_pertence_ao_conteudo_informado_e_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $contentA = Content::factory()->create();
        $contentB = Content::factory()->create();
        $topicOfB = Topic::factory()->create(['content_id' => $contentB->id]);

        $this->getJson("/api/questions?content_id={$contentA->id}&topic_id={$topicOfB->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['topic_id']);
    }

    public function test_modo_normal_quantidade_alem_do_disponivel_retorna_so_as_existentes(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->makeQuestion('hard');
        $this->makeQuestion('hard');

        $response = $this->getJson('/api/questions?difficulty=hard&quantidade=5');

        $response->assertStatus(200);
        $this->assertSame(2, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['hard'] ?? 0);
        $this->assertSame(0, $counts['easy'] ?? 0);
    }

    public function test_filtro_por_conteudo_sem_resultados_retorna_lista_vazia(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $content = Content::factory()->create();
        $this->makeQuestion('easy');

        $this->getJson("/api/questions?content_id={$content->id}")
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_progressao_com_insuficiencia_nao_completa_a_diferenca(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->makeQuestion('easy');
        foreach (range(1, 3) as $i) {
            $this->makeQuestion('medium');
        }
        foreach (range(1, 2) as $i) {
            $this->makeQuestion('hard');
        }

        $response = $this->getJson('/api/questions?mode=progression&quantidade=4');

        $response->assertStatus(200);
        $this->assertSame(3, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(1, $counts['easy'] ?? 0);
        $this->assertSame(1, $counts['medium'] ?? 0);
        $this->assertSame(1, $counts['hard'] ?? 0);
    }

    public function test_filtro_sem_autenticacao_retorna_401(): void
    {
        $this->getJson('/api/questions')->assertStatus(401);
    }

    public function test_filtro_vazio_retorna_9_questoes_3_por_dificuldade(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $content = Content::factory()->create();
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty, $content);
            }
        }

        $response = $this->getJson('/api/questions')
            ->assertStatus(200)
            ->assertJsonCount(9, 'data');

        $counts = $this->difficultyCounts($response);
        $this->assertSame(3, $counts['easy'] ?? 0);
        $this->assertSame(3, $counts['medium'] ?? 0);
        $this->assertSame(3, $counts['hard'] ?? 0);
    }

    public function test_filtro_vazio_usa_conteudo_de_interesse(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $interest = Content::factory()->create();
        $other = Content::factory()->create();
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty, $interest);
                $this->makeQuestion($difficulty, $other);
            }
        }
        $user->interests()->sync([$interest->id]);

        $response = $this->getJson('/api/questions')
            ->assertStatus(200)
            ->assertJsonCount(9, 'data');

        foreach ($response->json('data') as $question) {
            $this->assertTrue(
                DB::table('question_content')
                    ->where('question_id', $question['id'])
                    ->where('content_id', $interest->id)
                    ->exists(),
                'Todas as questões deveriam pertencer ao conteúdo de interesse.'
            );
        }
    }

    public function test_filtro_vazio_sem_interesse_usa_conteudo_com_mais_acertos(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $contentA = Content::factory()->create();
        $contentB = Content::factory()->create();
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty, $contentA);
                $this->makeQuestion($difficulty, $contentB);
            }
        }

        foreach ($contentB->questions as $question) {
            AnsweredQuestion::factory()->create([
                'user_id' => $user->id,
                'question_id' => $question->id,
                'is_correct' => true,
                'answered_at' => Carbon::now(),
            ]);
        }

        $response = $this->getJson('/api/questions')
            ->assertStatus(200)
            ->assertJsonCount(9, 'data');

        foreach ($response->json('data') as $question) {
            $this->assertTrue(
                DB::table('question_content')
                    ->where('question_id', $question['id'])
                    ->where('content_id', $contentB->id)
                    ->exists(),
                'Sem interesses, todas as questões deveriam pertencer ao conteúdo com mais acertos.'
            );
        }
    }

    public function test_filtro_vazio_sem_interesse_e_sem_historico_usa_um_unico_conteudo(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $content = Content::factory()->create();
        $other = Content::factory()->create();
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty, $content);
                $this->makeQuestion($difficulty, $other);
            }
        }

        $response = $this->getJson('/api/questions')
            ->assertStatus(200)
            ->assertJsonCount(9, 'data');

        $contentIdsPerQuestion = collect($response->json('data'))
            ->map(fn ($q) => collect($q['contents'])->pluck('id')->sort()->values())
            ->unique()
            ->values();

        $this->assertSame(1, $contentIdsPerQuestion->count());
    }

    public function test_filtro_vazio_com_insuficiencia_nao_completa_a_diferenca(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $content = Content::factory()->create();
        $this->makeQuestion('easy', $content);
        $this->makeQuestion('easy', $content);
        $this->makeQuestion('medium', $content);

        $response = $this->getJson('/api/questions')
            ->assertStatus(200)
            ->assertJsonCount(3, 'data');

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['easy'] ?? 0);
        $this->assertSame(1, $counts['medium'] ?? 0);
        $this->assertSame(0, $counts['hard'] ?? 0);
    }

    public function test_filtro_por_multiplos_tipos_retorna_apenas_esses_tipos(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Question::factory()->create(['type' => 'multiple_choice', 'difficulty' => 'easy']);
        Question::factory()->trueFalse()->create(['difficulty' => 'easy']);
        Question::factory()->essay()->create(['difficulty' => 'easy']);

        $response = $this->getJson('/api/questions?types[]=multiple_choice&types[]=essay')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $types = collect($response->json('data'))->pluck('type')->sort()->values();
        $this->assertSame(['essay', 'multiple_choice'], $types->all());
    }
}
