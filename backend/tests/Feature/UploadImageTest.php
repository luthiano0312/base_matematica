<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadImageTest extends TestCase
{
    use RefreshDatabase;

    /**
     * PNG 1x1 válido em bytes — o ambiente de teste pode não ter a extensão
     * GD, então não usamos UploadedFile::fake()->image().
     */
    private function fakePng(string $name = 'figura.png', int $kilobytes = 1): UploadedFile
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        );

        if ($kilobytes > 1) {
            // Bytes extras após o IEND não invalidam o header para getimagesize().
            $png = str_pad($png, $kilobytes * 1024, ' ');
        }

        return UploadedFile::fake()->createWithContent($name, $png);
    }

    private function admin(): void
    {
        Sanctum::actingAs(Admin::factory()->create(), ['*'], 'admin');
    }

    public function test_sem_token_recebe_401(): void
    {
        $this->postJson('/api/admin/upload-image')
            ->assertStatus(401);
    }

    public function test_token_de_aluno_e_rejeitado(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/admin/upload-image')
            ->assertStatus(401);
    }

    public function test_arquivo_nao_imagem_recebe_422(): void
    {
        $this->admin();

        $this->post('/api/admin/upload-image', [
            'file' => UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf'),
        ])->assertStatus(422)->assertJsonValidationErrors(['file']);
    }

    public function test_arquivo_maior_que_5mb_recebe_422(): void
    {
        $this->admin();

        $this->post('/api/admin/upload-image', [
            'file' => $this->fakePng('foto.png', 6000),
        ])->assertStatus(422)->assertJsonValidationErrors(['file']);
    }

    public function test_upload_valido_retorna_url_publica(): void
    {
        $this->admin();
        config([
            'services.supabase.url' => 'https://fake.supabase.co',
            'services.supabase.service_role_key' => 'service-role-key',
            'services.supabase.bucket' => 'question-images',
        ]);

        Http::fake(['fake.supabase.co/storage/v1/*' => Http::response([], 200)]);

        $response = $this->post('/api/admin/upload-image', [
            'file' => $this->fakePng(),
        ])->assertStatus(200);

        $url = $response->json('url');
        $this->assertStringContainsString(
            'https://fake.supabase.co/storage/v1/object/public/question-images/questions/',
            $url
        );
        $this->assertStringEndsWith('.png', $url);

        // RN23: requisição ao Storage autenticada com a service role key.
        Http::assertSent(function ($request) {
            return str_starts_with($request->url(), 'https://fake.supabase.co/storage/v1/object/')
                && $request->hasHeader('Authorization', 'Bearer service-role-key');
        });
    }

    public function test_supabase_indisponivel_retorna_502_amigavel(): void
    {
        $this->admin();
        config([
            'services.supabase.url' => 'https://fake.supabase.co',
            'services.supabase.service_role_key' => 'service-role-key',
            'services.supabase.bucket' => 'question-images',
        ]);

        Http::fake(['fake.supabase.co/storage/v1/*' => Http::response(['error' => 'bucket not found'], 404)]);

        $this->post('/api/admin/upload-image', [
            'file' => $this->fakePng(),
        ])
            ->assertStatus(502)
            ->assertJsonStructure(['message']);
    }

    public function test_supabase_nao_configurado_retorna_502(): void
    {
        $this->admin();
        config([
            'services.supabase.url' => null,
            'services.supabase.service_role_key' => null,
        ]);

        $this->post('/api/admin/upload-image', [
            'file' => $this->fakePng(),
        ])
            ->assertStatus(502)
            ->assertJsonStructure(['message']);
    }
}
