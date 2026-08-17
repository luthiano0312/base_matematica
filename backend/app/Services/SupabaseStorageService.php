<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

/**
 * RN23 — Upload sempre mediado pelo backend; service role key nunca exposta.
 * Endpoint REST de Storage do Supabase: POST /storage/v1/object/{bucket}/{path}.
 * URL pública: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}.
 */
class SupabaseStorageService
{
    private string $url;
    private string $key;
    private string $bucket;

    public function __construct()
    {
        $this->url = rtrim(config('services.supabase.url'), '/');
        $this->key = (string) config('services.supabase.service_role_key');
        $this->bucket = (string) config('services.supabase.bucket');
    }

    public function upload(UploadedFile $file): string
    {
        if ($this->url === '' || $this->key === '') {
            throw new \RuntimeException('Supabase Storage não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
        }

        $ext = $file->guessExtension() ?? $file->getClientOriginalExtension() ?? 'bin';
        $path = 'questions/'.\Illuminate\Support\Str::uuid()->toString().'.'.$ext;

        $response = Http::withToken($this->key)
            ->withHeaders(['x-upsert' => 'false'])
            ->attach('file', $file->get(), $file->getClientOriginalName())
            ->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

        if (! $response->successful()) {
            throw new \RuntimeException('Falha no upload para o Supabase Storage: '.$response->body());
        }

        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
    }
}
