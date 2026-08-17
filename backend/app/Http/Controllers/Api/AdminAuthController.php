<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\AdminResource;
use App\Models\Admin;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Auth de admin (RN20): guard `admin` dedicado, tabela `admins`.
 */
class AdminAuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $admin = Admin::where('email', $request->validated('email'))->first();

        if (! $admin || ! Hash::check($request->validated('password'), $admin->password)) {
            throw new AuthenticationException('Credenciais inválidas.');
        }

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'admin' => new AdminResource($admin),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user('admin')?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'admin' => new AdminResource($request->user('admin')),
        ]);
    }
}
