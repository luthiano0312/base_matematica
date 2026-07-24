import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import logoLight from '../assets/logos/logo_light.svg';
import './CadastroPage.css';

type RequisitoSenha = {
  id: string;
  label: string;
  atendido: boolean;
};

export const CadastroPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Checklist dinâmico — valida o RNF08 em tempo real enquanto o usuário digita.
  const temMinimo = senha.length >= 8;
  const temNumero = /\d/.test(senha);
  const temMaiuscula = /[A-Z]/.test(senha);

  const requisitos: RequisitoSenha[] = [
    { id: 'min', label: 'Mínimo de 8 caracteres', atendido: temMinimo },
    { id: 'num', label: 'Pelo menos 1 número', atendido: temNumero },
    { id: 'mai', label: 'Pelo menos 1 letra maiúscula', atendido: temMaiuscula },
  ];

  // Frontend-only: em sucesso, segue o fluxo Cadastro → Onboarding (Fluxo_de_Navegacao).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/onboarding');
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-topbar">
        <Link to="/" className="cadastro-back" aria-label="Voltar para a Home">
          <ArrowLeft size={20} /> voltar
        </Link>
      </div>

      <Link to="/" className="cadastro-logo-link" aria-label="Ir para a Home">
        <img src={logoLight} alt="Base Matemática" className="cadastro-logo" />
      </Link>

      <main className="cadastro-main">
        <div className="cadastro-card">
          <header className="cadastro-header">
            <h1 className="cadastro-title">Criar conta</h1>
            <p className="cadastro-subtitle">Preencha seus dados para começar a estudar.</p>
          </header>

          <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nome" className="form-label">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                className="form-input"
                placeholder="seu nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="nome@examplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha" className="form-label">Senha</label>
              <div className="input-wrapper">
                <input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  className="form-input form-input-with-action"
                  placeholder="Crie sua senha"
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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

              <ul className="senha-checklist" aria-label="Requisitos da senha">
                {requisitos.map((req) => (
                  <li
                    key={req.id}
                    className={`checklist-item ${req.atendido ? 'atendido' : ''}`}
                  >
                    <span className="checklist-icon">
                      <Check size={13} />
                    </span>
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="form-group">
              <label htmlFor="confirmar-senha" className="form-label">Confirmar senha</label>
              <div className="input-wrapper">
                <input
                  id="confirmar-senha"
                  name="confirmar-senha"
                  type={mostrarConfirmar ? 'text' : 'password'}
                  className="form-input form-input-with-action"
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  aria-label={mostrarConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="termos-checkbox">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
              />
              <span className="termos-text">
                Li e aceito os <a href="/cadastro">Termos de Uso</a> e a{' '}
                <a href="/cadastro">Política de Privacidade</a>.
              </span>
            </label>

            <button type="submit" className="btn-primary cadastro-submit">
              Cadastrar-se
            </button>
          </form>

          <p className="cadastro-login-link">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
};
