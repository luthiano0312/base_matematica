# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

**Ceará Científico** — plataforma educacional social de matemática para jovens do ensino médio. Monorepo com três partes:

- `backend/` — API REST em Laravel 13 (PHP 8.3+), Sanctum, PostgreSQL (Supabase)
- `frontend/` — SPA em React 19 + TypeScript + Vite (Axios, Tiptap, KaTeX, MathLive)
- `documentação_base_matematica/` — vault Obsidian com a documentação de produto (regras de negócio, specs de tela, arquitetura)

O idioma do projeto (código de domínio, comentários, docs, mensagens de erro) é **português**.

## Comandos

### Backend (`cd backend`)

```bash
composer dev                                  # serve + queue + logs (pail) + vite, tudo junto
composer test                                 # limpa config e roda a suíte inteira
php artisan test --filter=AnswerQuestionTest  # um teste/classe específico
php artisan test tests/Unit/ScoringServiceTest.php
vendor/bin/pint                               # formatador (Laravel Pint)
```

**Importante:** os testes usam `RefreshDatabase` contra um **PostgreSQL real de teste no Supabase** (`base_matematica_test`, definido em `.env.testing` / `phpunit.xml`) — não SQLite. Rodar testes exige acesso à rede e ao banco de teste.

### Frontend (`cd frontend`)

```bash
npm run dev     # Vite dev server (proxy /api -> http://127.0.0.1:8000)
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## Arquitetura

### Backend

- **Dois guards de autenticação separados (RN20):** alunos na tabela `users` (guard padrão `web`/Sanctum) e produtores de conteúdo na tabela `admins` (guard `admin`). Rotas em `routes/api.php` se dividem em públicas, `auth:sanctum` (aluno) e `auth:admin` (painel). Não misturar papéis numa tabela única.
- **Lógica de negócio em Services** (`app/Services/`), não nos controllers:
  - `ScoringService` — pontuação por dificuldade (fácil 10 / média 15 / difícil 20); questão já acertada vale 0; acerto após erro vale 5 (`RETRY_POINTS`).
  - `StreakService` — sequência de dias de estudo.
  - `RecommendationService` — recomendação de questões baseada em `user_interests`.
  - `SupabaseStorageService` — **upload de imagens é sempre intermediado pelo backend (RN23)**; nunca direto do browser para o Supabase Storage.
- **Tipos de questão:** múltipla escolha e certo/errado (correção automática via `question_options`) e dissertativa (auto-avaliação do aluno contra a resolução exibida).
- **Endpoints `can-delete`:** antes de excluir questão/conteúdo/tópico, o frontend consulta `/admin/.../can-delete` para verificação síncrona de dependências (ver spec do modal de exclusão).
- Models principais: `User`, `Admin`, `Question`, `QuestionOption`, `Content`, `Topic`, `AnsweredQuestion`, `UserInterest`.

### Frontend

- Organização por **features** (`src/features/`: `auth`, `onboarding`, `home`, `dashboard`, `questoes`, `admin`) com código compartilhado em `src/shared/`. Alias `@` aponta para `src/`.
- **Camada de serviços** (`src/services/`): `http.ts` (aluno) e `adminHttp.ts` (admin) são instâncias Axios separadas, cada uma com seu token Bearer em `localStorage` — os dois perfis têm sessões independentes no client também. `getErrorMessage` extrai mensagem amigável (422 → primeiro erro de validação).
- **Conteúdo rico:** o admin edita com **Tiptap** (+ **MathLive** para fórmulas, que gera LaTeX); o aluno vê o HTML **sanitizado com DOMPurify (RN22)** e fórmulas renderizadas via **KaTeX auto-render**. Ao criar telas que exibem enunciado/resolução/resumo, sempre passar por esse pipeline sanitize → KaTeX.
- **Responsividade mobile-first é requisito** — o público acessa majoritariamente pelo celular.

### Documentação de produto

Comentários no código citam regras de negócio por identificador (`RN20`, `RF01`, ...). A fonte de verdade é `documentação_base_matematica/Analise_do_Sistema.md` (tabela de RN/RF/RNF); specs de tela ficam em `documentação_base_matematica/spec_telas/`. Ao implementar algo que toca regra de negócio, consulte esses documentos. Convenções do vault estão em `Convencoes.md` (nomes de arquivo em snake_case sem acento, wikilinks Obsidian para citar regras).

### Deploy

`backend/Dockerfile` (PHP-FPM + Nginx + Supervisor, configs em `backend/docker/`) é usado para deploy no Render — a porta vem da env `$PORT` em runtime, injetada no `nginx.conf.template` pelo `entrypoint.sh`. CORS configurado em `backend/config/cors.php`.
