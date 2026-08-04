import axios from 'axios';
import type { AxiosError } from 'axios';

const TOKEN_KEY = 'bm_token';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Token inválido/expirado: limpa a sessão local (a página decide para onde ir).
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const MENSAGEM_ERRO_GENERICA = 'Algo deu errado. Tente novamente em alguns instantes.';

/**
 * Extrai uma mensagem amigável de um erro de API.
 * - 422: primeiro erro de validação (ex.: "Este e-mail já está cadastrado.")
 * - demais: `message` do payload quando presente
 * - rede/servidor: mensagem genérica
 */
export function getErrorMessage(error: unknown, fallback = MENSAGEM_ERRO_GENERICA): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (error.response?.status === 422 && data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return first;
    }

    if (typeof data?.message === 'string' && data.message.trim() !== '') {
      return data.message;
    }
  }

  return fallback;
}
