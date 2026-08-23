<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminOverviewController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InterestController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\PublicQuestionController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuestionFilterController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\StudyMaterialController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\UploadImageController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [PasswordController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordController::class, 'reset']);
Route::get('/public/questions', [PublicQuestionController::class, 'index']);
Route::get('/contents', [CatalogController::class, 'contents']);
Route::get('/topics', [CatalogController::class, 'topics']);
// Materiais de estudo — leitura pública (RN01/RF02); escrita só no painel.
Route::get('/study-materials', [StudyMaterialController::class, 'index']);
// Detalhe público do material (mesmo método show exposto ao admin via
// apiResource — o resource não carrega dado sensível). whereNumber evita
// que id não numérico chegue ao Postgres como comparação inválida.
Route::get('/study-materials/{study_material}', [StudyMaterialController::class, 'show'])
    ->whereNumber('study_material');

// RN20 — auth de admin separada (guard `admin`, tabela `admins`).
Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/me/dashboard', [DashboardController::class, 'index']);
    Route::get('/me/interests', [InterestController::class, 'index']);
    Route::put('/me/interests', [InterestController::class, 'update']);
    Route::get('/me/recommended-questions', [RecommendationController::class, 'index']);
    Route::post('/onboarding/interests', [InterestController::class, 'onboarding']);
    Route::get('/questions', [QuestionFilterController::class, 'index']);
    Route::post('/questions/{question}/answers', [AnswerController::class, 'store']);
});

// RN20 — painel admin: guard `admin` (token bearer Sanctum via tabela `admins`).
Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);

    // RN23 — upload intermediado pelo backend.
    Route::post('/upload-image', [UploadImageController::class, '__invoke']);

    // Verificação síncrona de dependências antes do modal de exclusão
    // (Spec_Modal_Confirmacao_Exclusao#3 — Regras de bloqueio por entidade).
    Route::get('/contents/{content}/can-delete', [ContentController::class, 'canDelete']);
    Route::get('/topics/{topic}/can-delete', [TopicController::class, 'canDelete']);
    Route::get('/questions/{question}/can-delete', [QuestionController::class, 'canDelete']);

    // Visão Geral do painel (Spec_Admin_Visao_Geral).
    Route::get('/overview', [AdminOverviewController::class, 'index']);

    Route::apiResource('questions', QuestionController::class);
    Route::apiResource('contents', ContentController::class);
    Route::apiResource('topics', TopicController::class);
    // Delete direto, sem can-delete: nenhuma FK aponta para study_materials.
    Route::apiResource('study-materials', StudyMaterialController::class)->except(['create', 'edit']);
});
