# Questões — Listagem (Admin) — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 17/08/2026

> Identidade visual de marca em [[Identidade_Visual]]; tokens do admin e sidebar em [[Spec_Admin_Design_Tokens_e_Sidebar]]. Modal de exclusão em [[Spec_Modal_Confirmacao_Exclusao]].

## Fluxo da tela

```
Visão Geral / qualquer tela do admin
   ↓ (clique em "Questões" na sidebar)
Questões — Listagem
   ├── clique em "Nova questão" ──────→ Cadastro de Questão (tela já implementada — ver Pendência 1)
   ├── clique no ícone de editar ─────→ Edição de Questão (tela já implementada, pré-preenchida — ver Pendência 1)
   ├── clique no ícone de excluir ────→ abre [[Spec_Modal_Confirmacao_Exclusao]]
   └── alteração de filtro/busca ─────→ recarrega a tabela (mesma tela, sem navegação)
```

Esta é a tela que resolve a pendência original do time: as telas de Cadastro e Edição de questão já existem no código, mas não tinham nenhum ponto de entrada linkado. A listagem passa a ser esse ponto de entrada.

---

## Layout geral

- Duas colunas: sidebar (220px) + área de conteúdo (`flex: 1`, `background: #EFEEFF`, `padding: 32px 36px`).
- Ordem vertical do conteúdo: cabeçalho com CTA → bloco de filtros → tabela com paginação.

---

## Campos / Componentes

### Cabeçalho de página
- **Tipo:** texto dinâmico + botão de ação primária
- **Conteúdo:** título "Questões" (Bold 700, 22px, `#061D44`) + subtítulo dinâmico "{total} questões cadastradas." (Regular 400, 14px, `#5A6478`) à esquerda; botão "Nova questão" à direita.
- **Botão "Nova questão":** `background: #258BFC`, texto branco Bold 700 14px, ícone `plus` 16px, `padding: 10px 16px`, `border-radius: 10px`. Navega para a rota de cadastro de questão já implementada.
- **Layout:** `display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px`.

### Bloco de filtros
- **Tipo:** card com controles de filtro + busca
- **Container:** `background: #FFFFFF`, `border: 0.5px solid #DCDBE8`, `border-radius: 16px`, `padding: 16px 18px`, `margin-bottom: 20px`.
- **Linha 1 — 4 selects lado a lado** (`display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-bottom: 12px`):

| Filtro | Opções | Depende de | Obrigatório? |
| --- | --- | --- | --- |
| Conteúdo | lista de `contents.name` + opção "Conteúdo: todos" | — | Não |
| Tópico | lista de `topics.name` pertencentes ao conteúdo selecionado + "Tópico: todos" | Conteúdo (filtro em cascata — reaproveita o mesmo padrão de dependência do Filtro do aluno, ver [[Fluxo_de_Navegacao#Onboarding]] e RN16) | Não |
| Dificuldade | Fácil / Média / Difícil / "Dificuldade: todas" | — | Não |
| Tipo | Múltipla escolha / Certo ou errado / Dissertativa / "Tipo: todos" | — | Não |

- Cada select: `height: 36px`, `border-radius: 8px`, `border: 0.5px solid #DCDBE8`, `padding: 0 10px`, `font-size: 13px`, `color: #061D44`, `background: #FFFFFF`.
- **Comportamento do filtro Tópico:** ao trocar o Conteúdo, o select de Tópico reseta para "Tópico: todos" e recarrega as opções via `GET /admin/topics?content_id=`. Se nenhum Conteúdo estiver selecionado, o select de Tópico fica desabilitado com placeholder "Escolha um conteúdo primeiro" (mesmo texto/padrão do Filtro do aluno em [[Fluxo_de_Navegacao#Onboarding]]).
- **Linha 2 — busca por texto:** input full-width, `height: 38px`, ícone de lupa (`search`, 16px, `#8A90A3`) posicionado à esquerda dentro do campo (`padding-left: 36px`), placeholder "Buscar por enunciado". Debounce de 300ms antes de disparar a requisição.
- **Aplicação dos filtros:** cada mudança de filtro ou busca dispara `GET /admin/questions` com os parâmetros atuais e reseta a paginação para a página 1.

### Tabela de questões
- **Tipo:** tabela com dado dinâmico paginado
- **Container:** `background: #FFFFFF`, `border: 0.5px solid #DCDBE8`, `border-radius: 16px`, `overflow: hidden`.
- **Layout:** `table-layout: fixed` (evita que enunciados longos estourem a largura).

| Coluna | Largura | Conteúdo | Alinhamento |
| --- | --- | --- | --- |
| Enunciado | 34% | `statement` truncado (texto puro, sem renderizar HTML/KaTeX — ver nota) em 1 linha com `text-overflow: ellipsis` | Esquerda |
| Tipo | 15% | "Múltipla escolha" / "Certo ou errado" / "Dissertativa" | Esquerda |
| Dificuldade | 12% | badge colorido (ver [[Spec_Admin_Design_Tokens_e_Sidebar#2.3 Cores semânticas de dificuldade]]) | Esquerda |
| Conteúdo | 20% | nome do(s) conteúdo(s) vinculado(s) — se mais de 1, mostrar o primeiro + `"+N"` (ex: "Frações +1") | Esquerda |
| Ações | 19% | ícones de editar (`edit`, `#5A6478`) e excluir (`trash`, `#A32D2D`), 17px cada, `padding: 4px`, sem fundo | Direita |

- **Nota sobre a coluna Enunciado:** o campo `statement` é armazenado como HTML (RN21) e pode conter fórmulas em formato KaTeX embutido. Para a listagem, extrair apenas o texto puro (strip de tags HTML e de marcação de fórmula) antes de truncar — renderizar HTML/KaTeX numa célula de tabela é custo desnecessário para o caso de uso ("identificar a questão rapidamente"), não pra leitura da fórmula em si.
- **Cabeçalho da tabela:** `background: #EFEEFF`, células com `padding: 10px 16px`, texto 12px Bold 700 uppercase `#5A6478`, `letter-spacing: 0.03em`.
- **Linhas:** `padding: 12px 16px`, `border-top: 0.5px solid #ECEAFA` (exceto a primeira). Sem hover destacado necessário no MVP (linha não é clicável inteira — só os ícones de ação).
- **Badge de dificuldade:** `font-size: 12px`, `font-weight: 700`, `padding: 3px 10px`, `border-radius: 20px` (pill), cores conforme tabela de tokens (Fácil/Média/Difícil).
- **Botão editar:** navega para a rota de edição da questão já implementada, passando o `id`.
- **Botão excluir:** abre [[Spec_Modal_Confirmacao_Exclusao]] no estado correspondente (permitido ou bloqueado, dependendo de existir `answered_questions` vinculada a essa questão).

### Paginação
- **Tipo:** controle de navegação de páginas, servidor-side
- **Layout:** rodapé da tabela, `padding: 12px 18px`, `border-top: 0.5px solid #ECEAFA`, `display: flex; justify-content: space-between; align-items: center`.
- **Conteúdo:** texto "Página {atual} de {total}" (12px, `#8A90A3`) à esquerda; botões "Anterior" / "Próxima" à direita (`height: 30px`, `padding: 0 12px`, `border-radius: 8px`, `border: 0.5px solid #DCDBE8`, `font-size: 12px`).
- **Estado desabilitado:** "Anterior" desabilitado (cursor `not-allowed`, texto `#8A90A3`) na página 1; "Próxima" desabilitado na última página.
- **Tamanho de página:** 20 itens por página (`Question::paginate(20)` no backend).

---

## Comportamento em casos especiais

- **Nenhum resultado para os filtros aplicados:** tabela substitui as linhas por um estado vazio centralizado (`padding: 48px`): ícone `search-off`, texto "Nenhuma questão encontrada para esse filtro." (14px, `#5A6478`) + botão secundário "Limpar filtros" (reseta todos os filtros e a busca).
- **Base sem nenhuma questão cadastrada (diferente do caso acima — nenhum filtro aplicado e mesmo assim vazio):** mesmo componente de estado vazio, mas texto muda para "Nenhuma questão cadastrada ainda." + botão primário "Nova questão" (mesma ação do cabeçalho) em vez de "Limpar filtros".
- **Carregamento:** skeleton de 6 linhas na tabela (retângulos cinza pulsando) enquanto a requisição de listagem está em andamento; filtros ficam desabilitados durante o carregamento inicial da tela (mas não durante recarregamentos por filtro, para não travar a interação).
- **Erro ao carregar:** estado de erro no lugar da tabela, mesmo padrão de [[Spec_Admin_Visao_Geral#Comportamento em casos especiais]] ("Não foi possível carregar os dados." + "Tentar novamente").
- **Enunciado sem texto extraível (ex: questão só com imagem):** célula mostra "(sem texto no enunciado)" em itálico, `#8A90A3`, para não deixar a linha vazia.

---

## Informações exibidas

### Estado padrão (com resultados)
- Total de questões cadastradas (subtítulo do cabeçalho — reflete a contagem sem filtro, não a contagem filtrada)
- Tabela paginada com enunciado, tipo, dificuldade, conteúdo(s) e ações
- Controles de página

### Estado "sem resultados" (filtro aplicado sem match)
- Mensagem de vazio + ação de limpar filtro

### Estado "base vazia" (nenhuma questão no sistema)
- Mensagem de vazio + ação de cadastrar a primeira questão

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
| --- | --- |
| [[Analise_do_Sistema#^rn05\|RN05]] | Toda questão tem dificuldade obrigatória — alimenta a coluna/badge de Dificuldade |
| [[Analise_do_Sistema#^rn06\|RN06]] | Questão vinculada a 1+ Conteúdo — alimenta a coluna Conteúdo |
| [[Analise_do_Sistema#^rn16\|RN16]] | Tópico de uma questão deve pertencer a um Conteúdo já vinculado à mesma questão — reflete no filtro em cascata Conteúdo→Tópico |
| [[Analise_do_Sistema#^rn21\|RN21]] | `statement` armazenado como HTML — motiva a extração de texto puro na coluna Enunciado |
| [[Analise_do_Sistema#^rf06\|RF06]] | Sistema deve permitir filtro/busca de questões por Conteúdo e Tópico (reaproveitado aqui para o admin) |

## Pendências identificadas nesta tela

1. **Rotas de cadastro/edição de questão:** confirmadas como já implementadas pelo time, mas não documentadas neste conjunto de specs (não existe um `Spec_Cadastro_Questao.md` no repositório de documentação até o momento). Recomenda-se criar essa spec retroativamente, ao menos com os parâmetros de rota (`/admin/questoes/nova`, `/admin/questoes/:id/editar`) para consistência com o restante da documentação.
