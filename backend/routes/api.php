<?php

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
use App\Http\Controllers\Api\TopicController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [PasswordController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordController::class, 'reset']);
Route::get('/public/questions', [PublicQuestionController::class, 'index']);
Route::get('/contents', [CatalogController::class, 'contents']);
Route::get('/topics', [CatalogController::class, 'topics']);

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

    Route::middleware('admin')->group(function () {
        Route::apiResource('admin/questions', QuestionController::class);
        Route::apiResource('admin/contents', ContentController::class);
        Route::apiResource('admin/topics', TopicController::class);
    });
});
