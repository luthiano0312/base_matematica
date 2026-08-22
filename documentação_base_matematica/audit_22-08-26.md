# Auditoria do Repositório — base_matematica (Ceará Científico)

**Data:** 22/08/2026
**Escopo:** backend Laravel 13, frontend React 19, documentação de produto (vault Obsidian), infraestrutura e higiene do repositório.

---

## Sumário executivo

O projeto está em bom estado geral: arquitetura limpa (services, FormRequests, API Resources), sanitização de HTML bem feita, transações nos writes multi-tabela, suíte de testes razoável no backend e documentação de produto exemplar. Os problemas mais graves são de **segurança e pré-lançamento**:

1. **O gabarito das questões é enviado ao navegador antes da resposta** — qualquer aluno vê as respostas pelo DevTools.
2. **Nenhum rate limiting** nas rotas de autenticação (login, registro, reset de senha).
3. **Recuperação de senha sem frontend** — a rota `/esqueci-senha` é um placeholder, embora o backend esteja pronto.
4. **TypeScript sem `strict`** — a segurança de tipos do frontend é ilusória.
5. **Sem README de setup, sem CI** — onboarding de dev e gate de qualidade inexistentes.
6. **Termos de Uso / Política de Privacidade não existem**, mas o cadastro já exige aceite (risco jurídico de pré-lançamento).

---

## 🔴 Severidade alta

### A1. Gabarito exposto no cliente antes de responder (backend + frontend)

- `backend/app/Http/Resources/QuestionResource.php:18,25` — o resource inclui `correct_answer` e `options[].is_correct`.
- `backend/app/Http/Resources/PublicQuestionResource.php:13` — a versão pública remove apenas `video_resolution_url`; **o gabarito continua no payload** de `GET /public/questions` e `GET /questions` (aluno logado).
- `frontend/src/features/questoes/QuestaoPage.tsx:89-90, 114, 277-278` — o frontend usa `opt.is_correct` / `question.correct_answer` diretamente do objeto da questão para dar feedback.

**Impacto:** qualquer aluno abre DevTools → Network e vê todas as respostas antes de responder. Compromete o núcleo pedagógico e a pontuação.

**Recomendação:** criar um resource de "tentativa" que omita `correct_answer`/`is_correct` nas listagens; o frontend passa a usar apenas o retorno do `POST /questions/{id}/answers` (que já devolve `is_correct`, `correct_answer`, `text_resolution` — ver `AnswerController.php:30-35`). Para o fluxo de visitante (sem login), criar um endpoint público de verificação de resposta.

### A2. Sem rate limiting nas rotas de autenticação

- Nenhuma ocorrência de `throttle`/`RateLimiter` em `backend/routes/` ou `backend/app/`. Rotas `/register`, `/login`, `/admin/login`, `/password/email`, `/password/reset` (`backend/routes/api.php:20-29`) aceitam tentativas ilimitadas.

**Impacto:** força bruta de senhas e enumeração/spam de e-mails de reset.

**Recomendação:** aplicar `throttle:5,1` (ou `RateLimiter` nomeado) nas rotas de login/reset e `throttle` mais permissivo nas demais rotas públicas.

### A3. Recuperação de senha sem frontend (feature do MVP quebrada)

- Backend completo: `PasswordController`, `ForgotPasswordRequest`, `ResetPassword`, Brevo configurável; `authService.sendPasswordResetLink`/`resetPassword` existem em `frontend/src/services/authService.ts:38-49` mas **nunca são chamados**.
- `frontend/src/app/App.tsx:45` — a rota `/esqueci-senha` renderiza apenas `<PlaceholderPage title="Recuperação de senha" />`, embora o link esteja visível no login (`LoginPage.tsx:124`).

**Impacto:** RF15 anunciado ao usuário e não funcional.

### A4. TypeScript sem `strict`

- `frontend/tsconfig.app.json` e `frontend/tsconfig.node.json` não definem `"strict": true` (nem `strictNullChecks`/`noImplicitAny`).

**Impacto:** `null`/`undefined` passam em qualquer lugar sem erro de compilação; a tipagem existe mas não protege. Maior custo-benefício isolado da lista: ativar e corrigir os erros que surgirem.

### A5. Sem README de setup nem CI

- **Não existe README na raiz.** `backend/README.md` é boilerplate puro do Laravel; `frontend/README.md` é boilerplate do template Vite. Não há em lugar versionado o passo a passo: criar projeto Supabase, configurar `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, banco de **teste** (`base_matematica_test`, exigido pela suíte que usa `RefreshDatabase` contra Postgres real), credenciais Brevo, `ADMIN_INITIAL_PASSWORD`, proxy do Vite.
- O `CLAUDE.md` (que contém o guia real) está no `.gitignore` da raiz — **não é versionado**; outro dev que clonar não terá essas instruções.
- **Não existe `.github/workflows/`** — PHPUnit, Pint, `tsc -b` e oxlint nunca rodam em CI; não há gate de qualidade em PR.

**Recomendação:** README raiz com setup completo; substituir os READMEs boilerplate; CI mínimo (PHPUnit + Pint + `tsc -b` + oxlint); decidir entre versionar o `CLAUDE.md` ou mover seu conteúdo para o README.

### A6. Sem rota 404 no frontend

- `frontend/src/app/App.tsx:41-98` — não há `path="*"`. Qualquer URL inválida renderiza tela completamente em branco.

---

## 🟡 Severidade média

### Backend

| # | Achado | Local |
|---|---|---|
| M1 | **Race condition na pontuação:** `AnswerController::store` lê o histórico (`ScoringService::pointsForAttempt`) e insere `AnsweredQuestion` fora de transação/lock — duas requisições simultâneas da mesma questão podem ambas conceder pontuação cheia | `backend/app/Http/Controllers/Api/AnswerController.php:20-28`, `backend/app/Services/ScoringService.php:19-33` |
| M2 | **CORS com origem hardcoded:** `allowed_origins` fixo em `https://app-base-matematica.onrender.com`; dev local só funciona via proxy do Vite e qualquer outro domínio (preview, staging) quebra. Deveria vir de env | `backend/config/cors.php:24` |
| M3 | `QuestionController@update` deleta e recria **todas** as options a cada edição (IDs mudam). Hoje não há FK de `answered_questions` → options, então o histórico sobrevive, mas é frágil a futuras referências | `backend/app/Http/Controllers/Api/QuestionController.php:107-109` |
| M4 | Testes exigem Postgres real no Supabase (rede + credenciais) — rodar a suíte offline ou em CI exige provisionar `base_matematica_test`; documentar isso e/ou prever fallback | `backend/.env.testing`, `backend/phpunit.xml` |
| M5 | `AdminOverviewController` sem teste dedicado (demais controllers têm Feature tests correspondentes) | `backend/app/Http/Controllers/Api/AdminOverviewController.php` |

### Frontend

| # | Achado | Local |
|---|---|---|
| M6 | **Interceptor 401 limpa o token mas o React não fica sabendo:** token expira → localStorage limpo, mas `AuthContext.status` continua `'authenticated'`; `ProtectedRoute` segue liberando rotas e toda chamada falha com erro genérico em vez de redirecionar ao login | `frontend/src/services/http.ts:22-24`, `frontend/src/services/adminHttp.ts:23-25`, `frontend/src/app/routes.tsx:17-24` |
| M7 | **Tokens em localStorage** (`bm_token`, `bm_admin_token`) exfiltráveis por qualquer XSS; a sanitização atual mitiga, mas cookie `HttpOnly; Secure; SameSite` é o padrão robusto. Aceitável no MVP se for decisão consciente registrada | `frontend/src/services/http.ts:11` |
| M8 | **Painel admin sem code-splitting:** `App.tsx` importa estaticamente Tiptap, MathLive e KaTeX — todo visitante da Home baixa o editor de questões do admin. `React.lazy` nas rotas `/admin/*` resolve | `frontend/src/app/App.tsx:8-21` |
| M9 | **Sessão de questões vive só em memória:** F5 ou acesso direto a `/questao/:id` redireciona silenciosamente ao filtro; aluno perde o progresso da sessão sem aviso | `frontend/src/features/questoes/QuestaoPage.tsx:168-174`, `QuestionSessionContext.tsx` |
| M10 | **Duplicação estrutural:** `http.ts`/`adminHttp.ts` são cópias com divergências sutis (`hasAdminToken` existe só num; `AuthContext.tsx:24` lê a chave `'bm_token'` hardcoded duplicando `TOKEN_KEY`); `LoginPage`/`AdminLoginPage` ~130 linhas quase idênticas; `responderMCQ`/`responderTF`/`autoavaliar` são três cópias do mesmo fluxo. Uma factory `createHttpClient(tokenKey)` e extração de hooks resolveriam | `frontend/src/services/`, `frontend/src/features/questoes/QuestaoPage.tsx:83-153` |
| M11 | **CSS: tokens ignorados e paletas duplicadas** — 153 cores hex literais em 33 arquivos; `--color-blue-dark: #061d44` (`index.css:6`) e `--admin-blue-escuro: #061d44` (`admin-tokens.css:8`) são a mesma cor com dois nomes | `frontend/src/` |
| M12 | **Dashboard com botões mortos e loading ambíguo:** "Abrir perfil" sem `onClick` (linhas 67-69); atalho "Materiais de estudo" com `onClick` vazio (linha 161); durante a carga exibe zeros reais, indistinguível de "aluno novo" | `frontend/src/features/dashboard/DashboardPage.tsx` |
| M13 | **Tela de Perfil / edição de interesses (RN14) inexistente:** sem spec (pendência 21 em `Pendencias_Specs_de_Tela.md`) e sem implementação — aluno não pode revisar interesses após o onboarding | `frontend/src/features/` (ausente) |
| M14 | **Sem testes no frontend** — nenhum arquivo de teste nem dependência (vitest/testing-library). Relevante para uma plataforma cujo core é correção de respostas | `frontend/` |
| M15 | `.env.example` do backend lista variáveis `AWS_*` de boilerplate não usadas (o storage é Supabase) — gera confusão no setup | `backend/.env.example` |

---

## 🟢 Severidade baixa

### Backend / Infra

- **B1.** Logs locais `backend/test_aff.log` e `backend/test_full.log` no disco (corretamente ignorados pelo git — apenas sujeira local).
- **B2.** `Dockerfile` usa `php:8.4` enquanto `composer.json` declara `^8.3` — funciona, mas o pin diverge do requisito declarado.
- **B3.** Sem `docker-compose.yml` de desenvolvimento (o Dockerfile é só de produção/Render) e sem scripts integrados na raiz — rodar o ambiente completo exige dois terminais e conhecimento tácito.

### Frontend

- **B4.** `StatementRenderer` permite `target` no HTML sanitizado sem forçar `rel="noopener noreferrer"` em links `target="_blank"` (reverse tabnabbing) — `frontend/src/shared/components/StatementRenderer/StatementRenderer.tsx:25`.
- **B5.** Comentários `eslint-disable-next-line` inertes (o projeto usa oxlint, não eslint) e dependência omitida com stale-closure real — `QuestoesListagemPage.tsx:120,127`, `ConfirmDeleteModal.tsx:96`.
- **B6.** Código morto: `hasSession` nunca consumido (`QuestionSessionContext.tsx:16,58`); "Salvar como rascunho" é fake por design (`CadastroQuestoesPage.tsx:245-249`); re-export redundante em `adminService.ts:22`; `@tiptap/pm` no `package.json` sem import no `src`.
- **B7.** Axios sem `timeout` — requisições penduradas deixam spinners eternos em rede ruim (`http.ts:6-8`, `adminHttp.ts:7-9`).
- **B8.** `.oxlintrc.json` mínimo (só 2 regras); ativar regras de `jsx-a11y` pegaria os problemas de modal.
- **B9.** Acessibilidade: modal de fim de sessão é `div role="dialog"` sem focus trap/Esc/foco inicial — existe um `Modal` compartilhado com essas provisões que não foi reutilizado (`QuestaoPage.tsx:447-477`). No geral a a11y do projeto é boa.
- **B10.** Componentes grandes: `CadastroQuestoesPage.tsx` (603 linhas, 6 `useRef` num objeto literal) e `QuestaoPage.tsx` (480 linhas).
- **B11.** Sem tratamento de 403 — mensagem genérica opaca quando aluno acessa endpoint admin.

### Repositório / Docs

- **B12.** `.gitignore` da raiz quase vazio (só `CLAUDE.md`) — artefatos futuros na raiz (logs, `.idea/`, `.vscode/`) seriam commitados sem aviso. Verificado: nenhum segredo, `vendor/`, `node_modules/` ou `dist/` commitado hoje.
- **B13.** `.gitattributes` ausente na raiz — risco de diffs ruidosos CRLF/LF num time Windows (só `backend/.gitattributes` existe).
- **B14.** Pasta vazia esquecida: `documentação_base_matematica/_references/Nova pasta/`.
- **B15.** Binários commitados: 8 PDFs do Figma em `_references/` e 3 `.docx` em `_archive/` — decisão consciente de vault, mas incha o repo.

---

## 📋 Pendências de produto já registradas (docs)

Do `Pendencias.md` (todas 🟢, decisões conscientes):

1. **Termos de Uso e Política de Privacidade inexistentes** — o checkbox de aceite do cadastro (`CadastroPage.tsx:219`, link `href="#"`) e o rodapé da Home (que usa `alert()` em `Footer.tsx:8`) já referenciam documentos que não existem. **Bloqueio formal de pré-lançamento com risco jurídico** — apesar de classificada como baixa na doc, recomendo tratar como alta antes do lançamento.
2. **Auto-inflação de pontos em dissertativas** — autoavaliação "Acertei/Errei" sem validação pontua normalmente. Aceito no MVP; mitigação futura: campo `self_assessed` em `answered_questions`.
3. **Checklist de interesses sem limite** (RN14) — marcar tudo anula o poder discriminativo do sorteio do RF12. Aceito no MVP.
4. **Migração futura do `statement` para Markdown completo** — hoje parser próprio `$...$`/`$$...$$` + KaTeX; migrar exigiria revisão manual de enunciados (caracteres `_`, `*`, `-` virariam marcação).

Do `Pendencias_Specs_de_Tela.md`:

5. **Item 21 (🟡 em aberto): telas de Perfil e Menu não especificadas** — RN14 (edição de interesses) não tem tela definida nem implementada (ver M13).

---

## ✅ Pontos positivos verificados

- Sanitização DOMPurify com whitelist explícita antes de `innerHTML`; nenhum `dangerouslySetInnerHTML` no frontend; KaTeX com `throwOnError: false` (`StatementRenderer.tsx:18-44`).
- Upload de imagem validado (mime jpg/png/webp, máx 5 MB) e intermediado pelo backend conforme RN23 (`UploadImageRequest.php`, `UploadImageController.php`).
- Transações em writes multi-tabela (`QuestionController@store/update`), `DB::transaction` consistente.
- `$fillable` definido em todos os models; FKs e índices adequados nas migrations (`answered_questions` tem índices em `user_id+question_id` e `answered_at`).
- FormRequests para todas as operações de escrita, com mensagens em português.
- Cobertura de testes backend boa: 14 Feature tests + 3 Unit cobrindo auth, questões, respostas, dashboard, interesses, recomendação, upload, catálogo e reset de senha.
- `dist/`, `node_modules/`, `vendor/`, `.env` e `*.log` **não** estão no git.
- Defesa em profundidade no delete de questões (modal `can-delete` + bloqueio 409 no backend, RN11).

---

## Priorização sugerida

| Ordem | Item | Esforço estimado |
|---|---|---|
| 1 | **A1** — remover gabarito dos payloads de listagem | Médio (backend + ajuste na `QuestaoPage`) |
| 2 | **A2** — rate limiting nas rotas de auth | Baixo |
| 3 | **A3** — implementar `/esqueci-senha` (backend já pronto) | Médio |
| 4 | **P1** (docs) — redigir/publicar Termos de Uso e Privacidade ou remover o aceite até lá | Externo (jurídico/conteúdo) |
| 5 | **A5** — README raiz + CI mínimo | Baixo |
| 6 | **A4** — ativar `strict` no TypeScript | Médio/alto (corrigir erros resultantes) |
| 7 | **A6** — rota 404 | Baixo |
| 8 | **M6** — interceptor 401 notificar contexto de auth | Baixo |
| 9 | **M8** — `React.lazy` nas rotas `/admin/*` | Baixo |
| 10 | **M1** — transação/lock na gravação de resposta+pontuação | Baixo |
| 11 | **M13/P5** — especificar e implementar tela de Perfil (RN14) | Alto (spec + front + back) |
| 12 | Demais médias e baixas conforme capacidade pós-MVP | — |
