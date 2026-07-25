import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logoLight from '../assets/logos/logo_light.svg';
import './LoginPage.css';

type CampoNome = 'email' | 'senha';
type Erros = Partial<Record<CampoNome, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [tocados, setTocados] = useState<Set<CampoNome>>(new Set());

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

  // Frontend-only: em sucesso, segue o fluxo Login → Dashboard (Fluxo_de_Navegacao).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const proximosErros: Erros = {
      email: validarCampo('email', email),
      senha: validarCampo('senha', senha),
    };
    setErros(proximosErros);
    setTocados(new Set(['email', 'senha']));

    if (proximosErros.email || proximosErros.senha) return;
    navigate('/dashboard');
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
          <header className="login-header">
            <h1 className="login-title">Bem-vindo de volta!</h1>
            <p className="login-subtitle">entre com sua conta para continuar sua jornada.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-form-forgot">
              <div className="form-group">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${erroEmail ? 'error' : ''}`}
                  placeholder="nome@examplo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validarNoBlur('email', email)}
                  aria-invalid={!!erroEmail}
                  aria-describedby={erroEmail ? 'email-erro' : undefined}
                />
                {erroEmail && (
                  <span id="email-erro" className="form-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    {erroEmail}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="senha" className="form-label">Senha</label>
                <div className="input-wrapper">
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    className={`form-input form-input-with-action ${erroSenha ? 'error' : ''}`}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onBlur={() => validarNoBlur('senha', senha)}
                    aria-invalid={!!erroSenha}
                    aria-describedby={erroSenha ? 'senha-erro' : undefined}
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {erroSenha && (
                  <span id="senha-erro" className="form-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    {erroSenha}
                  </span>
                )}
              </div>

              <Link to="/esqueci-senha" className="login-forgot">
                Esqueci minha senha
              </Link>
            </div>

            <button type="submit" className="btn-primary login-submit">
              Entrar
            </button>
          </form>

          <p className="login-signup-link">
            Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </main>
    </div>
  );
};
