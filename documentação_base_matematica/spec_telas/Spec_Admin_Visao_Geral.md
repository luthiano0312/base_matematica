# Visão Geral (Admin) — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 17/08/2026

> Identidade visual de marca em [[Identidade_Visual]]; tokens específicos do admin e componente de sidebar em [[Spec_Admin_Design_Tokens_e_Sidebar]] — leia aquele documento primeiro, este cobre apenas o conteúdo e comportamento desta tela.

## Fluxo da tela

```
Login do admin (guard `admins`, RN20)
   ↓
Visão Geral  ← rota padrão do painel, primeira tela após login
   ├── clique em "Questões" (sidebar) ──────────────→ Listagem de Questões
   ├── clique em "Conteúdos e tópicos" (sidebar) ───→ Conteúdos e Tópicos
   ├── clique em "Sair" (sidebar) ───────────────────→ Login do admin
   └── clique em item de "Cadastrado recentemente" ─→ tela de edição da entidade (questão/tópico/conteúdo) correspondente
```

É a tela inicial do painel administrativo — equivalente institucional ao Dashboard do aluno ([[Spec_Dashboard]]), mas sem dado pessoal do usuário (o admin não tem streak/pontos); mostra saúde do conteúdo cadastrado.

---

## Layout geral

- Duas colunas: sidebar (220px, ver [[Spec_Admin_Design_Tokens_e_Sidebar#5. Componente: Sidebar de navegação]]) + área de conteúdo (`flex: 1`).
- Área de conteúdo: `background: #EFEEFF` (Lavanda), `padding: 32px 36px`.
- Largura máxima do conteúdo: sem `max-width` travado no MVP — conteúdo ocupa o espaço disponível (grid dos cards se adapta via `repeat(3, minmax(0,1fr))`).

---

## Campos / Componentes

### Cabeçalho de página
- **Tipo:** texto estático + dinâmico
- **Conteúdo:** título "Visão geral" (H1, Bold 700, 22px, `#061D44`) + subtítulo dinâmico "Resumo do conteúdo cadastrado na plataforma." (Regular 400, 14px, `#5A6478`).
- **Comportamento:** sem interação. `margin-bottom: 28px` até o grid de cards.

### Grid de cards de métrica (3 cards)
- **Tipo:** cards informativos com dado dinâmico, lado a lado
- **Layout:** `display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px`. Em tablet (768–1024px), colapsa para `repeat(2, minmax(0,1fr))` com o 3º card quebrando linha. Abaixo de 768px, `grid-template-columns: 1fr` (empilhado).
- **Cada card:** `border-radius: 16px`, `padding: 20px`, sem sombra (flat).

| Card | Fundo | Cor texto | Ícone | Query de origem |
| --- | --- | --- | --- | --- |
| Questões cadastradas | `#258BFC` | `#FFFFFF` (número), `#DBEAFD` (label) | `file-text` | `COUNT(*) FROM questions` |
| Tópicos cadastrados | `#26E874` | `#04341B` (número), `#0A4A26` (label) | `topology-star-3` | `COUNT(*) FROM topics` |
| Conteúdos cadastrados | `#DE4EE1` | `#FFFFFF` (número), `#F8DCF9` (label) | `folder` | `COUNT(*) FROM contents` |

- Estrutura interna de cada card: ícone dentro de badge circular (`40px`, `border-radius: 10px`, fundo com opacidade sobre a cor do card — `rgba(255,255,255,0.2)` ou `rgba(0,0,0,0.15)` conforme contraste do texto) → `margin-bottom: 28px` → número (Black 900, 36px, `line-height: 1`) → label (SemiBold 600, 13px, uppercase, `letter-spacing: 0.02em`, `margin-top: 6px`).
- **Comportamento:** somente leitura, sem clique/navegação nesta versão (MVP). Dado carregado ao montar a tela.

### Banner de alerta (condicional)
- **Tipo:** card informativo condicional (aparece só quando há algo a sinalizar)
- **Conteúdo:** ícone de alerta (`alert-triangle`, `#854F0B`, dentro de badge `rgba(250,199,117,0.35)`), título curto (ex: "N tópicos ainda sem nenhuma questão vinculada") + subtítulo com link (ex: "Confira em Conteúdos e tópicos.").
- **Regra de exibição:** o MVP cobre um único tipo de alerta: **tópicos sem nenhuma questão vinculada** (`COUNT(topics) WHERE NOT EXISTS (question_topic)`). Se o contador for `0`, o banner inteiro não é renderizado (não mostrar "0 tópicos sem questão").
- **Estilo:** `background: #FFFFFF`, `border: 0.5px solid #DCDBE8`, `border-radius: 16px`, `padding: 18px 20px`, `display: flex; align-items: center; gap: 12px`.
- **Comportamento:** clique no texto/subtítulo navega para a rota de Conteúdos e Tópicos (não precisa de filtro aplicado no MVP — apenas navega).
- **Extensibilidade:** deixar a estrutura pronta para múltiplos banners empilhados no futuro (ex: "questões sem resolução em vídeo"), mesmo que o MVP só implemente este.

### Lista "Cadastrado recentemente"
- **Tipo:** lista de atividade, dado dinâmico
- **Título da seção:** "Cadastrado recentemente" (Bold 700, 15px, `#061D44`, `margin-bottom: 12px`).
- **Conteúdo:** container `background: #FFFFFF`, `border: 0.5px solid #DCDBE8`, `border-radius: 16px`, `overflow: hidden`. Cada linha: `padding: 14px 18px`, `display: flex; justify-content: space-between; align-items: center`, com `border-top: 0.5px solid #ECEAFA` em todas exceto a primeira.
- **Cada item:** título curto descrevendo o que foi cadastrado (ex: `"[Enunciado truncado] — questão [tipo]"`, `'Tópico "[nome]" criado'`, `'Conteúdo "[nome]" criado'`) em Bold 700, 13px, `#061D44`; subtítulo com contexto (conteúdo/tópico pai, dificuldade, ou "0 tópicos ainda") em 12px, `#8A90A3`; timestamp relativo à direita (ex: "há 2h", "ontem") em 12px, `#8A90A3`, `flex-shrink: 0`.
- **Fonte de dados:** união das últimas N criações entre `questions`, `topics` e `contents`, ordenadas por `created_at` desc. **Decisão a confirmar com o time:** `N = 5` a `10` itens é razoável para o MVP; não pagina (é só uma prévia — a listagem completa de cada entidade vive nas telas próprias).
- **Comportamento:** clique em qualquer linha navega para a tela de edição da entidade correspondente (questão → form de edição já implementado; tópico/conteúdo → abre o modal de edição, ver [[Spec_Modal_Conteudo_Topico]]).

---

## Comportamento em casos especiais

- **Nenhum conteúdo cadastrado ainda (base zerada):** os 3 cards mostram `0`; banner de alerta não aparece (0 tópicos sem questão, porque não há tópicos); lista "Cadastrado recentemente" mostra um estado vazio: texto centralizado "Nenhuma atividade ainda." em `#8A90A3`, 13px, `padding: 32px`, sem borda entre linhas.
- **Carregamento dos dados:** exibir skeleton nos 3 cards (retângulos cinza `#DCDBE8` pulsando, mesma geometria dos cards) e na lista de atividade recente (3 linhas skeleton) enquanto a requisição está em andamento. Não há spec de loading definida para o restante do sistema ([[Spec_Dashboard#Comportamento em casos especiais]] também deixa isso como pendência geral) — este documento fecha a lacuna apenas para esta tela.
- **Erro ao carregar dados:** substituir a área de conteúdo (cards + banner + lista) por um estado de erro central: ícone `alert-circle`, texto "Não foi possível carregar os dados." + botão "Tentar novamente" (secundário, reexecuta a query).

---

## Informações exibidas

### Estado padrão (com conteúdo cadastrado)
- Total de questões, tópicos e conteúdos cadastrados
- Banner de alerta (se houver tópicos órfãos)
- Lista das últimas cadastros/edições no sistema

### Estado "base vazia" (recém-lançado, nenhum conteúdo ainda)
- Cards zerados
- Sem banner de alerta
- Lista de atividade em estado vazio

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
| --- | --- |
| [[Analise_do_Sistema#^rn06\|RN06]] | Toda questão tem 1+ Conteúdo (afeta a contagem de "Questões cadastradas") |
| [[Analise_do_Sistema#^rn20\|RN20]] | Autenticação separada do admin — justifica o bloco de identidade na sidebar |
| [[Analise_do_Sistema#^rn15\|RN15]] | Painel único, sem distinção de papéis — todos os admins veem a mesma Visão Geral |
