# Revisão Geral do Sistema — Base Matemática

> **Data da revisão:** 02/08/2026
> **Branch atual:** `refatoracao-frontend` (29 commits à frente de `main`)
> **Finalidade:** retrato completo do estado atual do sistema (backend, frontend, integração, autenticação, validação, conformidade com a documentação e pendências).

---

## 1. Visão Geral

**Base Matemática** é uma plataforma social de ensino gamificado de matemática para alunos do ensino médio (inspirada em Duolingo), mobile-first. Possui três perfis: Aluno, Visitante (sem login) e Produtor de conteúdo (admin).

| Camada | Stack |
|---|---|
| Backend | Laravel 13.20 (PHP ^8.3) + Sanctum 4.3.3 (token-based) |
| Banco | PostgreSQL (Supabase pooler) — dev/test |
| Frontend | React 19.2 + react-router-dom 7.18 + TypeScript ~6.0 (strict) + Vite 8.1 + Axios 1.19 + lucide-react |
| Estilo | CSS puro com design tokens (`index.css`), BEM, Nunito (UI) + Lora (matemática) |
| Testes | Backend: PHPUnit (10 feature + unit). Frontend: nenhum |
| Idioma do código | pt-BR |

- **Backend:** `backend/` — REST API em `routes/api.php` com prefixo `/api`.
- **Frontend:** `frontend/` — SPA com rotas em `src/app/App.tsx` e camada de serviços pronta mas **não conectada**.
- **Documentação:** raiz (`api.md`, `audit.md`, `plano.md`, specs/handoffs) + vault `documenta%C3%A7%C3%A3o_base_matematica/`.

---

## 2. Backend — Rotas Implementadas

Fonte: `backend/routes/api.php`

### 2.1 Públicas (sem middleware)

| Método | URI | Controlador | Descrição |
|---|---|---|---|
| POST | `/api/register` | `AuthController@register` | Registro (cria user + token Sanctum, 201) |
| POST | `/api/login` | `AuthController@login` | Login (email+senha, retorna token) |
| POST | `/api/password/email` | `PasswordController@sendResetLink` | Envia link de reset (throttle 429, resposta genérica) |
| POST | `/api/password/reset` | `PasswordController@reset` | Redefine senha (token single-use, 1h) |
| GET | `/api/public/questions` | `PublicQuestionController@index` | Questões p/ visitante: 6 por tópico (2/2/2), sem vídeo, sem persistência |

### 2.2 Autenticadas (`auth:sanctum`)

| Método | URI | Controlador | Descrição |
|---|---|---|---|
| POST | `/api/logout` | `AuthController@logout` | Revoga token atual |
| GET | `/api/me` | `AuthController@me` | Dados do usuário logado |
| GET | `/api/me/dashboard` | `DashboardController@index` | Pontos, streak, respondidas/acertos/erros, % acerto, melhor tópico |
| GET | `/api/me/interests` | `InterestController@index` | Lista de conteúdos de interesse |
| PUT | `/api/me/interests` | `InterestController@update` | Substitui interesses (edição por perfil, RN14) |
| GET | `/api/me/recommended-questions` | `RecommendationController@index` | RF12: cascata interesses → conteúdo com mais acertos → aleatório |
| POST | `/api/onboarding/interests` | `InterestController@onboarding` | Interesses do onboarding (vazio aceito — RN12/13) |
| GET | `/api/questions` | `QuestionFilterController@index` | Filtro/lista de questões (modo normal e progressão RN17) |
| POST | `/api/questions/{question}/answers` | `AnswerController@store` | Registra resposta (RN11), pontua via ScoringService |

### 2.3 Administrativas (`auth:sanctum` + `admin` → `EnsureUserIsAdmin`)

| URI | Controlador | Rotas geradas |
|---|---|---|
| `/api/admin/questions` | `QuestionController` | `index/store/show/update/destroy` |
| `/api/admin/contents` | `ContentController` | `index/store/show/update/destroy` |
| `/api/admin/topics` | `TopicController` | `index/store/show/update/destroy` |

### 2.4 Outras rotas

- `web.php`: GET `/` → view `welcome`.
- `console.php`: apenas comando `inspire`.
- `bootstrap/app.php`: rota de health `/up`.

---

## 3. Backend — Camadas Internas

### 3.1 Modelos (`backend/app/Models`)

| Modelo | Fillable | Observações |
|---|---|---|
| `User` | name, email, password, is_admin | `HasApiTokens`, cast `is_admin` boolean, sobrescreve `sendPasswordResetNotification` |
| `Question` | statement, type, correct_answer, difficulty, text_resolution, video_resolution_url | Rel.: options, contents, topics, answers |
| `QuestionOption` | question_id, text, is_correct, order | Rel.: question |
| `Topic` | name, content_id | Rel.: content, questions |
| `Content` | name | Rel.: topics, questions |
| `AnsweredQuestion` | user_id, question_id, is_correct, points_earned, answered_at | Rel.: user, question |
| `UserInterest` | user_id, content_id | Pivot user_interests |

### 3.2 Middleware

- **`EnsureUserIsAdmin`** (alias `admin`): exige `$request->user()` com `is_admin`; senão 403 JSON "Acesso restrito a administradores."

### 3.3 Form Requests (validação)

`RegisterRequest`, `LoginRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `StoreQuestionRequest` (+`Update`), `StoreTopicRequest` (+`Update`), `StoreContentRequest` (+`Update`), `IndexQuestionsRequest`, `PublicIndexQuestionsRequest`, `UpdateInterestsRequest`, `AnswerQuestionRequest`.

**Regras-chave:**

- **RNF08 (senha):** `Password::defaults()` global em `AppServiceProvider::boot()` — min 8, ≥1 número, ≥1 maiúscula; cadastro/reset exigem `confirmed`.
- **Questão (RN05/06/16):** `difficulty` obrigatória (easy/medium/hard); `content_ids` obrigatório (≥1); `topic_ids` opcional com checagem pós-validação — cada tópico deve pertencer a um conteúdo vinculado (RN16); exactly 1 opção correta em multiple_choice.
- **Resposta (por tipo):** MCQ → `option_id` pertencente à questão; true_false → `answer` in `certo/errado`; essay → `answer` (texto) + `self_corrected` (bool).
- **Filtro:** `mode` in `normal/progression`; `quantidade` obrigatória em progressão (RN17); tópico deve pertencer ao conteúdo informado.

### 3.4 Resources

- `UserResource` → id, name, email, created_at (esconde is_admin/senha).
- `QuestionResource` → dados da questão + options/contents/topics (quando carregados).
- `PublicQuestionResource` → estende Question, **remove `video_resolution_url`** (RN04b).

### 3.5 Services

- **`ScoringService`** (RN07–RN10): fácil=10, médio=15, difícil=20; 0 pontos se já acertou antes (RN10); +5 fixo ao reacertar questão errada anteriormente (RN09); pontos cheios no 1º acerto (RN08).
- **`StreakService`** (RN18): dias consecutivos distintos com ≥1 resposta, cutoff meia-noite America/Sao_Paulo, sem carência.

### 3.6 Migrations (13)

`users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `contents`, `topics`, `questions`, `question_options`, `question_content` (pivot), `question_topic` (pivot), `personal_access_tokens` (Sanctum), `answered_questions` (FKs sem delete-cascade — preserva histórico), `user_interests` (pivot), além de `is_admin` em `users`.

### 3.7 Autenticação

- Sanctum token-based; tokens criados como `api-token`, **sem expiração** (`config/sanctum.php`).
- `config/auth.php`: guard padrão `web`, password broker com expire 60 min.
- `.env`/`.env.example`: `MAIL_MAILER=log` em dev; Brevo (RNF09) pendente.

### 3.8 Testes Backend

- **Feature:** PasswordReset, PublicQuestions, QuestionFilter, RecommendedQuestions, AdminContentTopic, PasswordRule, Interest, Dashboard, AnswerQuestion.
- **Unit:** StreakService, ScoringService.
- **Gap:** nenhum teste dedicado para o CRUD admin de `questions` (contents/topics têm).

---

## 4. Frontend — Rotas e Telas

Fonte: `frontend/src/app/App.tsx`

| Rota | Componente | Protegida? | Estado |
|---|---|---|---|
| `/` | `HomePage` | Não | Estática (marketing, completa) |
| `/login` | `LoginPage` | Não | **Frontend-only** — valida e navega p/ `/dashboard`, sem API |
| `/cadastro` | `CadastroPage` | Não | **Frontend-only** — navega p/ `/onboarding`, sem API; validação parcial (gap B9) |
| `/esqueci-senha` | `PlaceholderPage` | Não | Placeholder "será implementada" |
| `/onboarding` | `OnboardingWelcomePage` | Não | Estática |
| `/onboarding/checklist` | `OnboardingChecklistPage` | Não | 10 conteúdos **hardcoded** (não busca API) |
| `/questoes` | `FiltroQuestoesPage isVisitante` | Não | Dropdowns **vazios** (nunca populados) |
| `/filtro` | `FiltroQuestoesPage` | Não | Dropdowns **vazios** |
| `/questao/:id` | `QuestaoPage` | Não | **MOCK** `MOCK_QUESTAO`; "Responder" é no-op; ignora `useParams` (gap B7) |
| `/dashboard` | `DashboardPage` | **Não** | **MOCK** `MOCK_USER`; donut card implementado; "Materiais" é no-op |

**Pontos críticos:**

- **Não existe proteção de rota** — `/dashboard`, `/filtro` etc. acessíveis sem autenticação; sem `ProtectedRoute`, sem layout/Outlet, sem AuthContext.
- **Telas com dados mock:** dashboard, questão, onboarding checklist, filtro (listas vazias).
- Componentes compartilhados em `src/shared/components/`: Button, TextField, PasswordInput, SelectField, IconButton, Chip, ToggleListItem, StatCard, ProgressBar (+ `InfoCard/` vazio).

---

## 5. Integração Frontend ↔ Backend

### 5.1 Camada de serviços (pronta, porém **não utilizada**)

`frontend/src/services/` contém client Axios e funções alinhadas aos endpoints reais, mas **nenhuma página importa esses serviços** (0 referências em `src/features`):

- **`http.ts`** — `baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api'`; interceptor injeta `Authorization: Bearer <token>` lido de `localStorage` (`bm_token`); `setAuthToken()` grava/remove token. **Sem response interceptor / tratamento de erros centralizado.**
- **`authService.ts`** — register, login, logout, getMe, sendPasswordResetLink, resetPassword.
- **`dashboardService.ts`** — getDashboard, getInterests, updateInterests, saveOnboardingInterests.
- **`questionService.ts`** — getPublicQuestions, getFilteredQuestions, getRecommendedQuestions, answerMultipleChoice, answerTrueFalse, answerEssay.

### 5.2 Configuração de ambiente

- **Não existe `.env` no frontend** → `VITE_API_BASE_URL` indefinida → fallback relativo `/api`.
- **`vite.config.ts` não tem proxy** → em dev, chamadas a `/api/*` batem no servidor Vite e retornariam 404 a menos que o backend sirva atrás dele. **A integração é o próximo passo (segundo `api.md` e `audit.md`).**

### 5.3 Mapeamento de erros (documentado em `api.md`)

| Status | Significado | Onde tratar |
|---|---|---|
| 422 | Filtro inconsistente / validação | formulários (Convencoes_UI) |
| 400 | `content_id` inexistente | filtro |
| 401 | Não autenticado | redirecionar login |
| 404 | Questão inexistente | tela de questão |

O frontend **ainda não mapeia** esses códigos (sem telas conectadas).

---

## 6. Autenticação

| Aspecto | Backend | Frontend |
|---|---|---|
| Registro | ✅ `POST /register` + token | ⚠️ Tela existe mas não chama API |
| Login | ✅ `POST /login` + token | ⚠️ Tela existe mas não chama API |
| Logout | ✅ `POST /logout` (revoga token) | ❌ Sem UI de logout; `logout()` nunca é chamado |
| Usuário atual | ✅ `GET /me` | ❌ `getMe()` nunca é chamado; dashboard usa `MOCK_USER` |
| Persistência de token | — | `localStorage` chave `bm_token` (trade-off XSS aceito p/ MVP) |
| Proteção de rotas | `auth:sanctum` (API) | ❌ Nenhuma no React |
| Reset de senha | ✅ email + token single-use 1h (RF15) | ⚠️ Rota `/esqueci-senha` é placeholder |

---

## 7. Validação

| Camada | Situação |
|---|---|
| Backend | ✅ Completa (RNF08, RN05/06/16, RN17, validação por tipo de questão, existência de FKs) |
| Frontend — Login | ✅ Manual (obrigatório + regex email, erro on-blur) |
| Frontend — Cadastro | ⚠️ Checklist de senha em tempo real; **faltam** mismatch/obrigatórios on-blur e banner de rede (gap B9) |
| Frontend — Filtro | ⚠️ Só valida `quantidade` no modo Progressão; listas de conteúdo/tópico nunca carregadas |
| Erros de rede | ❌ Sem interceptor/tratamento centralizado no axios |

---

## 8. Testes

| Suíte | Cobertura | Status |
|---|---|---|
| Backend Feature | PasswordReset, PublicQuestions, QuestionFilter (RN17), Recommendations (RF12), AdminContentTopic, PasswordRule (RNF08), Interest, Dashboard, AnswerQuestion | ✅ passando |
| Backend Unit | StreakService (RN18), ScoringService (RN07–10) | ✅ passando |
| Backend Gap | CRUD admin de `questions` sem teste dedicado | ⚠️ |
| Frontend | **Nenhum** (sem vitest/jest; decisão consciente em `audit.md`) | ❌ |

---

## 9. Conformidade com a Documentação

### 9.1 Regras de negócio (RN)

| Regra | Descrição | Status |
|---|---|---|
| RN01–03 | Acesso visitante vs aluno | Backend parcial (public/questions); **frontend sem guarda de rota** |
| RN04 | Visitante: 6 (2/2/2), sem vídeo, sem persistência, fallback, redirect pós-6ª | ✅ Backend implementado (PublicQuestionsTest) |
| RN05 | Dificuldade obrigatória | ✅ `StoreQuestionRequest` |
| RN06 | 1+ conteúdos, 0+ tópicos | ✅ |
| RN07–10 | Pontuação fixa / 1º acerto / +5 retry / 0 reacerto | ✅ `ScoringService` + testes |
| RN11 | Cada resposta = novo registro | ✅ `AnswerController@store` (nunca update) |
| RN12–14 | Onboarding opcional / sem interesses = igual / edição via perfil | ✅ Backend; **RN14 sem tela** (perfil não especificado) |
| RN15 | Admin via painel único | ✅ |
| RN16 | Tópico ∈ conteúdo vinculado | ✅ validação pós-`store` |
| RN17 | Progressão base ÷3, resto fácil→médio→difícil | ✅ `QuestionFilterController` + testes |
| RN18 | Streak dias distintos, cutoff Brasília, sem carência | ✅ `StreakService` + testes |
| RN19 | Proteção de acesso ao onboarding | ❌ **Não implementado no frontend** |

### 9.2 Requisitos funcionais (RF)

| RF | Descrição | Status |
|---|---|---|
| RF01 | Auth | ✅ Backend; ⚠️ frontend desconectado |
| RF02–03 | Conteúdo público; questões/vídeos restritos | ✅ Backend |
| RF04 | Auto-correção MCQ + true/false | ✅ `AnswerController` |
| RF05 | Essay com auto-avaliação | ✅ (risco de inflação aceito) |
| RF06 | Filtro conteúdo/tópico + quantidade | ✅ Backend |
| RF07–09 | Novo registro por tentativa / pontuação / pontos acumulados | ✅ |
| RF10–11 | Onboarding interesses / edição | ✅ Backend |
| RF12 | Recomendação em cascata | ✅ `RecommendationController` |
| RF13 | Admin questions + contents + topics | ✅ |
| RF14 | Template admin por tipo | ⚠️ Sem tela (apenas API) |
| RF15 | Recuperação de senha | ✅ Backend; ⚠️ telas frontend não especificadas |

### 9.3 Requisitos não-funcionais (RNF)

| RNF | Descrição | Status |
|---|---|---|
| RNF01 | Responsivo mobile-first | ✅ CSS tokens + breakpoints |
| RNF02 | Laravel REST API | ✅ |
| RNF03 | React + Axios | ✅ (axios instalado; integração pendente) |
| RNF04 | KaTeX | ❌ **Não instalado** (gap B10) |
| RNF05 | Corpo min 16px | ✅ |
| RNF06 | Expressões matemáticas 18–20px | ✅ CSS |
| RNF07 | Vídeos externos (URL) | ✅ `video_resolution_url` |
| RNF08 | Senha min 8 + número + maiúscula + confirmação | ✅ backend; ⚠️ frontend parcial (gap B9) |
| RNF09 | E-mail transacional Brevo | ⚠️ **Credenciais pendentes** (dev usa `log`) |

### 9.4 Divergências e pontos de atenção documentais

1. **Dashboard — desempenho:** `handoff-card-desempenho-novo.md` especifica **1 card unificado (donut)**, substituindo os 4 cards de `Spec_Dashboard.md`. Frontend já implementa o donut. ✅ alinhado ao handoff.
2. **Cor de erro:** `Convencoes_UI.md` propõe `#F13A3A`; specs/handoffs usam `#F44336` (Dashboard usa `#F44336`). **Pendente oficializar.**
3. **Spec da tela de questão:** `Spec_Tela_Questao_Redesign.md` (novo layout: topbar lavanda + corpo navy, badge de letra, botão `#258BFC`) é a versão mais recente; `spec_telas/Spec_Questao.md` é a antiga. Frontend `QuestaoPage` segue parcialmente o redesign.
4. **Default de filtros vazios:** `Spec_Filtro_e_Questoes_Logado.md` diz 9 questões (3/3/3) via RF12; `Spec_Filtro_de_Questoes.md` diz que Continuar funciona com filtros vazios. Backend: `/questions` sem filtros retorna sem limite fixo — **comportamento final precisa ser definido**.
5. **Streak card:** `handoff-cards-streak-pontos.md` alerta que o prototype não mostra o número — o agente deve **adicionar a contagem** (o Dashboard já exibe streak count).
6. **Estado da questão pós-resposta, true/false, essay, modal de fim de lote:** comportamento definido em texto, mas **sem Figma**.

---

## 10. Pendências

### 10.1 Backend

- **RNF09:** preencher credenciais Brevo (SMTP) antes do lançamento (`.env.example`).
- **`QuestionPolicy`:** referencia coluna inexistente `$question->user_id` (não usado) — remover ou corrigir.
- **Teste dedicado** para o CRUD admin de `questions`.
- Soft-delete em `answered_questions` caso futuramente se queira apagar histórico (hoje intencionalmente sem cascade).

### 10.2 Frontend (integração — passo crítico)

- **Conectar telas à camada `services/`** (hoje 100% morta): prioridade por `api.md` = login/cadastro → responder questão → dashboard → filtro → interesses.
- **Configurar proxy Vite ou `VITE_API_BASE_URL`** (sem `.env` hoje).
- **Proteção de rotas** (RN19 onboarding; dashboard autenticado; visitante → `/questoes`).
- **`/esqueci-senha`** — implementar telas do fluxo RF15.
- **`/questao/:id`** — usar `useParams` e chamada real; implementar "Responder" (no-op hoje).
- **Filtro** — popular dropdowns de conteúdo/tópico; tratar fallback por insuficiência.
- **Onboarding checklist** — buscar conteúdos dinâmicos; salvar via `POST /onboarding/interests`.
- **Dashboard** — substituir `MOCK_USER` por `/me/dashboard` + `/me`.
- **Cadastro (gap B9)** — validação on-blur, mismatch de senha, banner de rede.
- **KaTeX (RNF04)** — instalar e renderizar enunciados.
- **Termos de Uso / Política** — links mortos (`href="#"`, `alert(...)`).
- **Logout UI** e tratamento centralizado de erros no axios.
- Lixeira: tipinho `nome@examplo.com` nos forms de auth; `InfoCard/` vazio; `icons.svg` sem uso.

### 10.3 Documentação / Specs

- **Telas Perfil e Menu** não especificadas (item 21) — RN14 sem destino.
- **Telas do fluxo de recuperação de senha** não especificadas.
- **Documento único Termos de Uso + Política de Privacidade** não existe (pendência pré-lançamento).
- **Figma** dos estados pós-resposta / true-false / essay / modal de fim de lote; cor da alternativa selecionada.
- **Oficializar cor de erro** (`#F13A3A` vs `#F44336`).
- Entrada incompleta "inconsistencias nos" em `Pendencias.md`.
- `nul` (arquivo na raiz) é lixo gerado por comando falho (`tree: command not found`) — **pode ser removido**.

---

## 11. Resumo Executivo

- **Backend está maduro:** todas as regras de negócio do MVP (RN04–RN18) implementadas e testadas; admin CRUD completo; auth Sanctum funcional.
- **Frontend é um protótipo visual:** telas bonitas e acessíveis, mas **integração zero** — login/cadastro/dashboard/questões usam dados mock ou navegação sem chamadas.
- **Gargalo do projeto:** conectar o frontend à API (proxy + `services/` + proteção de rotas + telas em falta).
- **Pendências de lançamento:** Brevo, termos de uso, telas de perfil/esqueci-senha, KaTeX.
