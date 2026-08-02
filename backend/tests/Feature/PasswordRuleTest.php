<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordRuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_senha_valida_aceita_registro(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Aluno Teste',
            'email' => 'aluno@example.com',
            'password' => 'Senha1234',
            'password_confirmation' => 'Senha1234',
        ])->assertStatus(201);

        $this->assertDatabaseHas('users', ['email' => 'aluno@example.com']);
    }

    public function test_senha_sem_numero_e_rejeitada(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Aluno Teste',
            'email' => 'aluno@example.com',
            'password' => 'SemNumero',
            'password_confirmation' => 'SemNumero',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_senha_sem_maiuscula_e_rejeitada(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Aluno Teste',
            'email' => 'aluno@example.com',
            'password' => 'semmaiuscula1',
            'password_confirmation' => 'semmaiuscula1',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_senha_com_menos_de_8_caracteres_e_rejeitada(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Aluno Teste',
            'email' => 'aluno@example.com',
            'password' => 'Se1',
            'password_confirmation' => 'Se1',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
