# Plano de Implementação — Painel Admin
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Plano de Implementação
**Última atualização:** 17/08/2026

> Cobre a ordem de construção das telas especificadas em [[Spec_Admin_Design_Tokens_e_Sidebar]], [[Spec_Admin_Visao_Geral]], [[Spec_Admin_Questoes_Listagem]], [[Spec_Admin_Conteudos_Topicos]], [[Spec_Modal_Confirmacao_Exclusao]] e [[Spec_Modal_Conteudo_Topico]]. Time de referência: 2 desenvolvedores (ver [[Arquitetura#2. Equipe]]), Laravel + React ([[Arquitetura#4. Stack Tecnológica]]).

---

## 1. Por que essa ordem (lógica de dependência)

A ordem não é arbitrária — cada etapa deixa pronto algo que a próxima reaproveita, evitando retrabalho:

```
Etapa 0: Pré-requisitos
   ↓
Etapa 1: Fundação compartilhada (layout + componentes genéricos)
   ↓
Etapa 2: Conteúdos & Tópicos ──────┐  (entidade mais simples, e os 2 modais
   ↓                                │   compartilhados nascem aqui)
Etapa 3: Questões — Listagem  ←─────┘  (reaproveita filtro de Conteúdo/Tópico
   ↓                                    da Etapa 2 + Modal de exclusão da Etapa 2)
Etapa 4: Visão Geral ───────────────────  (agrega dados das duas entidades
   ↓                                       anteriores — por isso vem por último)
Etapa 5: Polimento e QA
```

**Por que Conteúdos & Tópicos antes de Questões**, mesmo Questões sendo o pedido original do time: a listagem de Questões depende dos endpoints de Conteúdo/Tópico para popular os selects de filtro (ver [[Spec_Admin_Questoes_Listagem#Bloco de filtros]]), e o Modal de Confirmação de Exclusão — usado nas duas telas — é mais simples de validar primeiro num CRUD pequeno (Conteúdo/Tópico) do que direto numa entidade com regra de bloqueio mais complexa (Questão depende de `answered_questions`).

**Por que Visão Geral por último**, apesar de ser a rota padrão do painel: ela só faz sentido com dado real — sem Conteúdos/Tópicos/Questões cadastrados, os cards e a lista de atividade recente não têm nada de interessante para mostrar durante o desenvolvimento. Construir por último também significa que, quando ela for feita, já existe dado de teste real gerado pelas telas anteriores.

---

## 0. Pré-requisitos (antes de tocar em código)

Itens que, se pulados, vão gerar retrabalho no meio das etapas seguintes:

- [ ] **Confirmar que a autenticação de admin (guard `admins`, RN20) já está funcional** — login, middleware de rota protegida. Se ainda não estiver, é bloqueador de tudo abaixo.
- [ ] **Decidir as 2 pendências abertas** em [[Spec_Modal_Conteudo_Topico#Pendências identificadas neste componente]] (nome duplicado de Conteúdo/Tópico; troca de Conteúdo pai de um Tópico que já tem questões vinculadas). Não precisa ser uma decisão elaborada — só evitar descobrir isso no meio da Etapa 2.
- [ ] **Confirmar as rotas exatas do cadastro/edição de Questão já implementados** (pendência 1 de [[Spec_Admin_Questoes_Listagem#Pendências identificadas nesta tela]]) — a Etapa 3 precisa linkar pra elas, então o path exato (`/admin/questoes/nova`, `/admin/questoes/:id/editar` ou o que já existir) precisa estar confirmado antes de começar a Etapa 3.
- [ ] **Ter alguns dados de teste** (seeders) para pelo menos 3–4 Conteúdos, alguns Tópicos, e algumas Questões com e sem `answered_questions` vinculada — necessário pra testar os estados de bloqueio de exclusão desde a Etapa 2.

---

## Etapa 1 — Fundação compartilhada

**Objetivo:** ter a casca do painel navegável, com os componentes genéricos que todas as telas seguintes vão reaproveitar — construir isso separado evita reimplementar modal/skeleton/badge três vezes.

### Backend
- Nenhum endpoint novo nesta etapa — só confirmar que o middleware de rota do guard `admins` está aplicado ao grupo de rotas `/admin/*`.

### Frontend
- [ ] Arquivo de tokens (cores, tipografia, espaçamento) conforme [[Spec_Admin_Design_Tokens_e_Sidebar#2. Paleta de cores]] a [[Spec_Admin_Design_Tokens_e_Sidebar#4. Espaçamento e forma]] — variáveis CSS ou tema do styling escolhido.
- [ ] Componente **Sidebar** ([[Spec_Admin_Design_Tokens_e_Sidebar#5. Componente: Sidebar de navegação]]), com os 3 itens de rota (ainda que apontando pra páginas vazias/placeholder).
- [ ] Layout shell (sidebar + área de conteúdo) aplicado às 3 rotas.
- [ ] Componentes genéricos reutilizáveis:
  - **Modal base** (overlay + container + fechamento por Esc/clique fora) — sem o conteúdo específico ainda, só a casca que [[Spec_Modal_Confirmacao_Exclusao]] e [[Spec_Modal_Conteudo_Topico]] vão preencher.
  - **Toast** de sucesso/erro (usado em ambos os modais e nas listagens).
  - **Skeleton** genérico (retângulo pulsante) — reaproveitado em todas as telas para loading.
  - **Badge** (pill colorido, usado nas dificuldades de Questão).
  - **Botão** primário/secundário/destrutivo com estado de loading.

**Entregável verificável:** dá pra logar como admin, ver a sidebar, navegar entre "Visão geral" / "Questões" / "Conteúdos e tópicos" (mesmo vazias), sem quebra visual.

---

## Etapa 2 — Conteúdos & Tópicos (CRUD completo)

**Objetivo:** primeira tela funcional de ponta a ponta — valida o padrão de modal + exclusão bloqueada antes de replicar isso em Questões.

### Backend
- [ ] `GET /admin/contents` — lista Conteúdos com Tópicos aninhados e contagens (`withCount`), conforme [[Spec_Admin_Conteudos_Topicos#Lista de cards de Conteúdo]].
- [ ] `POST /admin/contents`, `PUT /admin/contents/:id` — criar/editar (campo `name`).
- [ ] `GET /admin/contents/:id/can-delete` — verificação de dependência (tópicos ou questões vinculadas), conforme [[Spec_Modal_Confirmacao_Exclusao#3. Regras de bloqueio por entidade]].
- [ ] `DELETE /admin/contents/:id`.
- [ ] `POST /admin/topics`, `PUT /admin/topics/:id` — criar/editar (campos `name` + `content_id`).
- [ ] `GET /admin/topics/:id/can-delete`.
- [ ] `DELETE /admin/topics/:id`.
- [ ] Validar RN16 no backend ao trocar `content_id` de um Tópico (depende da decisão do pré-requisito sobre esse edge case).

### Frontend
- [ ] Tela de listagem em cards aninhados ([[Spec_Admin_Conteudos_Topicos#Cada card de Conteúdo]]), incluindo estado "sem tópicos" e estado "base vazia".
- [ ] **Modal Criar/Editar Conteúdo/Tópico** ([[Spec_Modal_Conteudo_Topico]]) — os dois modos, incluindo o campo Conteúdo travado quando aberto a partir de um card específico.
- [ ] **Modal de Confirmação de Exclusão** ([[Spec_Modal_Confirmacao_Exclusao]]) — primeira aplicação concreta: entidade Conteúdo e entidade Tópico. Esse é o momento de validar o padrão de "verificação síncrona antes de renderizar o estado do modal" (seção 3 daquela spec) — vale testar bem aqui, porque a Etapa 3 só vai plugar uma terceira entidade no mesmo componente.
- [ ] Estados de loading/erro/vazio da tela.

**Entregável verificável:** um admin consegue criar um Conteúdo, criar Tópicos dentro dele, editar ambos, e tentar excluir — vendo tanto o caminho de sucesso quanto o de bloqueio (criar um Tópico, vincular a uma Questão de teste, tentar excluir esse Tópico e ver o bloqueio).

---

## Etapa 3 — Questões — Listagem

**Objetivo:** resolver a pendência original do time (link para as telas de cadastro/edição já existentes) e reaproveitar os dois modais construídos na Etapa 2.

### Backend
- [ ] `GET /admin/questions` — paginado (20/página), com filtros opcionais (`content_id`, `topic_id`, `difficulty`, `type`, `search`), conforme [[Spec_Admin_Questoes_Listagem#Bloco de filtros]].
- [ ] `GET /admin/questions/:id/can-delete` — verifica `answered_questions` vinculada.
- [ ] `DELETE /admin/questions/:id`.
- [ ] Extração de texto puro do `statement` (HTML) para a coluna Enunciado da tabela — decidir se isso é feito no backend (mais barato para o frontend) ou no frontend (mais simples de ajustar sem deploy de API); recomendação: backend, já que é uma transformação de leitura que não muda por cliente.

### Frontend
- [ ] Tela de listagem com os 4 filtros em cascata (Conteúdo → Tópico reaproveita o mesmo endpoint `GET /admin/topics?content_id=` já existente da Etapa 2) + busca com debounce.
- [ ] Tabela com badges de dificuldade (reaproveitando o componente Badge da Etapa 1) e paginação.
- [ ] Botão "Nova questão" e ícone de editar linkando às rotas já implementadas (confirmadas no pré-requisito).
- [ ] Plugar a entidade "Questão" no **Modal de Confirmação de Exclusão** já existente — só é preciso passar a mensagem/contagem específica de `answered_questions`, o componente em si não muda.
- [ ] Estados de loading/erro/vazio (dois tipos: sem resultado de filtro vs. base totalmente vazia).

**Entregável verificável:** a pendência original ("tela de cadastro já implementada, só faltava link") está resolvida — um admin navega de "Questões" até o cadastro/edição existentes através da listagem, e consegue excluir uma questão sem resposta registrada (vendo o bloqueio ao tentar excluir uma que já tem resposta de teste).

---

## Etapa 4 — Visão Geral

**Objetivo:** fechar o painel com a tela padrão, agora com dado real das duas entidades já implementadas.

### Backend
- [ ] `GET /admin/overview` — endpoint agregador único retornando: contagens (`questions`, `topics`, `contents`), contagem de tópicos sem questão vinculada (para o banner), e as N atividades mais recentes (união ordenada de `created_at` entre as 3 tabelas), conforme [[Spec_Admin_Visao_Geral#Campos / Componentes]]. Um único endpoint evita 3+ requisições no carregamento da tela.

### Frontend
- [ ] Grid de 3 cards de métrica.
- [ ] Banner de alerta condicional (só renderiza se a contagem for > 0).
- [ ] Lista "Cadastrado recentemente" com navegação para a edição de cada item.
- [ ] Estados de loading/erro/base vazia.

**Entregável verificável:** painel completo — login cai na Visão Geral, que reflete corretamente o que foi cadastrado nas etapas anteriores.

---

## Etapa 5 — Polimento e QA

Itens transversais que valem uma passada final em todas as telas juntas, em vez de repetir a cada etapa:

- [ ] **Responsividade:** testar as 3 telas + 2 modais em tablet (768–1024px) — sidebar colapsada — conforme decisão de escopo em [[Spec_Admin_Design_Tokens_e_Sidebar#5.5 Responsividade da sidebar]]. Confirmar que nada quebra abaixo de 768px (sem otimizar).
- [ ] **Acessibilidade básica:** ordem de foco na sidebar e nos modais (trap de foco, `Esc`, `aria-modal`), conforme as seções de acessibilidade de cada spec.
- [ ] **Revisão dos textos de erro/vazio** — conferir que toda tela tem os 3 estados (loading, erro, vazio) implementados, não só o caminho feliz.
- [ ] **Teste ponta a ponta dos bloqueios de exclusão** — os 3 cenários de [[Spec_Modal_Confirmacao_Exclusao#3. Regras de bloqueio por entidade]] (Questão com resposta, Tópico com questão, Conteúdo com tópico e/ou questão).
- [ ] **Revisitar as pendências documentadas** ([[Spec_Modal_Conteudo_Topico#Pendências identificadas neste componente]]) — confirmar que a decisão tomada no pré-requisito (Etapa 0) foi mesmo implementada como decidido.

---

## 2. Sugestão de divisão entre os 2 desenvolvedores

Não é obrigatório, mas como backend e frontend de cada etapa são razoavelmente independentes (endpoints com contrato já especificado nas specs), dá para paralelizar:

| Etapa | Dev A (sugestão: backend) | Dev B (sugestão: frontend) |
| --- | --- | --- |
| 1 | Confirma middleware de auth | Constrói tokens, sidebar, componentes genéricos |
| 2 | Endpoints de Content/Topic + can-delete | Tela + modais (pode começar com dado mockado antes do endpoint real ficar pronto, seguindo o contrato das specs) |
| 3 | Endpoint de Questions + can-delete | Tela de listagem + filtros |
| 4 | Endpoint agregador de Overview | Tela final |
| 5 | — | — (QA conjunto) |

Ponto de sincronização recomendado: ao final de cada etapa, os dois validam juntos o "Entregável verificável" antes de passar para a próxima — evita que o frontend avance sobre um contrato de API que mudou sem avisar.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
| --- | --- |
| [[Analise_do_Sistema#^rn20\|RN20]] | Guard/tabela `admins` separada — pré-requisito de toda a Etapa 0 |
| [[Analise_do_Sistema#^rn16\|RN16]] | Validação Conteúdo↔Tópico↔Questão — impacta a Etapa 2 (edição de Tópico) e é reforçada na Etapa 0 |
| [[Analise_do_Sistema#^rn11\|RN11]] | Histórico de tentativas nunca é sobrescrito — base da regra de bloqueio de exclusão de Questão na Etapa 3 |
