<?php

/**
 * SMOKE DESCARTÁVEL — valida o endpoint público de detalhe
 * (GET /api/study-materials/{id}) e o index público. Apagar após uso.
 */

require __DIR__ . '/vendor/autoload.php';

use App\Models\Admin;
use App\Models\Content;
use App\Models\StudyMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

function falhou(string $msg): never
{
    fwrite(STDERR, "FALHOU: $msg\n");
    exit(1);
}

function chama($kernel, string $metodo, string $uri, array $payload = []): array
{
    $request = Request::create($uri, $metodo, $payload);
    $request->headers->set('Accept', 'application/json');
    $response = $kernel->handle($request);

    return [$response->getStatusCode(), $response->getContent()];
}

// Remove sobras de execuções anteriores que falharam antes da limpeza.
StudyMaterial::where('title', 'SMOKE detalhe')->delete();

// Cria um material de teste (escrita continua sob guard admin).
Auth::guard('admin')->setUser(Admin::first());
[$code, $body] = chama($kernel, 'POST', '/api/admin/study-materials', [
    'title' => 'SMOKE detalhe',
    'content' => '<p>Texto do artigo</p>',
    'content_id' => Content::firstOrFail()->id,
]);
$code === 201 || falhou("criação falhou ($code): $body");
$id = json_decode($body, true)['data']['id'];
echo "[ok] material criado (id $id)\n";

// Index público segue OK.
[$code] = chama($kernel, 'GET', '/api/study-materials');
$code === 200 || falhou("index público deveria ser 200, veio $code");
echo "[ok] index público 200\n";

// Detalhe público com campos esperados.
[$code, $body] = chama($kernel, 'GET', "/api/study-materials/$id");
$code === 200 || falhou("detalhe público deveria ser 200, veio $code: $body");
$data = json_decode($body, true)['data'];
isset($data['title'], $data['content'], $data['content_plain'])
    || falhou('campos ausentes no detalhe público');
$data['title'] === 'SMOKE detalhe' || falhou('título inesperado');
echo "[ok] detalhe público 200 com title/content/content_plain\n";

// Inexistente e não numérico → 404.
[$code] = chama($kernel, 'GET', '/api/study-materials/999999');
$code === 404 || falhou("id inexistente deveria dar 404, veio $code");
[$code] = chama($kernel, 'GET', '/api/study-materials/abc');
$code === 404 || falhou("id não numérico deveria dar 404, veio $code");
echo "[ok] 404 para id inexistente e não numérico\n";

// Limpeza (por título: id pode divergir se o script já rodou antes).
StudyMaterial::where('title', 'SMOKE detalhe')->delete();
StudyMaterial::count() === 0 || falhou('limpeza incompleta');
echo "[ok] limpeza concluída\n";
echo "\nTODOS OS CHECKS PASSARAM\n";
