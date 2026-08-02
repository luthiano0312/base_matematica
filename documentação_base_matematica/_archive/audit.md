# Auditoria do Frontend — Base Matemática (Ceará Científico)

**Data:** 31/07/2026
**Escopo:** `frontend/src` (React + TypeScript)
**Referência normativa:** `guia-boas-praticas-react.md` (Parte 1 — itens 1 a 9)

> Este documento é o resultado da auditoria do frontend antes da refatoração. Todas as ocorrências abaixo foram verificadas contra o código real (linhas citadas). Números de linha referem-se ao estado do repositório no momento da auditoria (31/07/2026).

---

## 7. Resultado da refatoração (02/08/2026)

**Decisões fechadas:** A1 (refatoração completa) + B1 (services com Axios placeholder, **axios instalado**). C (testes) foi **revisto**: o usuário decidiu **pular testes de frontend** (não há infra; os testes existentes são de backend/PHPUnit) e refatorar direto.

### Fases concluídas

**Fase 1 — Fundação**
- Alias `@/*` em `tsconfig.app.json` (paths **sem `baseUrl`**, pois TS6 deprecia `baseUrl` — corrigido erro TS5101) + `resolve.alias` no `vite.config.ts`.
- `src/App.css` removido (B2); rota duplicada `/onboarding` corrigida (B1); `React.FC`/imports `React` desnecessários removidos (19 ocorrências).
- Normalizado: TABs do Hero (item 3), aspas simples em OnboardingChecklistPage/OnboardingProgress, "começe"→"comece" (B3), `alert()` extraído para handlers nomeados (B4).
- Inline styles removidos (Hero/FinalCTA/Header/TargetAudience); token `--color-blue-primary-dark: #1b7ae6` criado.
- `key={index}` → `key={card.title}` etc. (item 7); arrays estáticos movidos para fora do componente (item 8).
- `src/vite-env.d.ts` criado (faltava — tipa `import.meta.env`).

**Fase 2 — `shared/components`**
| Componente | Uso | Observação |
|---|---|---|
| `Button` | Hero, FinalCTA, Header (login + menu mobile), App (placeholder), LoginPage, CadastroPage | variants `primary\|green\|outline`, sizes `md\|lg\|xl`, `block`, `to` (vira `<Link>`) + `onClick` |
| `TextField` | LoginPage (light), CadastroPage (dark), FiltroQuestoesPage (quantidade) | variant `light\|dark`, erro inline + ícone, `trailing` |
| `PasswordInput` | LoginPage, CadastroPage | toggle Eye/EyeOff encapsulado |
| `SelectField` | FiltroQuestoesPage (conteúdo/tópico/dificuldade) | estilo dark, hint/erro, chevron |
| `ToggleListItem` | OnboardingChecklistPage (green), FiltroQuestoesPage (tipos, blue) | checkbox + label |
| `StatCard` | QuestaoPage (respondidas/acertos/erros) | tones blue/green/red |
| `ProgressBar` | QuestaoPage | `now/min/max` + ARIA |
| `Chip` | QuestaoPage (streak) | tone green, ícone opcional |
| `IconButton` | DashboardPage (perfil/menu) | `aria-label` obrigatório |

- `.btn-primary`/`.btn-outline`/`.btn-primary--lg/--xl` removidos do `index.css` (substituídos por `Button.css`); `.login-submit`/`.cadastro-submit` e todo o vocabulário `.form-*`/`.input-*` das pages removidos.
- Bug corrigido de quebra: no `CadastroPage.css` os seletores `.form-input::placeholder`/`.form-input:focus` apontavam para a classe errada (nunca aplicavam no dark) — corrigido no `TextField` dark.

**Fase 3 — `shared/utils`, `shared/hooks`, `shared/types`, `shared/constants`**
- `cx()` (helper de className, aceita falsy incl. bigint).
- `validators.ts`: `EMAIL_RE`, `SENHA_MIN_LEN`, `verificarRequisitosSenha()` (RNF08).
- `types/questao.ts`: `Conteudo`/`Topico`/`TipoQuestao` (removida duplicação entre Filtro e Onboarding).
- `constants/questao.ts`: `TIPOS_QUESTAO`, `DIFICULDADES`.
- `hooks/useDrawer.ts`: usado no Header (menu mobile).

**Fase 4 — `features/`**
- `app/App.tsx`; `features/{home,auth,onboarding,dashboard,questoes}/`.
- `OnboardingProgress` → `features/onboarding/components/`.
- Importações cruzadas migradas para o alias `@/` (ex.: `@/shared/...`, `@/assets/...`).
- Pastas vazias resquício (`src/components/{cadastro,filtro,login,questao}`, `src/pages`) removidas.
- Assets de template mortos removidos: `hero.png`, `react.svg`, `vite.svg` (sem referência em src/index.html).

**Fase 5 — `services/`** (Axios placeholder, sem React Query)
- `http.ts`: instância Axios (`VITE_API_BASE_URL` ?? `/api`), interceptor que injeta `Bearer` do `localStorage`, `setAuthToken()`.
- `authService.ts` (register/login/logout/me/password), `questionService.ts` (filtros, públicos, recomendadas, respostas), `dashboardService.ts` (dashboard/interests/onboarding). Formas tipadas a partir do backend real (`backend/routes/api.php`, resources e controllers).
- `types.ts` (User, Question, Dashboard, etc.).

### Trade-offs pragmáticos (decisões conscientes)

| Item | Decisão | Motivo |
|---|---|---|
| `q-alt-card` (QuestaoPage) | **não** virou `ToggleListItem` | badge de letra + fonte math + indicador à direita — estruturalmente distinto; forçá-lo no componente exigiria sobrescrever quase todo o CSS |
| `dash-perf-stat`/`dash-shortcut`/streak/pontos (Dashboard) | locais | grid com divisores e tamanhos próprios; apenas 2 instâncias cada |
| `InfoCard` + `CardGrid` | **não** criados | só 2 instâncias no Dashboard; criaria abstração prematura |
| CTAs de tela única (`ob-welcome-cta`, `ob-check-cta/back/skip`, `filtro-btn-continuar/limpar`, `q-responder-btn`) | locais | forçar 4+ variantes no `Button` pioraria a API do componente |

### Itens do guia ainda abertos (conscientemente)
- **B9** — validação do CadastroPage (erro inline/on-blur, "senhas não coincidem", banner de rede) não implementada: gap de produto, aguarda decisão.
- **B5** — links "Termos de Uso"/"Política" apontam para `/cadastro` (placeholder morto): não alterado (decisão de produto).
- **B7** — `/questao/:id` sem `useParams` (MOCK): resolve junto da integração da API.
- **B10** — KaTeX: fora do escopo (RNF04).
- Pages seguem com dados MOCK/estado vazio — a integração com `services/` será a próxima etapa (proxy no vite + `VITE_API_BASE_URL`).

---



## 1. Contexto e método

### 1.1 Stack e estado atual

| Item | Situação |
|---|---|
| Framework | React 19.2 + react-router-dom 7.18 + lucide-react 1.25 |
| Linguagem | TypeScript ~6.0 (strict via `tsc -b`), JSX `react-jsx` |
| Build | Vite 8.1 |
| Lint | oxlint (passa sem erros no baseline) |
| Testes | **Nenhum** (sem vitest/jest/testing-library) |
| Aliases de import | **Não configurados** (nem no `tsconfig.app.json`, nem no `vite.config.ts`) |
| Services/Hooks/Utils | **Inexistentes** — nenhum `src/services/`, `src/hooks/`, `src/utils/` |
| Chamadas de API reais | **Nenhuma** — tudo MOCK (`MOCK_USER`, `MOCK_QUESTAO`) ou estado vazio |

### 1.2 Arquivos auditados

20 arquivos `.tsx` (19 usam `React.FC`) + 20 arquivos `.css`:

- `src/main.tsx`, `src/App.tsx`
- `src/pages/`: HomePage, LoginPage, CadastroPage, OnboardingWelcomePage, OnboardingChecklistPage, DashboardPage, FiltroQuestoesPage, QuestaoPage
- `src/components/home/`: Header, Hero, ProjectObjective, ProblemSection, SolutionSection, HowItWorks, TargetAudience, FinalCTA, Footer
- `src/components/onboarding/`: OnboardingProgress
- Pastas vazias `src/components/{cadastro,filtro,login,questao}` (resquício de refatoração planejada, nunca concluída)

### 1.3 Baseline

- `npm run lint` → passa.
- `npm run build` → passa (tsc + vite, ~0.6s, bundle ~283 kB).
- Nenhuma chamada a API/Axios/localStorage existe hoje — toda a camada de dados é interna aos componentes.

---

## 2. Diagnóstico por item do guia

### Item 1 — Componentes com responsabilidade única

Componentes que acumulam várias responsabilidades (estado + validação + busca + render de seções múltiplas):

| Componente | Arquivo | O que combina |
|---|---|---|
| DashboardPage | `pages/DashboardPage.tsx` (229 l.) | Header + saudação + 2 StatCards (streak/pontos) + lista de atalhos + cálculo SVG donut + 3 StatCards de desempenho + estado vazio. |
| CadastroPage | `pages/CadastroPage.tsx` (177 l.) | 7 estados + checklist live de senha + 4 campos + aceite de termos. Sem validação on-blur. |
| LoginPage | `pages/LoginPage.tsx` (148 l.) | 5 estados + validação on-blur + 2 TextFields + PasswordInput + link "esqueci". |
| FiltroQuestoesPage | `pages/FiltroQuestoesPage.tsx` (214 l.) | 6 estados + `useMemo` + handlers + 3 selects condicionais + toggle de tipos + ações. |
| Header | `components/home/Header.tsx` (102 l.) | Estado de drawer + handlers + NavDesktop + NavMobile duplicados. |
| OnboardingChecklistPage | `pages/OnboardingChecklistPage.tsx` (113 l.) | Estado Set + container card + lista + 2 ações secundárias. |
| OnboardingWelcomePage | `pages/OnboardingWelcomePage.tsx` (82 l.) | Container card + 2 features hardcoded + exemplos + CTA. |

### Item 2 — Estrutura de pastas

- Estrutura atual: `pages/` (8 páginas), `components/home` (9), `components/onboarding` (1), 4 pastas vazias.
- **Não existe** `features/`, `shared/`, `services/`, `hooks/`, `utils/`, `layouts/`, `routes/`.
- Componentes de uma feature específica (ex.: `OnboardingProgress`) estão dentro de `components/`, mas a feature `onboarding` tem 2 páginas em `pages/` e 1 componente em `components/` — lógica da mesma feature espalhada.
- **Proposta:** migrar para `features/<nome>/{components,hooks,services}` + `shared/components` (apenas o que é usado por 2+ features) + `utils/` + `routes/`.

### Item 3 — Nomenclatura de arquivos

- Componentes em PascalCase: **OK** (consistente em todos os arquivos).
- Services/utils/hooks em camelCase: **N/A** — não existem; lógica inline em tudo.
- Inconsistências menores:
  - Aspas simples em `className`: `OnboardingChecklistPage.tsx:43`, `OnboardingProgress.tsx:22`.
  - Indentação por TAB em `components/home/Hero.tsx` (linhas 7–35); restante usa 2 espaços.
  - Classe CSS `graphic-badge-Enem` com maiúscula no meio (`TargetAudience.tsx:39`, `.css:105`).
  - Import `logoDark` em `Header.tsx:3` usa `../../assets/...` (duplo `..` correto por estar em `components/home/`, mas há mistura de aspas e `;` no fim — padrão inconsistente).
  - `main.tsx:4` importa `./App.tsx` com extensão; `App.tsx` importa páginas sem extensão.
  - Assets com `_` (underscore): `logo_light.svg`, `logo_dark.svg`.

### Item 4 — Dados via props (sem busca interna)

- `MOCK_USER` hardcoded dentro de `pages/DashboardPage.tsx:16–25`.
- `MOCK_QUESTAO` hardcoded dentro de `pages/QuestaoPage.tsx:22–38`.
- `FiltroQuestoesPage.tsx:25–26` — `useState<Conteudo[]>([])` e `useState<Topico[]>([])` **vazios e sem dispatcher** (`setConteudos`/`setTopicos` jamais usados): os dados deveriam vir de API (props/query), não de estado morto.
- Nenhum componente lê localStorage hoje, mas o padrão de dados internos (MOCK) precisa ser corrigido quando a API chegar.

### Item 5 — Duplicação de JSX (14 padrões)

| # | Onde | Padrão duplicado |
|---|---|---|
| D1 | `LoginPage.tsx` 75–96 e 98–129; `CadastroPage.tsx` 61–73, 75–87, 89–125, 127–149 | Bloco `form-group` (label + input + erro inline) — 6 ocorrências no total |
| D2 | `LoginPage.tsx:114–121`, `CadastroPage.tsx:102–109` e 140–147 | Toggle "olho" Eye/EyeOff — 3 ocorrências idênticas |
| D3 | `OnboardingWelcomePage.tsx:35–45` e 47–57 | Dois `<article className="ob-feature">` quase idênticos |
| D4 | `OnboardingChecklistPage.tsx:60–78`, `FiltroQuestoesPage.tsx:167–185` | Botão-toggle com checkbox visual + label |
| D5 | `OnboardingChecklistPage.tsx:70–72`, `QuestaoPage.tsx:108–110` | SVG de check `<path d="M2 6L5 9L10 3"/>` idêntico |
| D6 | `DashboardPage.tsx:98–111 e 113–127` (atalhos), 187–204 (stats 3x) | Bloco atalho (ícone+texto+chevron); bloco stat (número+label) |
| D7 | `FiltroQuestoesPage.tsx:74–93, 96–118, 121–138` | 3 blocos `filtro-field` para selects — só mudam options/handler |
| D8 | `Header.tsx:22–28` (desktop) vs 68–87 (mobile) | Nav com os mesmos 5 links + ícones |
| D9 | `ProjectObjective.tsx` / `ProblemSection.tsx` / `HowItWorks.tsx` | 3 seções "header + grid de cards ícone+title+desc" |
| D10 | `SolutionSection.tsx:19–48` (3 features) e 67–84 (4 opções) | Features com check-badge; mockup de opções de questão |
| D11 | `TargetAudience.tsx:19–28` (3 pills), `Footer.tsx:11–44` (4 colunas) | Pills e colunas hardcoded em vez de map |
| D12 | `OnboardingWelcomePage.css` ↔ `OnboardingChecklistPage.css` | `.ob-background/.ob-welcome/.ob-welcome-card` ≈ `.ob-background/.ob-check/.ob-check-card` |
| D13 | `DashboardPage.css` (91–228) | `.dash-streak` ≈ `.dash-points` — mesma estrutura de card |
| D14 | `LoginPage.css` ↔ `CadastroPage.css` | Vocabulário `.form-group/.input-wrapper/.input-action` clonado, com divergência claro/escuro |

### Item 6 — Componentes de UI reutilizáveis e configuráveis

Há **9 candidatos** a componente `shared/` cobrindo praticamente toda a duplicação de CSS/JSX:

| Candidato | Substitui | Evidência |
|---|---|---|
| `<Button variant>` | `btn-primary`, `btn-outline`, `login-submit`, `cadastro-submit` (verde), `ob-welcome-cta`, `ob-check-cta`, `ob-check-back`, `filtro-btn-continuar` (verde), `filtro-btn-limpar`, `q-responder-btn` | 9 variantes de "botão cheio arredondado" divergentes em altura/padding/borderRadius/cor |
| `<IconButton aria-label>` | `dash-icon-btn`, `menu-toggle`, `input-action` | Botão circular só-ícone |
| `<TextField variant="light\|dark" error>` | `.form-group/.form-label/.form-input` (login), `.form-label-cadastro/.form-input-cadastro` (cadastro) | 2 conjuntos duplicados, claro vs escuro |
| `<SelectField>` | 3 `.filtro-field` + `.filtro-select-wrapper/.filtro-select/.filtro-select-icon` | D7 |
| `<PasswordInput>` | `.input-wrapper` + toggle Eye/EyeOff | D2 |
| `<StatCard variant>` | `q-stat--respondidas/acertos/erros` (QuestaoPage 67–80), `dash-perf-stat--navy/green/red` (Dashboard 187–204) | D6 |
| `<ToggleListItem selected>` | `ob-check-item`, `filtro-tipo-btn`, `q-alt-card` | D4 |
| `<InfoCard variant>` + `<CardGrid items>` | `objective-card`, `problem-card`, `how-card` | D9 |
| `<ProgressBar>` | `ob-progress-track/fill` (CSS width), `q-progress-track/fill` (CSS width), donut SVG do Dashboard | 3 implementações diferentes de barra |

**Cores hardcoded que devem virar tokens:**
- `index.css:95` — `#1b7ae6` no `:hover` da `.btn-primary` (não é token).
- `DashboardPage.tsx:150` — `rgba(6,29,68,0.08)` inline.
- `DashboardPage.tsx:159` — `#26E874` (já existe token `--color-green-vibrant`).
- `DashboardPage.tsx:171` — `#F44336`, **diverge** do token `--color-error` `#f13a3a` definido em `Convencoes_UI.md`.

### Item 7 — `key` por índice (violações)

| Arquivo | Linha | Código |
|---|---|---|
| `components/home/HowItWorks.tsx` | 41 | `key={index}` |
| `components/home/ProblemSection.tsx` | 37 | `key={idx}` |
| `components/home/ProjectObjective.tsx` | 42 | `key={index}` |

> As listas são estáticas hoje, mas o padrão viola o guia e, se virarem dados dinâmicos (API), causará bugs sutis. Correção barata: usar `key={card.title}` etc.

**Usos corretos** (para referência): `OnboardingWelcomePage:61` (`e.rotulo`), `CadastroPage:113` (`req.id`), `OnboardingChecklistPage:61` (`c.id`), `FiltroQuestoesPage:87/110/131/167` (`c.id`/`t.id`/`d`/`tipo.id`), `QuestaoPage:96` (`alt.letra`).

### Item 8 — Lógica pesada dentro do JSX

| Arquivo | Linhas | Problema |
|---|---|---|
| `pages/DashboardPage.tsx` | 162, 174, 175 | `2 * Math.PI * 70` recalculado 4x inline nos atributos SVG (`strokeDasharray`/`strokeDashoffset`) — deveria ser constante `CIRCUNFERENCIA = 2 * Math.PI * 70` + `useMemo` ou componente `<Donut>` |
| `pages/FiltroQuestoesPage.tsx` | 147, 152, 153, 155 | `quantidadeObrigatoria && !quantidadeQuestoes.trim()` repetido 4x — deveria virar `const quantidadeInvalida = ...` |
| `pages/CadastroPage.tsx` | 28–32 | Array `requisitos` reconstruído a cada render dentro do componente |
| `components/home/ProjectObjective.tsx` | 6–27 | Array `cards` declarado dentro do corpo do componente (reconstruído a cada render) |
| `components/home/ProblemSection.tsx` | 6–22 | Array `problems` idem |
| `components/home/HowItWorks.tsx` | 6–27 | Array `features` idem |

**Inline styles virando lógica de estilo:**
- `App.tsx:14–16` (PlaceholderPage), `Hero.tsx:29`, `FinalCTA.tsx:19`, `Header.tsx:90/91/93`, `TargetAudience.tsx:40/43`.

**Template-strings de `className` condicional** (recorrente; candidato a helper `cx()`/`clsx`): `LoginPage.tsx:81,105`, `OnboardingChecklistPage.tsx:64`, `QuestaoPage.tsx:98,102,106`, `FiltroQuestoesPage.tsx:101,147,173`.

### Item 9 — Services e data fetching

- **Não existe camada de `services/`.** Nenhuma chamada a API/Axios/fetch existe hoje; os dados são MOCK internos (`DashboardPage:16–25`, `QuestaoPage:22–38`) ou estado vazio (`FiltroQuestoesPage:25–26`).
- **Duplicação de tipos:** `type Conteudo` é redefinido em `FiltroQuestoesPage.tsx:6` e `OnboardingChecklistPage.tsx:7–10` (mesmo shape) — deveria estar num `types`/`models` compartilhado.
- Regex `EMAIL_RE` em `LoginPage.tsx:10` — deveria estar em `utils/validation`.
- Regras de negócio (RN04/RN17/RF12) ainda não estão codificadas no frontend (dependem do backend) — ver seção 6.
- **Recomendação:** criar `services/` com instância Axios + funções tipadas placeholder antes de integrar o backend. Decisão sobre React Query/SWR pendente (seção 4).

---

## 3. Bugs e problemas adicionais (fora dos itens 1–9)

| # | Problema | Localização |
|---|---|---|
| B1 | **Rota duplicada `/onboarding`** — a `PlaceholderPage` (linha 29) é sobrescrita por `OnboardingWelcomePage` (linha 30). Código morto em produção + confusão para o fluxo RN19. | `App.tsx:29–30` |
| B2 | `App.css` (184 linhas) é resquício do template Vite: **não é importado em nenhum lugar** (verificado via grep) e usa vars inexistentes (`--accent`, `--text-h`, etc.). | `src/App.css` |
| B3 | Erro ortográfico "começe" em produção. | `Hero.tsx:30` |
| B4 | `alert()` em produção nos links de Termos/Política. | `Footer.tsx:41–42` |
| B5 | `<a href="/cadastro">` nos links "Termos de Uso" e "Política de Privacidade" apontam para a própria página de cadastro (placeholder morto). | `CadastroPage.tsx:158–159` |
| B6 | `onClick` vazio com comentário em atalho "Materiais de estudo". | `DashboardPage.tsx:116` |
| B7 | Rota `/questao/:id` definida mas `QuestaoPage` não usa `useParams` — o `:id` é ignorado. | `App.tsx:34`, `QuestaoPage.tsx` |
| B8 | Tipo `passo: 1 \| 2` em `OnboardingProgress.tsx:5` acopla o componente a exatamente 2 etapas. | `OnboardingProgress.tsx:5` |
| B9 | `Convencoes_UI.md` (3.2/3.3/3.4/3.6) **não implementadas** em `CadastroPage`: sem validação inline/on-blur, sem mensagem "e-mail já cadastrado", sem "as senhas não coincidem", sem banner de erro de rede. Gap de produto (LoginPage já implementa). | `CadastroPage.tsx` |
| B10 | KaTeX (RNF04/Identidade Visual) **não é dependência** do `package.json`; fórmulas usam texto plano (`SolutionSection.tsx:63–65`, enunciado de `QuestaoPage`). Gap funcional, fora do escopo desta refatoração. | `package.json`, `SolutionSection.tsx:63–65` |

---

## 4. Decisões de trade-off (contexto e opções)

> Equipe de **2 desenvolvedores**, prazo apertado (férias de julho encerrando). Abaixo o contexto e as opções de cada decisão. **Decisões finais em [seção 7](#7-resultado-da-refatoração-02082026): A1 + B1 (com axios instalado); C revisado para pular testes de frontend.**

### A. Profundidade da refatoração

- **Contexto:** auditoria revelou ~9 componentes de UI reutilizáveis ausentes, ausência total de services/hooks, nenhuma cobertura de testes e estrutura de pastas genérica.
- **A1 — Refatoração completa:** reestruturar em `features/`, extrair `shared/`, isolar `services/`/`hooks/`, criar aliases `@/`, corrigir bugs visíveis (B1–B8). Mantém RN/RF/UX intactas. Maior volume de mudança, facilita manutenção futura. *(Recomendado — ESCOLHIDO)*
- **A2 — Apenas camada `shared/` + aliases:** criar `shared/` (Button/TextField/StatCard etc.) e configurar `@/`. Deixa `features/` para depois. Menor risco.
- **A3 — Apenas extração de duplicação:** extrair só os blocos óbvios (form-group, toggle-item, stat-card) sem reestruturar pastas. Mínimo de mudança.

### B. Stack de data fetching

- **Contexto:** item 9 do guia sugere React Query/SWR para cache/loading/race conditions. Hoje **não há nenhuma chamada API real** (tudo MOCK).
- **B1 — Não adicionar ainda:** criar `services/` com instância Axios + funções tipadas placeholder; sem dependência extra. *(Recomendado — ESCOLHIDO; axios foi instalado em 02/08)*
- **B2 — Adicionar `@tanstack/react-query` agora:** provider + hooks desde já; poupa refatoração futura, mas adiciona dependência ociosa até o backend integrar.
- **B3 — Adicionar `SWR`:** alternativa mais leve ao React Query, mesmo princípio.

### C. Cobertura de testes — **REVISTO (02/08/2026)**

- **Contexto:** não há testes (sem vitest/jest/testing-library). Refatoração sem testes aumenta risco de regressão.
- **Decisão inicial (31/07):** criar a infra de testes (Vitest + Testing Library) **antes** da refatoração.
- **Decisão final (02/08):** **pular testes de frontend** e refatorar — usuário considerou a "infra de testes" já pronta (backend/PHPUnit) e não viu valor em testar o frontend MOCK; decisão registrada aqui para não ser redescoberta depois.

---

## 5. Ordem de execução proposta (pós-infra de testes)

1. **Fase 1 — Fundação:** aliases `@/` (`tsconfig.app.json` + `vite.config.ts`); remover `App.css` (B2); corrigir rota duplicada (B1); remover `React.FC`/imports de `React` desnecessários; normalizar TAB/aspas simples (item 3); corrigir "começe" (B3) e `alert()` (B4).
2. **Fase 2 — `shared/`:** extrair Button, IconButton, TextField, SelectField, PasswordInput, StatCard, ToggleListItem, InfoCard+CardGrid, ProgressBar, Chip. Migrar gradualmente (1 página por commit). Cobrir os 3 `key={index}` (item 7).
3. **Fase 3 — `utils/` e `hooks/`:** `cx()`, validadores (`EMAIL_RE`, regra RNF08), constantes (cores, dificuldades, tipos de questão), tipos compartilhados (`Conteudo`/`Topico`/`TipoQuestao`), `useDrawer`, hooks de validação on-blur.
4. **Fase 4 — `features/`:** mover `pages/` + `components/*` para `features/{home,auth,onboarding,dashboard,questoes}/`; MOCKs para `services` da feature.
5. **Fase 5 — `services/`:** instância Axios + funções tipadas stubs (`authService`, `questionService`, `dashboardService`). Sem React Query/SWR (decisão B pendente).
6. **Validação a cada fase:** `npm run lint` + `npm run build` + testes smoke.

---

## 6. Regras de negócio e requisitos a **preservar** (comportamento visível)

> A refatoração é estrutural. Estas regras não podem mudar ao mover código:

- **RN04** — Visitante: lote fixo de 6 questões por tópico (2 fáceis, 2 médias, 2 difíceis) + fallback por insuficiência (nunca completar a diferença com outros níveis); sem vídeo; contadores apenas em estado local/sessão; redirecionamento pós-resposta. No frontend atual: `FiltroQuestoesPage.tsx` condicional `isVisitante` (não exibir Dificuldade/Quantidade — linhas 121, 141) e `App.tsx:32` (`isVisitante` no path `/questoes`).
- **RN07** — Pontuação fixa fácil=10, médio=15, difícil=20 (não está no frontend; será backend — não introduzir constantes que possam conflitar).
- **RN17** — Modo "Progressão": base = N÷3 (arredondado para baixo), resto distribuído fácil→médio→difícil; campo "Quantidade de questões" obrigatório. No frontend: `FiltroQuestoesPage.tsx:41–43` (`progressaoAtiva`, `quantidadeObrigatoria`, `continuarDesabilitado`).
- **RN19** — Proteção de acesso ao Onboarding (sem sessão → Home; sessão com onboarding completo → Dashboard; sem botão "Voltar"). Ainda não implementada, mas a rota duplicada (B1) deve ser resolvida de forma compatível.
- **RF12** — Fallback em cascata de filtros (interesse sorteado → mais acertos → aleatório). Não implementada ainda; a extração de `useFiltroQuestoes` deve preservar o estado vazio atual.
- **RNF08** — Senha: mínimo 8 caracteres, 1 número, 1 maiúscula + confirmação. No frontend: checklist live em `CadastroPage.tsx:24–32` — manter idêntico após extração para `<PasswordStrengthChecklist>`.
- **Fluxos (Fluxo_de_Navegacao):** Cadastro→Onboarding→Dashboard; Login→Dashboard; Home→Questões (visitante). Botões/links que navegam não podem mudar de destino.
