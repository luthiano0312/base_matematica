import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button/Button';
import { AuthProvider } from './AuthContext';
import { AdminAuthProvider } from './AdminAuthContext';
import { AdminRoute, OnboardingRoute, ProtectedRoute } from './routes';
import { QuestionSessionProvider } from '@/features/questoes/QuestionSessionContext';
import { HomePage } from '@/features/home/HomePage';
import { CadastroPage } from '@/features/auth/CadastroPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminLoginPage } from '@/features/admin/AdminLoginPage';
import { CadastroQuestoesPage } from '@/features/admin/cadastro-questoes/CadastroQuestoesPage';
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
      <AdminAuthProvider>
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

              {/* Painel administrativo (RN20 — sessão de admin separada) */}
              <Route path="/admin" element={<Navigate to="/admin/questoes/nova" replace />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/questoes/nova"
                element={
                  <AdminRoute>
                    <CadastroQuestoesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/questoes/:id/editar"
                element={
                  <AdminRoute>
                    <CadastroQuestoesPage />
                  </AdminRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </QuestionSessionProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
