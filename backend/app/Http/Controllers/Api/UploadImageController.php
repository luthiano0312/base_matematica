<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadImageRequest;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;

/**
 * RN18/RN23 — upload de imagem intermediado pelo backend para o Supabase Storage.
 * Implementação completa na etapa 2 (SupabaseStorageService).
 */
class UploadImageController extends Controller
{
    public function __construct(private readonly SupabaseStorageService $storage)
    {
    }

    public function __invoke(UploadImageRequest $request): JsonResponse
    {
        try {
            $url = $this->storage->upload($request->file('file'));
        } catch (\RuntimeException $e) {
            // Config ausente ou Supabase indisponível: 502 com mensagem amigável
            // para o produtor de conteúdo (feedback visível exigido pelo plano).
            report($e);

            return response()->json([
                'message' => 'Não foi possível enviar a imagem. Verifique a conexão e tente novamente.',
            ], 502);
        }

        return response()->json(['url' => $url]);
    }
}
