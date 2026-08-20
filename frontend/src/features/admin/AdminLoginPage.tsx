import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import logoLight from '@/assets/logos/logo_light.svg';
import { Button } from '@/shared/components/Button/Button';
import { TextField } from '@/shared/components/TextField/TextField';
import { PasswordInput } from '@/shared/components/PasswordInput/PasswordInput';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { EMAIL_RE } from '@/shared/utils/validators';
import { useAdminAuth } from '@/app/AdminAuthContext';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import './AdminLoginPage.css';

type CampoNome = 'email' | 'senha';
type Erros = Partial<Record<CampoNome, string>>;

/**
 * RN20 — login do produtor de conteúdo (guard `admin`), separado do login
 * do aluno. Sem cadastro nem recuperação de senha nesta fase.
 */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [tocados, setTocados] = useState<Set<CampoNome>>(new Set());
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const validarCampo = (campo: CampoNome, valor: string): string | undefined => {
    if (!valor.trim()) return 'Este campo é obrigatório.';
    if (campo === 'email' && !EMAIL_RE.test(valor)) return 'Informe um e-mail válido.';
    return undefined;
  };

  const validarNoBlur = (campo: CampoNome, valor: string) => {
    setTocados((prev) => new Set(prev).add(campo));
    setErros((prev) => ({ ...prev, [campo]: validarCampo(campo, valor) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(null);

    const proximosErros: Erros = {
      email: validarCampo('email', email),
      senha: validarCampo('senha', senha),
    };
    setErros(proximosErros);
    setTocados(new Set(['email', 'senha']));

    if (proximosErros.email || proximosErros.senha) return;

    setEnviando(true);
    try {
      await login({ email, password: senha });
      navigate('/admin/visao-geral');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setErroGeral('E-mail ou senha incorretos.');
      } else {
        setErroGeral(MENSAGEM_ERRO_GENERICA);
      }
    } finally {
      setEnviando(false);
    }
  };

  const erroEmail = tocados.has('email') ? erros.email : undefined;
  const erroSenha = tocados.has('senha') ? erros.senha : undefined;

  return (
    <div className="admin-login-page">
      <div className="admin-login-topbar">
        <Link to="/" className="admin-login-back" aria-label="Voltar para a Home">
          <ArrowLeft size={20} /> voltar
        </Link>
      </div>

      <Link to="/" className="admin-login-logo-link" aria-label="Ir para a Home">
        <img src={logoLight} alt="Base Matemática" className="admin-login-logo" />
      </Link>

      <main className="admin-login-main">
        <div className="admin-login-card">
          {erroGeral && <ErrorBanner message={erroGeral} />}

          <header className="admin-login-header">
            <h1 className="admin-login-title">Painel administrativo</h1>
            <p className="admin-login-subtitle">acesso restrito a produtores de conteúdo.</p>
          </header>

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-login-fields">
              <TextField
                id="admin-email"
                name="email"
                type="email"
                label="E-mail"
                placeholder="voce@basematematica.com.br"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validarNoBlur('email', email)}
                error={erroEmail}
              />

              <PasswordInput
                id="admin-senha"
                name="senha"
                label="Senha"
                placeholder="Sua senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onBlur={() => validarNoBlur('senha', senha)}
                error={erroSenha}
              />
            </div>

            <Button type="submit" block disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar no painel'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
