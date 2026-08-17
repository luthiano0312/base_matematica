<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * RN20: checa autenticação no guard `admin` (tabela `admins`).
 * Ancilado em rotas sob `auth:admin` (que já bloqueia aluno/anônimo); mantido
 * como camada explícita de "role admin" para clareza das rotas marcadas com `admin`.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('admin')->check()) {
            return response()->json([
                'message' => 'Acesso restrito a administradores.',
            ], 403);
        }

        return $next($request);
    }
}
