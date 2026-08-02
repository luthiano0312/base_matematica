<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    /**
     * POST /api/password/email
     * Solicita um link de redefinição de senha para o e-mail informado.
     */
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Muitas solicitações. Tente novamente em instantes.',
            ], 429);
        }

        // Resposta genérica também para e-mail inexistente (evita enumeração de contas).
        return response()->json([
            'message' => 'Se o e-mail informado existir, você receberá um link de redefinição.',
        ]);
    }

    /**
     * POST /api/password/reset
     * Define uma nova senha usando o token recebido por e-mail.
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => $password])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => [$this->messageFor($status)],
            ]);
        }

        return response()->json([
            'message' => 'Senha redefinida com sucesso.',
        ]);
    }

    protected function messageFor(string $status): string
    {
        return match ($status) {
            Password::INVALID_USER => 'E-mail não encontrado.',
            default => 'Token de redefinição inválido ou expirado.',
        };
    }
}
