<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Content;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminContentTopicTest extends TestCase
{
    use RefreshDatabase;

    /**
     * RN20 — rotas do painel autenticadas pelo guard `admin` (tabela `admins`).
     */
    private function admin(): Admin
    {
        $admin = Admin::factory()->create();
        Sanctum::actingAs($admin, ['*'], 'admin');

        return $admin;
    }

    public function test_sem_autenticacao_recebe_401(): void
    {
        $this->getJson('/api/admin/contents')->assertStatus(401);
    }

    public function test_token_de_aluno_e_rejeitado_no_guard_admin(): void
    {
        // O guard `admin` valida o provider: token emitido para User não autentica.
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/contents')->assertStatus(401);
        $this->postJson('/api/admin/contents', ['name' => 'Frações'])->assertStatus(401);
        $this->postJson('/api/admin/topics', ['name' => 'Soma', 'content_id' => 1])->assertStatus(401);
    }

    public function test_admin_pode_criar_e_listar_content(): void
    {
        $this->admin();

        $this->postJson('/api/admin/contents', ['name' => 'Frações'])
            ->assertStatus(201)
            ->assertJson(['name' => 'Frações']);

        $this->getJson('/api/admin/contents')
            ->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Frações');
    }

    public function test_admin_pode_atualizar_content(): void
    {
        $this->admin();
        $content = Content::factory()->create();

        $this->putJson("/api/admin/contents/{$content->id}", ['name' => 'Porcentagem'])
            ->assertStatus(200)
            ->assertJson(['id' => $content->id, 'name' => 'Porcentagem']);

        $this->assertDatabaseHas('contents', ['id' => $content->id, 'name' => 'Porcentagem']);
    }

    public function test_admin_pode_deletar_content(): void
    {
        $this->admin();
        $content = Content::factory()->create();

        $this->deleteJson("/api/admin/contents/{$content->id}")->assertStatus(204);

        $this->assertDatabaseMissing('contents', ['id' => $content->id]);
    }

    public function test_content_name_obrigatorio(): void
    {
        $this->admin();

        $this->postJson('/api/admin/contents', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_admin_pode_criar_topic(): void
    {
        $this->admin();
        $content = Content::factory()->create();

        $this->postJson('/api/admin/topics', ['name' => 'Soma de frações', 'content_id' => $content->id])
            ->assertStatus(201)
            ->assertJson(['name' => 'Soma de frações', 'content_id' => $content->id]);

        $this->assertDatabaseHas('topics', ['name' => 'Soma de frações', 'content_id' => $content->id]);
    }

    public function test_admin_pode_atualizar_e_deletar_topic(): void
    {
        $this->admin();
        $topic = Topic::factory()->create();

        $this->putJson("/api/admin/topics/{$topic->id}", [
            'name' => 'Subtração',
            'content_id' => $topic->content_id,
        ])
            ->assertStatus(200)
            ->assertJson(['id' => $topic->id, 'name' => 'Subtração']);

        $this->deleteJson("/api/admin/topics/{$topic->id}")->assertStatus(204);

        $this->assertDatabaseMissing('topics', ['id' => $topic->id]);
    }

    public function test_topic_content_id_obrigatorio(): void
    {
        $this->admin();

        $this->postJson('/api/admin/topics', ['name' => 'Sem conteúdo'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['content_id']);
    }

    public function test_admin_pode_listar_topics(): void
    {
        $this->admin();
        Topic::factory()->count(2)->create();

        $this->getJson('/api/admin/topics')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }
}
