# Implementação do Plano_Implementacao_Admin.md — Painel Admin

## Decisões da Etapa 0 (fechadas com o usuário)
- **Auth admin (RN20):** já funcional — guard `admin`, `/api/admin/login|me|logout`, middleware `auth:admin` no grupo `/admin/*`. Nada a fazer.
- **Rotas de cadastro/edição de questão confirmadas:** `/admin/questoes/nova` e `/admin/questoes/:id/editar` (já existem em `frontend/src/app/App.tsx`).
- **Pendência 1 (nome duplicado):** PERMITIR duplicados no MVP; validação só de tamanho (`max:100`).
- **Pendência 2 (trocar Conteúdo pai de Tópico com questões, RN16):** BLOQUEAR a troca no backend (422 com mensagem clara).
- **Escopo do layout:** as telas de cadastro/edição de questão também migram para o novo shell com sidebar (remover o `AdminLayout` topbar antigo ao final).

---

## 1. Backend (Laravel em `backend/`)

### 1.1 Conteúdos e Tópicos (Etapa 2)
- **`app/Http/Controllers/Api/ContentController.php`**
  - `index()`: `GET /admin/contents` passa a retornar Conteúdos ordenados por `name`, com Tópicos aninhados e contagens (`topics_count`, `questions_count` via `withCount`; por tópico, `questions_count`) — sem N+1.
  - `canDelete()`: novo método → `{ can_delete, reason, counts: {topics, questions} }`. Mensagens exatas da `Spec_Modal_Confirmacao_Exclusao` (tópico(s) / questão(ões) / ambos).
  - `destroy()`: bloqueia exclusão com dependências → HTTP 409 `{ message }` (defesa em profundidade além do can-delete).
- **`app/Http/Controllers/Api/TopicController.php`**
  - `canDelete()` + `destroy()` com bloqueio por questões vinculadas (`question_topic`).
  - `update()`: RN16 — se `content_id` muda e o tópico tem questões vinculadas → 422 "Este tópico tem questões vinculadas e não pode mudar de conteúdo."
  - `index()`: aceitar filtro `?content_id=` (usado pelo select em cascata da listagem de questões).
- **`app/Http/Requests/StoreContentRequest.php` / `StoreTopicRequest.php`**: `name` → `max:100` (limite da spec do modal, com contador no frontend).

### 1.2 Questões — listagem e exclusão (Etapa 3)
- **`app/Http/Controllers/Api/QuestionController.php`**
  - `index()`: adicionar filtro `search` (LIKE no `statement`); `per_page` default 20 (spec da listagem).
  - `canDelete()`: verifica `answered_questions` → mensagem da spec ("Esta questão já tem respostas de alunos registradas…").
  - `destroy()`: 409 quando há `answered_questions` (RN11 — histórico preservado).
- **`app/Http/Resources/QuestionResource.php`**: adicionar `statement_plain` — extração de texto puro no backend (decisão do plano): substitui `span[data-latex]` pelo valor do atributo, `strip_tags`, decode de entidades, colapsa whitespace. Frontend mostra "(sem texto no enunciado)" quando vazio.

### 1.3 Visão Geral (Etapa 4)
- **Novo `app/Http/Controllers/Api/AdminOverviewController.php`**: `GET /admin/overview` — endpoint agregador único: `{ counts: {questions, topics, contents}, topics_without_questions, recent: [{type: question|topic|content, id, title, subtitle, created_at}] }` (união das 5 criações mais recentes entre as 3 tabelas, ordenadas por `created_at` desc).

### 1.4 Rotas (`routes/api.php`, grupo `auth:admin`/prefix `admin`)
```php
Route::get('/overview', [AdminOverviewController::class, 'index']);
Route::get('/contents/{content}/can-delete', [ContentController::class, 'canDelete']);
Route::get('/topics/{topic}/can-delete', [TopicController::class, 'canDelete']);
Route::get('/questions/{question}/can-delete', [QuestionController::class, 'canDelete']);
```

### 1.5 Seeders de teste (pré-requisito Etapa 0)
- **Novo `database/seeders/QuestionsSeeder.php`**: 1 usuário de teste + ~8 questões variando tipo/dificuldade, vinculadas aos conteúdos/tópicos do `ContentsTopicsSeeder`; 2–3 delas com `answered_questions` (para testar bloqueio de exclusão). Registrado no `DatabaseSeeder` (idempotente, `firstOrCreate`/verificação por contagem).

---

## 2. Frontend (React em `frontend/`)

### 2.1 Fundação (Etapa 1)
- **Tokens admin**: variáveis `--admin-*` em novo bloco/`admin.css` importado pelo layout — paleta (`#061D44`, `#258BFC`, `#26E874`, `#DE4EE1`, `#EFEEFF`), neutros (`#DCDBE8`, `#ECEAFA`, `#5A6478`, `#8A90A3`, `#C9D3E6`), dificuldade (fácil `#EAF3DE/#27500A`, média `#FAEEDA/#854F0B`, difícil `#FCEBEB/#791F1F`), danger (`#A32D2D`/`#FCEBEB`), tipografia Nunito, raios (16px card, 8–10px controle, 20px badge), sidebar 220px/72px.
- **Novo `features/admin/AdminPanelLayout.tsx` + `.css`**: sidebar fixa 220px `#061D44` (logo pirâmide SVG reutilizado, 3 itens com ícones lucide `LayoutDashboard/FileText/Folder`, estados ativo/inativo/hover/foco, bloco de usuário no rodapé com avatar de iniciais + nome + Sair) + `<Outlet/>` em área `#EFEEFF` com padding 32px 36px. `<nav aria-label>`, `aria-current="page"`. Tablet (768–1024px): sidebar colapsa para 72px só com ícones + tooltip.
- **Componentes genéricos em `shared/components/`**:
  - `Modal/` — base: overlay `rgba(6,29,68,0.45)`, container branco radius 16px, fechamento por Esc/clique-fora/Cancelar, trap de foco, foco inicial e restauração do foco, `role`/`aria-modal`/`aria-labelledby`.
  - `Toast/` — `ToastProvider` + `useToast()` (sucesso/erro, auto-dismiss ~4s, canto superior direito).
  - `Skeleton/` — bloco pulsante genérico com dimensões por prop.
  - `Badge/` — pill de dificuldade com as 3 cores semânticas.
  - **Extender `Button/`** existente: variantes `secondary` (transparente + borda `#DCDBE8`) e `danger` (`#A32D2D`) + prop `loading` (spinner, desabilita).
- **Rotas em `App.tsx`**: rota aninhada `/admin` (guard `AdminRoute` > `AdminPanelLayout`) com filhas: index → redirect `/admin/visao-geral`, `visao-geral`, `questoes` (listagem), `conteudos`, `questoes/nova`, `questoes/:id/editar`. `AdminLoginPage` passa a navegar para `/admin/visao-geral` após login.
- **Migração do cadastro**: `CadastroQuestoesPage` troca `AdminLayout` (topbar) pelo novo shell, mantendo o breadcrumb como cabeçalho interno da área de conteúdo; `AdminLayout.tsx/.css` removidos ao final.

### 2.2 Conteúdos & Tópicos (Etapa 2)
- **`features/admin/conteudos-topicos/ConteudosTopicosPage.tsx` + `.css`**: cabeçalho com subtítulo dinâmico "{N} conteúdos, {M} tópicos." + botão "Novo conteúdo"; cards aninhados (header lavanda com nome + "{N} tópicos · {M} questões", linhas de tópico com indentação 30px + contagem + ações, rodapé "+ Novo tópico"); estados: sem tópicos por card ("Nenhum tópico ainda."), base vazia (`folder-plus` + CTA), skeleton de 3 cards, erro + "Tentar novamente". Lê query param `?editar=topic:ID|content:ID` (vindo da Visão Geral) para abrir o modal de edição.
- **`features/admin/conteudos-topicos/ConteudoTopicoModal.tsx`**: um componente, dois modos (Conteúdo/Tópico) × criar/editar; campo Nome com contador {n}/100, validação de vazio, erro inline; campo Conteúdo (só modo Tópico) — travado com texto auxiliar quando criado a partir de um card, editável na edição direta; botões "Criar conteúdo/tópico" e "Salvar alterações" com loading "Salvando…"; erro de RN16 (422) exibido no modal.

### 2.3 Modal de Confirmação de Exclusão (compartilhado)
- **`features/admin/components/ConfirmDeleteModal.tsx`**: genérico por entidade (Questão/Conteúdo/Tópico). Ao abrir chama `can-delete` (estado loading com spinner), resolve para "permitido" (trash/vermelho, botão Excluir destrutivo com loading "Excluindo…") ou "bloqueado" (alerta amarelo, só "Entendi", sem botão de forçar). Falha na verificação → fecha + toast de erro; falha no DELETE → erro dentro do modal; sucesso → toast "{Entidade} excluído." + atualização da lista sem reload. Foco em Cancelar/Entendi, restaurado ao ícone de origem.

### 2.4 Questões — Listagem (Etapa 3)
- **`features/admin/questoes-listagem/QuestoesListagemPage.tsx` + `.css`**: cabeçalho "{total} questões cadastradas." + "Nova questão" (→ `/admin/questoes/nova`); card de filtros (4 selects — Conteúdo, Tópico em cascata via `GET /admin/topics?content_id=` com reset e disabled "Escolha um conteúdo primeiro", Dificuldade, Tipo) + busca com lupa e debounce 300ms; tabela `table-layout: fixed` (Enunciado 34% truncado via `statement_plain`, Tipo 15%, Dificuldade 12% com Badge, Conteúdo 20% "primeiro +N", Ações 19% editar/excluir); paginação servidor-side 20/página ("Página X de Y", Anterior/Próxima); estados: skeleton 6 linhas, erro, vazio por filtro ("Nenhuma questão encontrada para esse filtro." + "Limpar filtros") e base vazia ("Nenhuma questão cadastrada ainda." + "Nova questão"). Editar → `/admin/questoes/:id/editar`. Excluir → `ConfirmDeleteModal`.

### 2.5 Visão Geral (Etapa 4)
- **`features/admin/visao-geral/AdminVisaoGeralPage.tsx` + `.css`**: grid de 3 cards de métrica (azul/verde/magenta, número Black 900 36px, label uppercase, ícone em badge); banner condicional de "N tópicos ainda sem nenhuma questão vinculada" (só se > 0, clique → `/admin/conteudos`); lista "Cadastrado recentemente" (5 itens do `/admin/overview`) com timestamp relativo, navegando para edição (questão → rota de editar; tópico/conteúdo → `/admin/conteudos?editar=...`); estados loading (skeletons), erro ("Não foi possível carregar os dados." + "Tentar novamente") e vazio ("Nenhuma atividade ainda.").

### 2.6 Camada de serviço
- **`services/adminService.ts`**: adicionar `getContents` (com contagens), `createContent/updateContent/deleteContent/canDeleteContent`, equivalentes de Topic, `listQuestions(filters)` (usa `meta` de paginação), `canDeleteQuestion/deleteQuestion`, `getOverview`.
- **`services/types.ts`**: tipos novos (`AdminContent` com tópicos aninhados e contagens, `CanDeleteResponse`, `OverviewData`, `PaginatedQuestions`, etc.).

---

## 3. Polimento e QA (Etapa 5)
- Responsividade: sidebar colapsada 768–1024px; nada quebra < 768px.
- Acessibilidade: trap de foco + Esc + `aria-modal` nos modais, ordem de foco da sidebar, `aria-current`.
- Conferir os 3 estados (loading/erro/vazio) em todas as telas.
- Testar os 3 cenários de bloqueio de exclusão (Questão com resposta, Tópico com questão, Conteúdo com tópico e/ou questão) + bloqueio RN16 de troca de pai.
- Pendências da spec revisadas conforme decisões da Etapa 0 (implementadas como decidido).

## 4. Verificação
- Backend: `php artisan migrate:fresh --seed` + `php artisan test` (suíte existente) + `php artisan route:list` para conferir rotas novas.
- Frontend: `npm run build` (tsc + vite) e `npm run lint` (oxlint).
- E2E manual via browser: login admin (`admin@basematematica.com.br` / `admin123`), fluxo completo — criar/editar conteúdo e tópico, bloqueios de exclusão, listagem de questões com filtros/busca/paginação, navegação para cadastro/edição existente, visão geral refletindo os dados.

## Ordem de execução
Etapa 1 (fundação: tokens, layout, componentes, rotas) → Etapa 2 (backend contents/topics + tela + 2 modais) → Etapa 3 (backend questions + listagem) → Etapa 4 (overview + tela) → Etapa 5 (QA + migração final do cadastro ao novo shell) — commits por etapa.