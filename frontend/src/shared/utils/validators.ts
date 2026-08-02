export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SENHA_MIN_LEN = 8;

export type RequisitosSenha = {
  temMinimo: boolean;
  temNumero: boolean;
  temMaiuscula: boolean;
};

export function verificarRequisitosSenha(senha: string): RequisitosSenha {
  return {
    temMinimo: senha.length >= SENHA_MIN_LEN,
    temNumero: /\d/.test(senha),
    temMaiuscula: /[A-Z]/.test(senha),
  };
}
