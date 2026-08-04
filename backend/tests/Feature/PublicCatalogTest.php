<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\Topic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_conteudos_publicamente(): void
    {
        $contents = Content::factory()->count(3)->create();

        $response = $this->getJson('/api/contents')
            ->assertStatus(200)
            ->assertJsonCount(3);

        $ids = collect($response->json())->pluck('id')->sort()->values();
        $this->assertSame($contents->pluck('id')->sort()->values()->all(), $ids->all());
    }

    public function test_lista_topicos_publicamente_filtrados_por_conteudo(): void
    {
        $contentA = Content::factory()->create();
        $contentB = Content::factory()->create();
        $topicA = Topic::factory()->create(['content_id' => $contentA->id]);
        Topic::factory()->create(['content_id' => $contentB->id]);

        $response = $this->getJson("/api/topics?content_id={$contentA->id}")
            ->assertStatus(200)
            ->assertJsonCount(1);

        $this->assertSame($topicA->id, $response->json('0.id'));
        $this->assertSame($contentA->id, $response->json('0.content_id'));
    }

    public function test_lista_topicos_sem_filtro_retorna_todos(): void
    {
        $contents = Content::factory()->count(2)->create();
        $topics = $contents->flatMap(fn ($c) => Topic::factory()->count(2)->create(['content_id' => $c->id]));

        $response = $this->getJson('/api/topics')
            ->assertStatus(200)
            ->assertJsonCount($topics->count());
    }
}
