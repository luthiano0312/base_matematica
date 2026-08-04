import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Button } from '@/shared/components/Button/Button';
import { AuthProvider } from './AuthContext';
import { OnboardingRoute, ProtectedRoute } from './routes';
import { QuestionSessionProvider } from '@/features/questoes/QuestionSessionContext';
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
    <AuthProvider>
      <QuestionSessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/esqueci-senha" element={<PlaceholderPage title="Recuperação de senha" />} />
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <OnboardingWelcomePage />
                </OnboardingRoute>
              }
            />
            <Route
              path="/onboarding/checklist"
              element={
                <OnboardingRoute>
                  <OnboardingChecklistPage />
                </OnboardingRoute>
              }
            />
            <Route path="/questoes" element={<FiltroQuestoesPage isVisitante />} />
            <Route
              path="/filtro"
              element={
                <ProtectedRoute>
                  <FiltroQuestoesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/questao/:id" element={<QuestaoPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QuestionSessionProvider>
    </AuthProvider>
  );
}

export default App;
