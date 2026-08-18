# Conteúdos e Tópicos (Admin) — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 17/08/2026

> Identidade visual de marca em [[Identidade_Visual]]; tokens do admin e sidebar em [[Spec_Admin_Design_Tokens_e_Sidebar]]. Modais de criação/edição em [[Spec_Modal_Conteudo_Topico]]; modal de exclusão em [[Spec_Modal_Confirmacao_Exclusao]].

## Fluxo da tela

```
Visão Geral / qualquer tela do admin
   ↓ (clique em "Conteúdos e tópicos" na sidebar)
Conteúdos e Tópicos
   ├── clique em "Novo conteúdo" ────────────→ abre [[Spec_Modal_Conteudo_Topico]] (modo Conteúdo, criar)
   ├── clique no ✎ do header de um card ─────→ abre [[Spec_Modal_Conteudo_Topico]] (modo Conteúdo, editar)
   ├── clique no 🗑 do header de um card ─────→ abre [[Spec_Modal_Confirmacao_Exclusao]] (entidade Conteúdo)
   ├── clique em "Novo tópico" (dentro do card)→ abre [[Spec_Modal_Conteudo_Topico]] (modo Tópico, criar, `content_id` pré-preenchido)
   ├── clique no ✎ de uma linha de tópico ────→ abre [[Spec_Modal_Conteudo_Topico]] (modo Tópico, editar)
   └── clique no 🗑 de uma linha de tópico ────→ abre [[Spec_Modal_Confirmacao_Exclusao]] (entidade Tópico)
```

Estrutura definida em sessão de grill-me com o time: Conteúdo e Tópico compartilham uma única tela (não duas listagens separadas), porque a relação 1:N entre eles ([[Analise_do_Sistema#5.3 topics (tópicos — nível específico)]]) é sempre relevante ao visualizar qualquer um dos dois — ver um Tópico sem seu Conteúdo pai perde contexto.

---

## Layout geral

- Duas colunas: sidebar (220px) + área de conteúdo (`flex: 1`, `background: #EFEEFF`, `padding: 32px 36px`).
- Sem filtros/busca no MVP — a expectativa é que o volume de Conteúdos (dezenas) e Tópicos por Conteúdo (poucos) seja pequeno o suficiente para navegação direta pela lista. Se isso deixar de ser verdade em produção, é a primeira melhoria a considerar (fora do escopo desta spec).

---

## Campos / Componentes

### Cabeçalho de página
- **Tipo:** texto dinâmico + botão de ação primária
- **Conteúdo:** título "Conteúdos e tópicos" (Bold 700, 22px, `#061D44`) + subtítulo dinâmico "{total_conteudos} conteúdos, {total_topicos} tópicos." (Regular 400, 14px, `#5A6478`) à esquerda; botão "Novo conteúdo" à direita (mesmo estilo do botão "Nova questão" em [[Spec_Admin_Questoes_Listagem]]).
- **Layout:** `display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px`.

### Lista de cards de Conteúdo
- **Tipo:** lista vertical de cards, um por Conteúdo, sempre expandidos (sem estado colapsado no MVP — decisão fechada em grill-me: volume pequeno de dados não justifica a complexidade de expand/collapse)
- **Layout do container:** `display: flex; flex-direction: column; gap: 16px`.
- **Fonte de dados:** uma única query trazendo Conteúdos com Tópicos aninhados e contagens (`Content::with('topics')->withCount(['topics', 'questions'])` e, por tópico, `withCount('questions')` — evitar N+1).
- **Ordenação:** alfabética por `contents.name` (nenhuma outra ordenação foi solicitada pelo time).

#### Cada card de Conteúdo

- **Container:** `background: #FFFFFF`, `border: 0.5px solid #DCDBE8`, `border-radius: 16px`, `overflow: hidden`.

**Header do card:**
- `display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #EFEEFF` (leve destaque de fundo pra separar visualmente do corpo).
- Esquerda: nome do Conteúdo (Bold 700, 15px, `#061D44`) + `gap: 10px` + contagem combinada em texto discreto (12px, `#5A6478`): `"{N} tópicos · {M} questões"` (singular/plural: "1 tópico", "2 tópicos").
- Direita: ícones de editar (`edit`, `#5A6478`, 17px) e excluir (`trash`, `#A32D2D`, 17px), `padding: 4px` cada, sem fundo, `gap` implícito pelo padding dos botões adjacentes.

**Corpo do card — linhas de Tópico:**
- Cada linha: `display: flex; justify-content: space-between; align-items: center; padding: 12px 18px 12px 30px` (indentação extra à esquerda de `30px` reforça a hierarquia visual de "filho de"), `border-top: 0.5px solid #ECEAFA`.
- Esquerda: nome do Tópico (13px, `#061D44`).
- Direita: `display: flex; align-items: center; gap: 14px` — contagem de questões daquele tópico (12px, `#8A90A3`, ex: "5 questões") + ícone editar (16px, `#5A6478`) + ícone excluir (16px, `#A32D2D`).

**Rodapé do card — ação "Novo tópico":**
- `padding: 10px 18px 12px 30px; border-top: 0.5px solid #ECEAFA` (quando há tópicos) ou `padding: 6px 18px 12px 30px` sem borda superior própria (quando o card está no estado "sem tópicos", ver abaixo).
- Link "+ Novo tópico": 13px, Bold 700, `#258BFC`, ícone `plus` 14px, `gap: 6px`. Abre o modal de criação de Tópico com `content_id` do card já pré-selecionado (o admin nunca precisa escolher o Conteúdo manualmente quando cria a partir daqui).

**Estado "Conteúdo sem tópicos":**
- No lugar das linhas de tópico, uma única linha: `padding: 12px 18px 4px 30px; border-top: 0.5px solid #ECEAFA`, texto "Nenhum tópico ainda." (13px, `#8A90A3`).
- Contagem no header mostra "0 tópicos · 0 questões".

---

## Comportamento em casos especiais

- **Nenhum Conteúdo cadastrado ainda (base vazia):** substitui toda a lista de cards por um estado vazio centralizado: ícone `folder-plus`, texto "Nenhum conteúdo cadastrado ainda." (14px, `#5A6478`) + botão primário "Novo conteúdo" (mesma ação do cabeçalho).
- **Carregamento:** skeleton de 3 cards (retângulos cinza pulsando na geometria de um card com 2 linhas de tópico) enquanto a query inicial carrega.
- **Erro ao carregar:** mesmo padrão de erro das outras telas ("Não foi possível carregar os dados." + "Tentar novamente").
- **Exclusão bloqueada por dependência:** tratada inteiramente pelo modal — ver [[Spec_Modal_Confirmacao_Exclusao]]. Esta tela não precisa desabilitar os ícones de excluir preventivamente (decisão fechada em grill-me: sempre abre o modal, que informa o motivo do bloqueio ali mesmo).
- **Nome de Conteúdo/Tópico muito longo:** trunca com `text-overflow: ellipsis` em uma linha; título completo disponível via `title` attribute (tooltip nativo) no elemento.

---

## Informações exibidas

### Estado padrão (com conteúdos e tópicos cadastrados)
- Lista de cards de Conteúdo, cada um com seus Tópicos aninhados, contagens de tópicos e questões em ambos os níveis, e ações de editar/excluir em ambos os níveis

### Estado "conteúdo sem tópicos" (por card)
- Card normal, mas corpo mostra "Nenhum tópico ainda." no lugar das linhas

### Estado "base vazia" (nenhum conteúdo cadastrado)
- Mensagem de vazio + ação de cadastrar o primeiro conteúdo

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
| --- | --- |
| [[Analise_do_Sistema#5.3 topics (tópicos — nível específico)\|5.3]] | Relação 1:N entre Conteúdo e Tópico — base da estrutura aninhada desta tela |
| [[Analise_do_Sistema#^rn06\|RN06]] | Questão vinculada a 1+ Conteúdo — alimenta a contagem "M questões" no header do card |
| [[Analise_do_Sistema#^rn16\|RN16]] | Tópico de uma questão deve pertencer a um Conteúdo já vinculado à mesma questão — motivo pelo qual a exclusão de Conteúdo/Tópico com questões vinculadas é bloqueada (ver [[Spec_Modal_Confirmacao_Exclusao]]) |
| [[Analise_do_Sistema#^rn15\|RN15]] | Painel único sem distinção de papéis — qualquer admin pode criar/editar/excluir Conteúdos e Tópicos |
