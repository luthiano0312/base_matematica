# Admin — Design Tokens e Sidebar
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec compartilhada (tokens + componente de navegação)
**Última atualização:** 17/08/2026

> Este documento é referenciado por todas as specs de tela do painel administrativo ([[Spec_Admin_Visao_Geral]], [[Spec_Admin_Questoes_Listagem]], [[Spec_Admin_Conteudos_Topicos]]) e pelos modais ([[Spec_Modal_Confirmacao_Exclusao]], [[Spec_Modal_Conteudo_Topico]]). Ele existe porque o painel admin introduz uma superfície nova (desktop-first, densidade de dados alta) que a [[Identidade_Visual]] não cobre — a Identidade_Visual define a marca (cores, tipografia, tom), este documento estende isso com os tokens neutros/semânticos e o layout de navegação que só existem no admin.

---

## 1. Contexto e decisões de arquitetura

Decisões fechadas em sessão de grill-me com o time (17/08/2026), servindo de guia pra qualquer dúvida de implementação não coberta explicitamente:

- **Desktop-first.** Breakpoint principal ≥1024px. Tablet (768–1024px) permanece funcional com sidebar colapsada. Abaixo de 768px, a tela apenas não pode quebrar (sem overflow horizontal, sem elementos cortados) — não há otimização mobile dedicada no MVP. Motivo: público do admin (7 produtores de conteúdo usando Tiptap/MathLive) trabalha em ambiente de mesa, diferente do aluno (RNF01, mobile-first).
- **Navegação:** sidebar fixa + rotas separadas por entidade (não abas numa tela única). 3 itens: Visão Geral, Questões, Conteúdos e tópicos.
- **Autenticação:** painel usa guard/tabela `admins` separada do aluno (RN20 em [[Analise_do_Sistema]]) — a sidebar deve deixar isso visualmente claro (nome do admin logado sempre visível).

---

## 2. Paleta de cores

### 2.1 Cores de marca (reaproveitadas de [[Identidade_Visual#2. Paleta de Cores]])

| Token | Hex | Uso no admin |
| --- | --- | --- |
| `--admin-blue-escuro` | `#061D44` | Fundo da sidebar; texto principal sobre fundo claro |
| `--admin-blue-primario` | `#258BFC` | Item ativo da sidebar; botões primários; links |
| `--admin-verde` | `#26E874` | Cor de sucesso/acerto (ex: badge "Fácil" pode herdar a intenção, mas ver 2.3) |
| `--admin-magenta` | `#DE4EE1` | Uso pontual — card de destaque "Conteúdos" na Visão Geral |
| `--admin-lavanda` | `#EFEEFF` | Fundo de página (substitui o `#F4F3FB` usado no mockup interativo — ver nota) |

> **Nota de reconciliação:** o mockup interativo (Visualizer) gerado durante a ideação usou `#F4F3FB` como fundo de página por limitação da ferramenta de mockup. Para a implementação real, use o token oficial `#EFEEFF` (Lavanda) já definido na Identidade_Visual — evita introduzir uma cor nova sem necessidade.

### 2.2 Extensão neutra (nova — não existe na Identidade_Visual, necessária para UI densa de dados)

| Token | Hex | Uso |
| --- | --- | --- |
| `--admin-border` | `#DCDBE8` | Bordas de cards, inputs, tabelas |
| `--admin-border-suave` | `#ECEAFA` | Divisores entre linhas de tabela/lista (mais sutil que `--admin-border`) |
| `--admin-text-secundario` | `#5A6478` | Subtítulos, texto de apoio, labels de tabela |
| `--admin-text-muted` | `#8A90A3` | Timestamps, placeholders, contadores discretos |
| `--admin-sidebar-text-inativo` | `#C9D3E6` | Itens de navegação não ativos (sobre fundo `--admin-blue-escuro`) |
| `--admin-sidebar-divisor` | `rgba(255,255,255,0.12)` | Linha divisória acima do bloco de usuário logado na sidebar |

### 2.3 Cores semânticas de dificuldade (novas — propostas para este painel, pois o projeto não define cores de dificuldade em nenhum outro documento)

| Dificuldade | Fundo do badge | Texto do badge |
| --- | --- | --- |
| Fácil | `#EAF3DE` | `#27500A` |
| Média | `#FAEEDA` | `#854F0B` |
| Difícil | `#FCEBEB` | `#791F1F` |

### 2.4 Cor de perigo/ação destrutiva

| Token | Hex | Uso |
| --- | --- | --- |
| `--admin-danger` | `#A32D2D` | Ícone de excluir; botão "Excluir" nos modais de confirmação |
| `--admin-danger-bg` | `#FCEBEB` | Fundo de banners/alertas de erro ou bloqueio |

---

## 3. Tipografia

Fonte única: **Nunito** (mesma da Identidade_Visual, seção 3.1 — o admin não usa a fonte matemática Latin Modern, já que não renderiza enunciados em contexto de leitura de aluno, apenas em campos de formulário/HTML bruto).

| Uso | Peso | Tamanho | Cor |
| --- | --- | --- | --- |
| Título de página (ex: "Visão geral") | Bold 700 | 22px | `--admin-blue-escuro` |
| Subtítulo de página | Regular 400 | 14px | `--admin-text-secundario` |
| Nome de item em card/lista (ex: nome do conteúdo) | Bold 700 | 15px | `--admin-blue-escuro` |
| Corpo de tabela/lista | Regular 400 | 13px | `--admin-blue-escuro` ou `--admin-text-secundario` conforme coluna |
| Números grandes (cards de métrica) | Black 900 | 36px | conforme cor do card |
| Label de card de métrica (uppercase) | SemiBold 600 | 13px | tom claro da cor do card |
| Cabeçalho de coluna de tabela | Bold 700 | 12px, uppercase, letter-spacing 0.03em | `--admin-text-secundario` |
| Texto de sidebar (nav item) | SemiBold 600 | 14px | conforme estado (ativo/inativo) |
| Nome do admin logado (sidebar) | Bold 700 | 13px | `#FFFFFF` |
| Timestamp / contador discreto | Regular 400 | 12px | `--admin-text-muted` |

---

## 4. Espaçamento e forma

| Token | Valor | Uso |
| --- | --- | --- |
| `--admin-sidebar-largura` | `220px` | Largura fixa da sidebar em desktop |
| `--admin-sidebar-largura-colapsada` | `72px` | Largura da sidebar em tablet (768–1024px) — mostra apenas ícones |
| `--admin-content-padding` | `32px 36px` | Padding da área de conteúdo principal |
| `--admin-radius-card` | `16px` | Border-radius de cards e containers principais |
| `--admin-radius-control` | `8px` a `10px` | Border-radius de inputs, botões, badges retangulares |
| `--admin-radius-badge` | `20px` | Border-radius de badges de dificuldade (pill) |
| `--admin-control-height` | `36px`–`38px` | Altura de inputs, selects, botões de ação |
| `--admin-gap-grid` | `16px` | Gap padrão entre cards em grid |

---

## 5. Componente: Sidebar de navegação

### 5.1 Estrutura

```
┌──────────────────────┐
│ [logo] base matemática│  ← 24px padding-bottom
├──────────────────────┤
│ ▸ Visão geral          │  ← item ativo
│   Questões             │
│   Conteúdos e tópicos  │
│                        │
│      (spacer flex:1)   │
│                        │
├──────────────────────┤
│ (JS) João Silva        │
│      Sair              │
└──────────────────────┘
```

- Container: `width: 220px`, `background: var(--admin-blue-escuro)`, `display: flex; flex-direction: column`, `padding: 20px 0`, `flex-shrink: 0` (nunca encolhe).
- Altura: `100%` da viewport (sidebar sempre visível, sem scroll independente no MVP — a lista de 3 itens nunca vai exigir isso).

### 5.2 Bloco de logo (topo)

- Padding: `0 20px 24px`.
- Ícone da marca (triângulo/pirâmide estilizada, ver [[Identidade_Visual#5.1 Direção do Logo]]) em `--admin-blue-primario`, 20px.
- Texto "base matemática", Bold 700, 15px, branco, `gap: 8px` do ícone.

### 5.3 Itens de navegação

Cada item:
- Container: `display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px`, dentro de um wrapper com `padding: 0 12px` e `gap: 2px` entre itens.
- Ícone: 18px (Tabler ou equivalente — `layout-dashboard` para Visão Geral, `file-text` para Questões, `folder` para Conteúdos e tópicos).
- Texto: SemiBold 600, 14px.

**Estados:**

| Estado | Fundo | Cor do texto/ícone |
| --- | --- | --- |
| Ativo (rota atual) | `--admin-blue-primario` (`#258BFC`) | `#FFFFFF` |
| Inativo | transparente | `--admin-sidebar-text-inativo` (`#C9D3E6`) |
| Hover (inativo) | `rgba(255,255,255,0.08)` | `#FFFFFF` |
| Foco (teclado) | mesma cor de hover + `outline: 2px solid #258BFC` com `outline-offset: 2px` | — |

### 5.4 Bloco de usuário (rodapé)

- Ancorado ao fundo via `margin-top: auto`.
- Borda superior: `0.5px solid var(--admin-sidebar-divisor)`, `padding-top: 16px`, padding lateral `20px`.
- Avatar: círculo 32px, fundo `rgba(37,139,252,0.25)`, iniciais do nome (2 letras, uppercase) em branco, Bold 700, 12px.
- Nome do admin: Bold 700, 13px, branco, `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` (trunca se o nome for muito longo).
- Link "Sair": 12px, `--admin-sidebar-text-inativo`, com ícone de logout 13px. Ao clicar → confirma antes de encerrar sessão? **Não** — logout é ação não-destrutiva e reversível (basta logar de novo), não precisa de modal de confirmação.

### 5.5 Responsividade da sidebar

| Breakpoint | Comportamento |
| --- | --- |
| Desktop (≥1024px) | Sidebar completa, 220px, com texto dos itens visível |
| Tablet (768–1024px) | Sidebar colapsa para 72px — mostra só os ícones centralizados, sem texto. Nome do admin colapsa para apenas o avatar (sem nome/logout visíveis; logout se move para um menu ao clicar no avatar). Tooltip com o nome do item aparece no hover. |
| Mobile (<768px) | Sidebar vira um header fixo no topo (ícone de menu hambúrguer abrindo um drawer com os mesmos itens) — **não otimizado no MVP**, apenas garantir que não quebra o layout. |

### 5.6 Acessibilidade

- A sidebar inteira é um `<nav aria-label="Navegação do painel administrativo">`.
- Item ativo recebe `aria-current="page"`.
- Ícones decorativos: `aria-hidden="true"`. Ícone do link "Sair" e do avatar não têm função adicional, mas o link "Sair" precisa de texto visível (já tem) — não é ícone-only, não precisa `aria-label`.
- Ordem de foco (tab): logo (não focável, é só marca) → Visão geral → Questões → Conteúdos e tópicos → Sair.
- Contraste: `#C9D3E6` sobre `#061D44` ≈ 8.1:1 (AA/AAA ok). `#258BFC` fundo com texto branco ≈ 3.4:1 — **atenção:** isso fica abaixo do AA para texto normal (4.5:1), mas como o texto é 14px SemiBold (~bold), avalie se enquadra como "texto grande" (não enquadra, 14px é abaixo do limiar de 18.66px bold). **Ação recomendada para o agente:** considerar usar `#FFFFFF` a 100% já é o mais claro possível; se o contraste for um bloqueio de QA de acessibilidade, escurecer levemente o azul do item ativo para uma variante tipo `#1D6FD1` mantendo a identidade, ou aceitar a exceção documentando o motivo (elemento de navegação repetido, não conteúdo isolado).
