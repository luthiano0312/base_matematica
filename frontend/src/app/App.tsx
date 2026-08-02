import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Button } from '@/shared/components/Button/Button';
import { HomePage } from '@/features/home/HomePage';
import { CadastroPage } from '@/features/auth/CadastroPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { OnboardingWelcomePage } from '@/features/onboarding/OnboardingWelcomePage';
import { OnboardingChecklistPage } from '@/features/onboarding/OnboardingChecklistPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { FiltroQuestoesPage } from '@/features/questoes/FiltroQuestoesPage';
import { QuestaoPage } from '@/features/questoes/QuestaoPage';

// Páginas de marcador para navegação funcional durante desenvolvimento das demais telas
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="placeholder-page">
      <h1 className="placeholder-title">{title}</h1>
      <p className="placeholder-text">Esta tela será implementada conforme a spec dedicada.</p>
      <Button to="/">Voltar para a Home</Button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/esqueci-senha" element={<PlaceholderPage title="Recuperação de senha" />} />
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
