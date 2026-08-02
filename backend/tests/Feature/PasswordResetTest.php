<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function resetPayload(User $user, string $token, string $password = 'NovaSenha123'): array
    {
        return [
            'token' => $token,
            'email' => $user->email,
            'password' => $password,
            'password_confirmation' => $password,
        ];
    }

    public function test_solicitacao_gera_token_e_envia_email_de_reset(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'aluno@example.com']);

        $this->postJson('/api/password/email', ['email' => 'aluno@example.com'])
            ->assertStatus(200);

        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'aluno@example.com']);
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_email_inexistente_retorna_mensagem_generica_sem_envio(): void
    {
        Notification::fake();

        $this->postJson('/api/password/email', ['email' => 'nao-existe@example.com'])
            ->assertStatus(200);

        $this->assertDatabaseCount('password_reset_tokens', 0);
        Notification::assertNothingSent();
    }

    public function test_email_invalido_e_rejeitado(): void
    {
        $this->postJson('/api/password/email', ['email' => 'nao-e-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_reset_senha_com_token_valido(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token))
            ->assertStatus(200)
            ->assertJson(['message' => 'Senha redefinida com sucesso.']);

        $this->assertTrue(Hash::check('NovaSenha123', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_reset_senha_com_token_invalido_retorna_erro(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/password/reset', $this->resetPayload($user, 'token-invalido'))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    public function test_token_e_de_uso_unico(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token))
            ->assertStatus(200);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    public function test_token_expirado_apos_1_hora_e_rejeitado(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->update(['created_at' => now()->subMinutes(61)]);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['token']);

        $this->assertFalse(Hash::check('NovaSenha123', $user->fresh()->password));
    }

    public function test_reset_valida_rnf08(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token, 'fraca'))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token, 'semnumero'))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->postJson('/api/password/reset', $this->resetPayload($user, $token, 'semnumeromaiuscula'))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_email_obrigatorio_no_reset(): void
    {
        $this->postJson('/api/password/reset', [
            'token' => 'token',
            'password' => 'NovaSenha123',
            'password_confirmation' => 'NovaSenha123',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
