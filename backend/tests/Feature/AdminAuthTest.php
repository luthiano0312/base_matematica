<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_retorna_token_e_dados_do_admin(): void
    {
        $admin = Admin::factory()->create(['password' => 'SenhaForte123']);

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'SenhaForte123',
        ])->assertStatus(200);

        $token = $response->json('token');
        $this->assertNotEmpty($token);
        $response->assertJsonPath('admin.id', $admin->id)
            ->assertJsonPath('admin.email', $admin->email)
            ->assertJsonMissing(['password']);

        // Token emitido para Admin autentica no guard `admin`.
        $this->withToken($token)
            ->getJson('/api/admin/me')
            ->assertStatus(200)
            ->assertJsonPath('admin.id', $admin->id);
    }

    public function test_login_com_senha_errada_recebe_401(): void
    {
        $admin = Admin::factory()->create();

        $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'senha-errada',
        ])->assertStatus(401);
    }

    public function test_login_com_email_inexistente_recebe_401(): void
    {
        $this->postJson('/api/admin/login', [
            'email' => 'ninguem@example.com',
            'password' => 'qualquer',
        ])->assertStatus(401);
    }

    public function test_login_sem_campos_recebe_422(): void
    {
        $this->postJson('/api/admin/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_logout_revoga_o_token_atual(): void
    {
        $admin = Admin::factory()->create(['password' => 'SenhaForte123']);

        $plainTextToken = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'SenhaForte123',
        ])->json('token');

        $this->withToken($plainTextToken)
            ->postJson('/api/admin/logout')
            ->assertStatus(200);

        // O guard é cacheado entre requisições no mesmo teste, então validamos
        // a revogação pelo banco (formato do plain text token: "{id}|{secret}").
        $tokenId = (int) explode('|', $plainTextToken, 2)[0];
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    public function test_me_sem_token_recebe_401(): void
    {
        $this->getJson('/api/admin/me')->assertStatus(401);
    }
}
