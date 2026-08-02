import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import logoLight from '@/assets/logos/logo_light.svg';
import { Button } from '@/shared/components/Button/Button';
import { TextField } from '@/shared/components/TextField/TextField';
import { PasswordInput } from '@/shared/components/PasswordInput/PasswordInput';
import { verificarRequisitosSenha } from '@/shared/utils/validators';
import './CadastroPage.css';

type RequisitoSenha = {
  id: string;
  label: string;
  atendido: boolean;
};

export function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Checklist dinâmico — valida o RNF08 em tempo real enquanto o usuário digita.
  const { temMinimo, temNumero, temMaiuscula } = verificarRequisitosSenha(senha);

  const requisitos: RequisitoSenha[] = [
    { id: 'min', label: 'Mínimo de 8 caracteres', atendido: temMinimo },
    { id: 'num', label: 'Pelo menos 1 número', atendido: temNumero },
    { id: 'mai', label: 'Pelo menos 1 letra maiúscula', atendido: temMaiuscula },
  ];

  // Frontend-only: em sucesso, segue o fluxo Cadastro → Onboarding (Fluxo_de_Navegacao).
  const handleSubmit = (e: FormEvent) => {
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

          <div className="cadastro-form-login-container">
            <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
              <TextField
                id="nome"
                name="nome"
                type="text"
                label="Nome"
                variant="dark"
                placeholder="seu nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <TextField
                id="email"
                name="email"
                type="email"
                label="E-mail"
                variant="dark"
                placeholder="nome@examplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <PasswordInput
                id="senha"
                name="senha"
                label="Senha"
                variant="dark"
                placeholder="Crie sua senha"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

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

              <PasswordInput
                id="confirmar-senha"
                name="confirmar-senha"
                label="Confirmar senha"
                variant="dark"
                placeholder="Repita sua senha"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />

              <label className="termos-checkbox">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                />
                <span className="termos-text">
                  Li e aceito os <a href="#">Termos de Uso</a> e a{' '}
                  <a href="#">Política de Privacidade</a>.
                </span>
              </label>

              <Button type="submit" variant="green" block>
                Cadastrar-se
              </Button>
            </form>

            <p className="cadastro-login-link">
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
