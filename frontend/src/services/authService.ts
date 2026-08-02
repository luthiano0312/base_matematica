import { http, setAuthToken } from './http';
import type { User } from './types';

type AuthResponse = {
  user: User;
  token: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export function register(data: RegisterData) {
  return http.post<AuthResponse>('/register', data).then((res) => {
    setAuthToken(res.data.token);
    return res.data;
  });
}

export function login(data: { email: string; password: string }) {
  return http.post<AuthResponse>('/login', data).then((res) => {
    setAuthToken(res.data.token);
    return res.data;
  });
}

export function logout() {
  return http.post('/logout').finally(() => setAuthToken(null));
}

export function getMe() {
  return http.get<{ user: User }>('/me').then((res) => res.data.user);
}

export function sendPasswordResetLink(data: { email: string }) {
  return http.post('/password/email', data).then((res) => res.data);
}

export function resetPassword(data: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return http.post('/password/reset', data).then((res) => res.data);
}
