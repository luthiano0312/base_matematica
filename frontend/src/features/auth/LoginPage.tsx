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
import { useAuth } from '@/app/AuthContext';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import './LoginPage.css';

type CampoNome = 'email' | 'senha';
type Erros = Partial<Record<CampoNome, string>>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const marcarTocado = (campo: CampoNome) => {
    setTocados((prev) => new Set(prev).add(campo));
  };

  const validarNoBlur = (campo: CampoNome, valor: string) => {
    marcarTocado(campo);
    const msg = validarCampo(campo, valor);
    setErros((prev) => ({ ...prev, [campo]: msg }));
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
      navigate('/dashboard');
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
    <div className="login-page">
      <div className="login-topbar">
        <Link to="/" className="login-back" aria-label="Voltar para a Home">
          <ArrowLeft size={20} /> voltar
        </Link>
      </div>

      <Link to="/" className="login-logo-link" aria-label="Ir para a Home">
        <img src={logoLight} alt="Base Matemática" className="login-logo" />
      </Link>

      <main className="login-main">
        <div className="login-card">
          {erroGeral && <ErrorBanner message={erroGeral} />}

          <header className="login-header">
            <h1 className="login-title">Bem-vindo de volta!</h1>
            <p className="login-subtitle">entre com sua conta para continuar sua jornada.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-form-forgot">
              <TextField
                id="email"
                name="email"
                type="email"
                label="E-mail"
                placeholder="nome@exemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validarNoBlur('email', email)}
                error={erroEmail}
              />

              <PasswordInput
                id="senha"
                name="senha"
                label="Senha"
                placeholder="Sua senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onBlur={() => validarNoBlur('senha', senha)}
                error={erroSenha}
              />

              <Link to="/esqueci-senha" className="login-forgot">
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" block disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="login-signup-link">
            Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
