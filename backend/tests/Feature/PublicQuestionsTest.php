<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\Question;
use App\Models\Topic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PublicQuestionsTest extends TestCase
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

    public function test_visitante_recebe_6_questoes_2_por_dificuldade(): void
    {
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty);
            }
        }

        $response = $this->getJson('/api/public/questions');

        $response->assertStatus(200);
        $this->assertSame(6, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['easy'] ?? 0);
        $this->assertSame(2, $counts['medium'] ?? 0);
        $this->assertSame(2, $counts['hard'] ?? 0);
    }

    public function test_fallback_por_insuficiencia_nao_completa_a_diferenca_entre_niveis(): void
    {
        foreach (range(1, 3) as $i) {
            $this->makeQuestion('easy');
        }
        $this->makeQuestion('medium');

        $response = $this->getJson('/api/public/questions');

        $response->assertStatus(200);
        $this->assertSame(3, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['easy'] ?? 0);
        $this->assertSame(1, $counts['medium'] ?? 0);
        $this->assertSame(0, $counts['hard'] ?? 0);
    }

    public function test_payload_nao_inclui_video_resolution_url(): void
    {
        Question::factory()->create([
            'difficulty' => 'easy',
            'video_resolution_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);
        Question::factory()->create([
            'difficulty' => 'easy',
            'video_resolution_url' => null,
        ]);
        foreach (['medium', 'hard'] as $difficulty) {
            foreach (range(1, 2) as $i) {
                $this->makeQuestion($difficulty);
            }
        }

        $response = $this->getJson('/api/public/questions');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertSame(6, count($data));

        foreach ($data as $question) {
            $this->assertArrayNotHasKey('video_resolution_url', $question);
        }
    }

    public function test_endpoint_nao_persiste_tentativas_do_visitante(): void
    {
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 2) as $i) {
                $this->makeQuestion($difficulty);
            }
        }

        $this->getJson('/api/public/questions')->assertStatus(200);

        $this->assertDatabaseCount('answered_questions', 0);
    }

    public function test_filtro_por_conteudo_retorna_2_por_dificuldade_dentro_do_conteudo(): void
    {
        $content = Content::factory()->create();
        $otherContent = Content::factory()->create();

        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 2) as $i) {
                $this->makeQuestion($difficulty, $content);
            }
        }
        $outside = $this->makeQuestion('easy', $otherContent);

        $response = $this->getJson("/api/public/questions?content_id={$content->id}");

        $response->assertStatus(200);
        $this->assertSame(6, count($response->json('data')));
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertFalse($ids->contains($outside->id));
    }

    public function test_filtro_por_tipo_retorna_apenas_questoes_do_tipo(): void
    {
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 2) as $i) {
                Question::factory()->trueFalse()->create(['difficulty' => $difficulty]);
            }
        }
        $essay = Question::factory()->essay()->create(['difficulty' => 'easy']);

        $response = $this->getJson('/api/public/questions?type=true_false');

        $response->assertStatus(200);
        $this->assertSame(6, count($response->json('data')));

        $types = collect($response->json('data'))->pluck('type')->unique();
        $this->assertSame(['true_false'], $types->all());
        $this->assertFalse(collect($response->json('data'))->pluck('id')->contains($essay->id));
    }

    public function test_filtro_por_multiplos_tipos_retorna_apenas_esses_tipos(): void
    {
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 2) as $i) {
                Question::factory()->trueFalse()->create(['difficulty' => $difficulty]);
            }
        }
        $essay = Question::factory()->essay()->create(['difficulty' => 'easy']);

        $response = $this->getJson('/api/public/questions?types[]=multiple_choice&types[]=essay');

        $response->assertStatus(200);
        $this->assertSame(1, count($response->json('data')));

        $types = collect($response->json('data'))->pluck('type')->unique();
        $this->assertSame(['essay'], $types->all());
        $this->assertTrue(collect($response->json('data'))->pluck('id')->contains($essay->id));
    }

    public function test_filtro_por_topic_retorna_apenas_questoes_do_topic(): void
    {
        $content = Content::factory()->create();
        $topic = Topic::factory()->create(['content_id' => $content->id]);

        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 2) as $i) {
                $question = $this->makeQuestion($difficulty, $content);
                $question->topics()->attach($topic);
            }
        }
        $outside = $this->makeQuestion('easy', $content);

        $response = $this->getJson("/api/public/questions?topic_id={$topic->id}");

        $response->assertStatus(200);
        $this->assertSame(6, count($response->json('data')));
        $this->assertFalse(collect($response->json('data'))->pluck('id')->contains($outside->id));
    }

    public function test_campos_dificuldade_e_quantidade_sao_ignorados_no_filtro_publico(): void
    {
        foreach (['easy', 'medium', 'hard'] as $difficulty) {
            foreach (range(1, 3) as $i) {
                $this->makeQuestion($difficulty);
            }
        }

        $response = $this->getJson('/api/public/questions?difficulty=hard&quantidade=1');

        $response->assertStatus(200);
        $this->assertSame(6, count($response->json('data')));

        $counts = $this->difficultyCounts($response);
        $this->assertSame(2, $counts['easy'] ?? 0);
        $this->assertSame(2, $counts['medium'] ?? 0);
        $this->assertSame(2, $counts['hard'] ?? 0);
    }

    public function test_topic_que_nao_pertence_ao_conteudo_informado_e_rejeitado(): void
    {
        $contentA = Content::factory()->create();
        $contentB = Content::factory()->create();
        $topicOfB = Topic::factory()->create(['content_id' => $contentB->id]);

        $this->getJson("/api/public/questions?content_id={$contentA->id}&topic_id={$topicOfB->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['topic_id']);
    }

    public function test_sem_questoes_retorna_lista_vazia(): void
    {
        $this->getJson('/api/public/questions')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }
}
