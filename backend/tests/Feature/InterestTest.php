<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InterestTest extends TestCase
{
    use RefreshDatabase;

    public function test_onboarding_com_corpo_vazio_e_aceito_sem_registros(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/onboarding/interests', [])
            ->assertStatus(200);

        $this->assertDatabaseCount('user_interests', 0);
    }

    public function test_onboarding_com_multiplos_contents_salva_todos_sem_limite(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $contents = Content::factory()->count(4)->create();

        $this->postJson('/api/onboarding/interests', [
            'content_ids' => $contents->pluck('id')->all(),
        ])->assertStatus(200);

        $this->assertDatabaseCount('user_interests', 4);

        foreach ($contents as $content) {
            $this->assertDatabaseHas('user_interests', [
                'user_id' => $user->id,
                'content_id' => $content->id,
            ]);
        }
    }

    public function test_put_substitui_completamente_a_lista_anterior(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $initial = Content::factory()->count(2)->create();
        $replacement = Content::factory()->count(1)->create();

        $user->interests()->sync($initial->pluck('id'));

        $this->putJson('/api/me/interests', [
            'content_ids' => $replacement->pluck('id')->all(),
        ])->assertStatus(200);

        $this->assertDatabaseCount('user_interests', 1);
        $this->assertDatabaseHas('user_interests', [
            'user_id' => $user->id,
            'content_id' => $replacement->first()->id,
        ]);
    }

    public function test_put_com_lista_vazia_remove_todos_os_interesses(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $contents = Content::factory()->count(2)->create();
        $user->interests()->sync($contents->pluck('id'));

        $this->putJson('/api/me/interests', ['content_ids' => []])
            ->assertStatus(200);

        $this->assertDatabaseCount('user_interests', 0);
    }

    public function test_get_retorna_conteudos_marcados(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $contents = Content::factory()->count(2)->create();
        $user->interests()->sync($contents->pluck('id'));

        $response = $this->getJson('/api/me/interests')
            ->assertStatus(200)
            ->assertJsonCount(2);

        $ids = collect($response->json())->pluck('id')->all();
        $this->assertSame($contents->pluck('id')->sort()->values()->all(), collect($ids)->sort()->values()->all());
    }

    public function test_get_sem_interesses_retorna_lista_vazia(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/me/interests')
            ->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_content_id_duplicado_na_mesma_requisicao_e_deduplicado(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $contents = Content::factory()->count(2)->create();
        [$first, $second] = $contents->pluck('id')->all();

        $this->postJson('/api/onboarding/interests', [
            'content_ids' => [$first, $second, $first],
        ])->assertStatus(200);

        $this->assertDatabaseCount('user_interests', 2);
        $this->assertDatabaseHas('user_interests', [
            'user_id' => $user->id,
            'content_id' => $first,
        ]);
        $this->assertDatabaseHas('user_interests', [
            'user_id' => $user->id,
            'content_id' => $second,
        ]);
    }

    public function test_sem_autenticacao_retorna_401(): void
    {
        $this->postJson('/api/onboarding/interests', [])->assertStatus(401);
        $this->getJson('/api/me/interests')->assertStatus(401);
        $this->putJson('/api/me/interests', [])->assertStatus(401);
    }

    public function test_content_id_inexistente_e_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/onboarding/interests', [
            'content_ids' => [999999],
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['content_ids.0']);
    }
}
