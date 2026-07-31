import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CadastroPage } from './pages/CadastroPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingWelcomePage } from './pages/OnboardingWelcomePage';
import { OnboardingChecklistPage } from './pages/OnboardingChecklistPage';
import { DashboardPage } from './pages/DashboardPage';
import { FiltroQuestoesPage } from './pages/FiltroQuestoesPage';
import { QuestaoPage } from './pages/QuestaoPage';

// Páginas de marcador para navegação funcional durante desenvolvimento das demais telas
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <h1 style={{ color: 'var(--color-blue-dark)', marginBottom: '1rem' }}>{title}</h1>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Esta tela será implementada conforme a spec dedicada.</p>
    <Link to="/" className="btn-primary">Voltar para a Home</Link>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/esqueci-senha" element={<PlaceholderPage title="Recuperação de senha" />} />
        <Route path="/onboarding" element={<PlaceholderPage title="Onboarding (boas-vindas)" />} />
        <Route path="/onboarding" element={<OnboardingWelcomePage />} />
        <Route path="/onboarding/checklist" element={<OnboardingChecklistPage />} />
        <Route path="/questoes" element={<FiltroQuestoesPage isVisitante />} />
        <Route path="/filtro" element={<FiltroQuestoesPage />} />
        <Route path="/questao/:id" element={<QuestaoPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
