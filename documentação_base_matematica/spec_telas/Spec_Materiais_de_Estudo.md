# Spec_Materiais_de_Estudo
**Projeto:** Ceará Científico
**Tipo de documento:** Spec de Tela
**Última atualização:** 23/08/2026

> Spec de handoff para as duas telas do aluno da feature Materiais de Estudo: **Listagem** e **Detalhe do material**. Cobre layout, tokens, estados e casos de borda para implementação. Reaproveita padrões já definidos em [[Identidade_Visual]] e [[Convencoes_UI]] — não repete definições de paleta/tipografia base aqui.

---

## Tela 1 — Listagem de Materiais de Estudo

### Overview

Lista pública (sem login, RN01/RF02) de todos os materiais cadastrados, com filtro por Conteúdo e Tópico. Cada card sinaliza se o material tem artigo, vídeo, ou os dois. Acessível pela Home e pelo Dashboard (ver [[Fluxo_de_Navegacao]]).

### Layout

- Container em fundo lavanda (`#EFEEFF`), largura total da área de conteúdo.
- Breadcrumb no topo (reutilizar padrão de `admin-breadcrumb` já usado em Cadastro de Questões, adaptado para o contexto do aluno).
- Filtro: dois selects lado a lado (Conteúdo, Tópico — dependente do Conteúdo selecionado, mesmo padrão de `topicosDisponiveis` em `CadastroQuestoesPage.tsx`), empilhados em coluna no mobile.
- Grid de cards: 2 colunas no desktop (`grid-template-columns: repeat(2, 1fr)`, gap 14px), 1 coluna no mobile.

### Design Tokens Used

| Token | Valor | Uso |
|---|---|---|
| Lavanda | `#EFEEFF` | Fundo da página |
| Azul escuro | `#061D44` | Título da página, título do card |
| Azul primário | `#258BFC` | Tags de Conteúdo/Tópico no rodapé do card |
| Texto de apoio | `#5F5E5A` (não está na paleta oficial — usar cinza neutro equivalente a "texto secundário") | Subtítulo da página, preview do conteúdo |
| Nunito SemiBold 600 | — | Labels dos selects |
| Nunito Bold 700 | — | Título da página, título do card, badges |
| Nunito Regular 400 | — | Preview do conteúdo (texto de apoio) |

> ⚠️ **Gap identificado:** assim como em [[Convencoes_UI#1. Cor de erro]], a paleta oficial de [[Identidade_Visual]] não define um tom de "texto secundário/cinza". O mockup usa `#5F5E5A` como aproximação — confirmar ou formalizar antes do build final.

### Components

| Componente | Variante | Props | Notas |
|---|---|---|---|
| Select de filtro | Conteúdo | `value`, `onChange`, lista de `contents` | Reaproveitar `getContents()` já existente em `contentService` |
| Select de filtro | Tópico | `value`, `onChange`, lista de `topics` filtrada | Desabilitado/vazio até um Conteúdo ser selecionado, ou mostra todos se "todos" estiver selecionado no Conteúdo |
| Card de material | Padrão | `title`, `contentPreview`, `hasArticle`, `hasVideo`, `contentName`, `topicName?` | Preview do artigo: primeiras ~120 caracteres do texto extraído do HTML (sem tags) |
| Badge "Artigo" | Tag | — | `background: #E6F1FB`, `color: #0C447C` (Azul, stop 800 sobre fundo claro — mesma lógica de contraste texto-sobre-fundo-colorido) |
| Badge "Vídeo aula" | Tag | — | `background: #FAECE7`, `color: #712B13` (Coral, mesmo princípio) |
| Estado vazio | Card tracejado | `message` | Ver seção Edge Cases |

### States and Interactions

| Elemento | Estado | Comportamento |
|---|---|---|
| Card | Hover | Elevação sutil (`border-color` mais escura) ou leve `transform: translateY(-1px)`, sem sombra pesada — consistente com o resto da UI, que não usa `box-shadow` decorativo |
| Card | Click/tap | Navega para a Tela 2 (Detalhe) do material correspondente |
| Select Conteúdo | Change | Reseta a seleção de Tópico se o tópico atual não pertencer ao novo conteúdo (mesmo padrão de `alternarConteudo` em `CadastroQuestoesPage.tsx`) |
| Select Tópico | Disabled | Quando nenhum Conteúdo específico estiver selecionado (opção "todos"), Tópico permanece disponível mas lista todos os tópicos |

### Responsive Behavior

| Breakpoint | Mudanças |
|---|---|
| Desktop (>1024px) | Grid 2 colunas, filtros lado a lado |
| Tablet (768–1024px) | Grid 2 colunas mantido, filtros lado a lado se couberem, senão empilham |
| Mobile (<768px) | Grid 1 coluna, filtros empilhados verticalmente, cards com padding reduzido (12px) |

Responsividade mobile-first é requisito do projeto (RNF01) — o público-alvo acessa majoritariamente pelo celular.

### Edge Cases

- **Lista vazia (nenhum material cadastrado ainda):** mensagem central, sem grid — "Nenhum material de estudo disponível ainda." (tom convidativo, não de erro).
- **Filtro sem resultado:** card único tracejado com "Nenhum material encontrado para este filtro." — como no mockup.
- **Carregando:** skeleton de cards (retângulos cinza-claro pulsantes) no lugar da grid, ou texto simples "Carregando…" (mesmo padrão já usado em `CadastroQuestoesPage.tsx`: `<p className="cq-loading" role="status">Carregando…</p>`).
- **Erro ao carregar a lista:** banner de erro genérico no topo, seguindo exatamente [[Convencoes_UI#3.6 Erro genérico de rede/servidor]] — banner vermelho claro no topo, não inline (não é erro de campo de formulário).
- **Texto de título muito longo:** truncar com `text-overflow: ellipsis` em 2 linhas (`-webkit-line-clamp: 2`).
- **Material só com vídeo (sem artigo):** preview do card mostra algo como "Vídeo aula disponível" no lugar do trecho de texto, já que não há `content` para extrair preview.

### Accessibility Notes

- Grid de cards como lista semântica (`<ul>`/`<li>` ou `role="list"`/`role="listitem"`) para leitores de tela.
- Cada card é focável via teclado (`tabindex="0"` se não for naturalmente um elemento clicável como `<a>`) e ativável com Enter.
- Badges "Artigo"/"Vídeo aula" não dependem só da cor — o texto já é autoexplicativo (consistente com o princípio de acessibilidade de [[Convencoes_UI#2. Onde a mensagem de erro aparece]], que já exige não depender só de cor).
- Selects com `<label>` associado (não apenas placeholder), tamanho mínimo de toque 44px de altura.

---

## Tela 2 — Detalhe do material

### Overview

Exibe o conteúdo de um material específico: artigo (HTML sanitizado + KaTeX, RN21/RN22) e/ou vídeo aula (iframe do YouTube). Acesso público (RN01/RF02), sem necessidade de login.

### Layout

- Container em fundo lavanda (`#EFEEFF`), largura máxima de leitura confortável (~600–680px centralizados no desktop; full-width no mobile).
- Breadcrumb com link de volta para a Listagem (Tela 1).
- Tags de Conteúdo/Tópico acima do título (mesma cor de Azul primário usada nas tags do card da Listagem, para consistência visual).
- Título em Azul escuro, Nunito Bold 700, 22px.
- Bloco de artigo: card branco com padding generoso, texto em Azul escuro sobre fundo branco (16px mínimo, RNF05).
- Bloco de vídeo (se existir): título de seção "Vídeo aula" + player em `aspect-ratio: 16/9`.
- Botão "Voltar para materiais de estudo" ao final, estilo outline consistente com o `Button` variant="outline" já usado no projeto (ver `MathFormulaModal.tsx`).

### Design Tokens Used

| Token | Valor | Uso |
|---|---|---|
| Lavanda | `#EFEEFF` | Fundo da página |
| Azul escuro | `#061D44` | Título, texto do artigo, fundo do placeholder de vídeo |
| Azul primário | `#258BFC` | Tags de Conteúdo/Tópico, ícone de play, botão outline |
| Branco | `#FFFFFF` | Card do artigo |
| Nunito Bold 700 | — | Título da página, "Vídeo aula" (h2) |
| Nunito Regular 400 | — | Corpo do artigo (texto de apoio, tamanho mínimo 16px — RNF05) |
| Latin Modern (via KaTeX) | — | Expressões matemáticas dentro do artigo — tamanho base 18–20px (RNF06) |

### Components

| Componente | Variante | Props | Notas |
|---|---|---|---|
| `StatementRenderer` (já existente) | — | `html` (conteúdo do material) | Reaproveitar o mesmo componente já usado para renderizar `statement`/`text_resolution` de questões — sanitização DOMPurify + KaTeX auto-render (RN21/RN22), sem componente novo |
| Player de vídeo | Iframe | `src` (montado a partir de `video_url` extraindo o video ID) | `<iframe>` com `aspect-ratio: 16/9`, `allowfullscreen` |
| Player de vídeo | Fallback (link) | `href` (URL crua) | Exibido no lugar do iframe quando a extração do video ID falhar — ver Edge Cases |
| Botão voltar | Outline | `onClick` | Reaproveitar variant já existente do `Button` compartilhado |

### States and Interactions

| Elemento | Estado | Comportamento |
|---|---|---|
| Player de vídeo | Padrão | Iframe carregado, sem autoplay |
| Player de vídeo | Fallback | Link "Assistir no YouTube ↗" com ícone de link externo, abre em nova aba (`target="_blank" rel="noopener noreferrer"` — ver nota de segurança abaixo) |
| Botão voltar | Hover | `background: #F7F6FF` ou equivalente, sem sombra |
| Link dentro do artigo (se houver) | — | Deve forçar `rel="noopener noreferrer"` quando `target="_blank"` — mitigação já identificada no audit (item B4) para reverse tabnabbing, aplicar também aqui já que o conteúdo vem do mesmo pipeline HTML |

### Responsive Behavior

| Breakpoint | Mudanças |
|---|---|
| Desktop (>1024px) | Conteúdo centralizado, largura máxima ~680px |
| Tablet (768–1024px) | Largura máxima ~600px, padding lateral 24px |
| Mobile (<768px) | Full-width com padding lateral 16px, título reduz para ~19px se necessário, player mantém `aspect-ratio: 16/9` (nunca corta) |

### Edge Cases

- **Material só com artigo (sem vídeo):** seção "Vídeo aula" inteira omitida — não mostrar placeholder vazio.
- **Material só com vídeo (sem artigo):** card de artigo omitido; o vídeo passa a ser o conteúdo principal, sobe visualmente para logo abaixo do título.
- **URL de vídeo não reconhecida como YouTube válido:** fallback para link simples, conforme já decidido — nunca "vídeo quebrado" sem alternativa.
- **Artigo com imagens:** imagens do Supabase Storage (RN23) devem respeitar `max-width: 100%` dentro do card, para não vazar em telas pequenas.
- **Material inexistente / ID inválido na URL:** mensagem de "Material não encontrado" com botão de voltar para a Listagem, em vez de tela em branco (evita o mesmo problema descrito no item A6 do audit, aplicado aqui a uma rota de detalhe).
- **Carregando:** mesmo padrão de "Carregando…" da Listagem.
- **Erro ao carregar o material:** banner genérico de erro, mesmo padrão de [[Convencoes_UI#3.6 Erro genérico de rede/servidor]].

### Accessibility Notes

- Iframe do YouTube com `title` descritivo (ex: `title="Vídeo aula: {título do material}"`) para leitores de tela.
- Ordem de foco: breadcrumb → tags → título → artigo (com seus próprios elementos focáveis, ex. links) → vídeo/fallback → botão voltar.
- Botão voltar com `aria-label` claro se for apenas ícone; aqui é texto, então já é autoexplicativo.
- Contraste: Azul escuro (`#061D44`) sobre branco e sobre lavanda passa AA confortavelmente; validar contraste das tags (Azul primário sobre branco) especificamente para texto pequeno (11–12px).

---

## Notas gerais para os desenvolvedores

- Nenhuma das duas telas exige autenticação — não envolver `http.ts` (aluno autenticado) nem checagem de sessão; ambas consomem o endpoint público `GET /study-materials` (ver plano de implementação).
- O card da Listagem e as tags da tela de Detalhe devem usar exatamente as mesmas cores/badges para "Artigo"/"Vídeo aula" e para as tags de Conteúdo/Tópico, garantindo consistência visual entre as duas telas.
- Pendência de token registrada nesta spec (cor de texto secundário) segue o mesmo formato de gap já usado em [[Convencoes_UI]] — não é bloqueante para o build, mas deve ser resolvida/formalizada em [[Identidade_Visual]] quando houver tempo.
