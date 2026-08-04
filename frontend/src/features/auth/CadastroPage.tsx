import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import axios from 'axios';
import logoLight from '@/assets/logos/logo_light.svg';
import { Button } from '@/shared/components/Button/Button';
import { TextField } from '@/shared/components/TextField/TextField';
import { PasswordInput } from '@/shared/components/PasswordInput/PasswordInput';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { EMAIL_RE, verificarRequisitosSenha } from '@/shared/utils/validators';
import { useAuth } from '@/app/AuthContext';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import './CadastroPage.css';

type CampoNome = 'nome' | 'email' | 'senha' | 'confirmarSenha';
type Erros = Partial<Record<CampoNome, string>>;

type RequisitoSenha = {
  id: string;
  label: string;
  atendido: boolean;
};

const MSG_EMAIL_DUPLICADO = 'Este e-mail já está cadastrado. Tente fazer login.';

export function CadastroPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [erros, setErros] = useState<Erros>({});
  const [tocados, setTocados] = useState<Set<CampoNome>>(new Set());
  const [erroTermos, setErroTermos] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Checklist dinâmico — valida o RNF08 em tempo real enquanto o usuário digita.
  const { temMinimo, temNumero, temMaiuscula } = verificarRequisitosSenha(senha);

  const requisitos: RequisitoSenha[] = [
    { id: 'min', label: 'Mínimo de 8 caracteres', atendido: temMinimo },
    { id: 'num', label: 'Pelo menos 1 número', atendido: temNumero },
    { id: 'mai', label: 'Pelo menos 1 letra maiúscula', atendido: temMaiuscula },
  ];

  const validarCampo = (campo: CampoNome, valor: string): string | undefined => {
    if (!valor.trim()) return 'Este campo é obrigatório.';
    if (campo === 'email' && !EMAIL_RE.test(valor)) return 'Informe um e-mail válido.';
    if (campo === 'senha' && !(temMinimo && temNumero && temMaiuscula)) {
      return 'A senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 letra maiúscula.';
    }
    if (campo === 'confirmarSenha' && valor !== senha) return 'As senhas não coincidem.';
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
      nome: validarCampo('nome', nome),
      email: validarCampo('email', email),
      senha: validarCampo('senha', senha),
      confirmarSenha: validarCampo('confirmarSenha', confirmarSenha),
    };
    setErros(proximosErros);
    setTocados(new Set(['nome', 'email', 'senha', 'confirmarSenha']));

    if (!aceitouTermos) {
      setErroTermos('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
    } else {
      setErroTermos(null);
    }

    const temErro = Object.values(proximosErros).some(Boolean) || !aceitouTermos;
    if (temErro) return;

    setEnviando(true);
    try {
      await register({
        name: nome,
        email,
        password: senha,
        password_confirmation: confirmarSenha,
      });
      navigate('/onboarding');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const errors = err.response.data?.errors as Record<string, string[]> | undefined;
        setErroGeral(errors?.email ? MSG_EMAIL_DUPLICADO : MENSAGEM_ERRO_GENERICA);
      } else {
        setErroGeral(MENSAGEM_ERRO_GENERICA);
      }
    } finally {
      setEnviando(false);
    }
  };

  const erroNome = tocados.has('nome') ? erros.nome : undefined;
  const erroEmail = tocados.has('email') ? erros.email : undefined;
  const erroSenha = tocados.has('senha') ? erros.senha : undefined;
  const erroConfirmarSenha = tocados.has('confirmarSenha') ? erros.confirmarSenha : undefined;

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
          {erroGeral && <ErrorBanner message={erroGeral} />}

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
                onBlur={() => validarNoBlur('nome', nome)}
                error={erroNome}
              />

              <TextField
                id="email"
                name="email"
                type="email"
                label="E-mail"
                variant="dark"
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
                variant="dark"
                placeholder="Crie sua senha"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onBlur={() => validarNoBlur('senha', senha)}
                error={erroSenha}
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
                onBlur={() => validarNoBlur('confirmarSenha', confirmarSenha)}
                error={erroConfirmarSenha}
              />

              <div className="termos-container">
                <label className="termos-checkbox">
                  <input
                    type="checkbox"
                    checked={aceitouTermos}
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                    aria-invalid={Boolean(erroTermos)}
                  />
                  <span className="termos-text">
                    Li e aceito os <a href="#">Termos de Uso e Política de Privacidade</a>.
                  </span>
                </label>
                {erroTermos && <p className="termos-error">{erroTermos}</p>}
              </div>

              <Button type="submit" variant="green" block disabled={enviando}>
                {enviando ? 'Criando conta…' : 'Cadastrar-se'}
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
