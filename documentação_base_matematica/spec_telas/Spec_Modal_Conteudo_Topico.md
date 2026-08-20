# Modal de Criar/Editar Conteúdo ou Tópico (Admin) — Especificação de Componente
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Componente (modal compartilhado)
**Última atualização:** 17/08/2026

> Reaproveitado em [[Spec_Admin_Conteudos_Topicos]]. Tokens em [[Spec_Admin_Design_Tokens_e_Sidebar]]. Modal de exclusão (não coberto aqui) em [[Spec_Modal_Confirmacao_Exclusao]].

## Fluxo do componente

```
Conteúdos e Tópicos (listagem)
   ├── "Novo conteúdo" (cabeçalho) ─────────────→ Modal, modo Conteúdo, criar (campos vazios)
   ├── ✎ no header de um card ──────────────────→ Modal, modo Conteúdo, editar (campos preenchidos)
   ├── "+ Novo tópico" (dentro de um card) ─────→ Modal, modo Tópico, criar (Conteúdo pai pré-selecionado)
   └── ✎ em uma linha de tópico ─────────────────→ Modal, modo Tópico, editar (campos preenchidos)
        ↓ (submeter)
   POST ou PUT ao backend → sucesso → modal fecha → card/lista atualiza (sem reload completo)
        ↓ (cancelar/fechar)
   Modal fecha sem alterar nada
```

Este é um único componente com **dois modos** (Conteúdo / Tópico) que compartilham a mesma estrutura visual, diferindo apenas nos campos do corpo — decisão fechada em grill-me (modal, não página cheia, dado que ambas as entidades são simples: só `name` +, no caso do Tópico, `content_id`).

---

## Layout e estrutura

- **Overlay e container:** mesmos tokens do [[Spec_Modal_Confirmacao_Exclusao#Layout e estrutura]] (`rgba(6,29,68,0.45)` overlay, container branco `border-radius: 16px`), mas `width: 480px` (levemente mais largo que o modal de exclusão, por ter campo de formulário).
- **Fechamento:** overlay, `Esc`, botão "Cancelar", ou X no canto superior direito do modal (`16px`, `#8A90A3`, `padding: 4px`, posição absoluta `top: 16px; right: 16px`).

### Cabeçalho do modal
- Título (Bold 700, 17px, `#061D44`), variando por modo e ação:
  - Criar Conteúdo: "Novo conteúdo"
  - Editar Conteúdo: "Editar conteúdo"
  - Criar Tópico: "Novo tópico"
  - Editar Tópico: "Editar tópico"
- Sem ícone no cabeçalho deste modal (diferente do modal de exclusão) — é um formulário, não uma confirmação de risco.

### Corpo do modal — campos

#### Campo "Nome" (presente em ambos os modos)
- **Tipo:** texto simples (`input type="text"`)
- **Label:** "Nome do conteúdo" (modo Conteúdo) ou "Nome do tópico" (modo Tópico) — 13px, Bold 700, `#061D44`, `margin-bottom: 6px`.
- **Placeholder:** exemplo real, não genérico — "Ex.: Equações do 2º grau" (modo Conteúdo) ou "Ex.: Fórmula de Bhaskara" (modo Tópico), conforme os próprios exemplos já usados em [[Analise_do_Sistema#5.2 contents (conteúdos — nível amplo)]] e [[#5.3 topics (tópicos — nível específico)]].
- **Estilo do input:** `height: 38px`, `border-radius: 8px`, `border: 0.5px solid #DCDBE8`, `padding: 0 12px`, `font-size: 14px`, `width: 100%; box-sizing: border-box`. Foco: `border-color: #258BFC`, `box-shadow: 0 0 0 3px rgba(37,139,252,0.15)`.
- **Obrigatório:** sim, em ambos os modos.
- **Limite de caracteres:** 100 (não especificado em nenhum outro documento — proposto aqui como limite razoável para nomes de conteúdo/tópico, com contador discreto "{n}/100" em 11px `#8A90A3` abaixo do input, aparecendo só ao focar o campo ou ao ultrapassar 80 caracteres).
- **Validação:** campo vazio ao submeter → borda vermelha (`#E24B4A`) + texto de erro abaixo "Digite um nome." (13px, `#A32D2D`). Erro limpa assim que o usuário volta a digitar.

#### Campo "Conteúdo" (presente **somente** no modo Tópico)
- **Tipo:** select/dropdown
- **Label:** "Conteúdo" — mesmo estilo do label acima.
- **Opções:** lista de todos os `contents.name` cadastrados.
- **Obrigatório:** sim (RN: todo Tópico pertence a exatamente 1 Conteúdo, ver [[Analise_do_Sistema#5.3 topics (tópicos — nível específico)]]).
- **Pré-preenchimento:**
  - Ao criar a partir do botão "+ Novo tópico" **dentro** de um card de Conteúdo: campo vem pré-selecionado com aquele Conteúdo, e o campo fica **travado/desabilitado** (`background: #F4F3FB`, `cursor: not-allowed`) — o admin não precisa (nem deveria, nesse fluxo) escolher outro Conteúdo, já que o contexto de onde ele clicou já define isso. Exibir um texto auxiliar abaixo do select: "Definido pelo conteúdo em que você abriu esse formulário." (12px, `#8A90A3`).
  - Ao editar um Tópico existente: campo vem preenchido com o Conteúdo atual, mas **editável** (permite mover o tópico para outro Conteúdo).
- **Estilo:** mesmo do select de filtros em [[Spec_Admin_Questoes_Listagem#Bloco de filtros]] (`height: 36px`, `border-radius: 8px`, etc.), mas full-width dentro do modal.

### Rodapé do modal (botões)
- `display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px`.
- **Cancelar:** secundário, mesmo estilo do [[Spec_Modal_Confirmacao_Exclusao#Rodapé do modal (botões)]].
- **Salvar:** primário — `background: #258BFC`, texto branco Bold 700 14px, `padding: 10px 16px`, `border-radius: 10px`. Texto do botão: "Criar conteúdo" / "Salvar alterações" / "Criar tópico" / "Salvar alterações", conforme modo+ação (ser específico no verbo, não usar só "Salvar" genérico, seguindo a convenção de copy verbo-primeiro).
- **Estado de loading:** ao submeter, botão "Salvar" mostra spinner + "Salvando…", fica desabilitado; "Cancelar" também desabilita (evita fechar o modal no meio de uma submissão).

---

## Comportamento em casos especiais

- **Nome duplicado:** o backend deve validar unicidade? **Não especificado em nenhum outro documento do projeto** — nem [[Analise_do_Sistema#5.2 contents (conteúdos — nível amplo)]] nem 5.3 declaram `name` como `unique`. **Recomendação para o agente implementar:** não bloquear por duplicidade no MVP (permite, por exemplo, dois Tópicos com nomes iguais em Conteúdos diferentes, ou até no mesmo — casos legítimos de nomenclatura podem se repetir). Se o time quiser adicionar essa validação depois, é uma mudança de escopo pequena e isolada.
- **Erro ao salvar (falha de rede/servidor):** modal permanece aberto, botão "Salvar" sai do loading, mensagem de erro aparece acima dos botões: "Não foi possível salvar. Tente novamente." (13px, `#A32D2D`).
- **Excluir o Conteúdo pai enquanto o modal de Tópico está aberto (edge case de concorrência):** fora de escopo para o MVP — o sistema não precisa tratar edição concorrente entre admins em tempo real; se a submissão falhar por essa razão, cai no caso genérico de "erro ao salvar" acima.
- **Fechar o modal com alterações não salvas:** não pede confirmação extra no MVP (diferente de um formulário longo como o de Questão) — dado que é só 1–2 campos, o custo de perder o rascunho é baixo o suficiente para não justificar mais uma camada de confirmação.

---

## Informações exibidas por modo

### Modo Conteúdo — criar
- Campo Nome vazio, placeholder de exemplo

### Modo Conteúdo — editar
- Campo Nome preenchido com o valor atual

### Modo Tópico — criar (a partir de um card específico)
- Campo Nome vazio; campo Conteúdo pré-selecionado e travado

### Modo Tópico — editar
- Campo Nome preenchido; campo Conteúdo preenchido com o valor atual e editável

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
| --- | --- |
| [[Analise_do_Sistema#5.3 topics (tópicos — nível específico)\|5.3]] | Todo Tópico pertence a exatamente 1 Conteúdo — base do campo "Conteúdo" obrigatório no modo Tópico |
| [[Analise_do_Sistema#^rn15\|RN15]] | Painel único sem distinção de papéis — qualquer admin pode criar/editar Conteúdos e Tópicos |
| [[Analise_do_Sistema#^rn16\|RN16]] | Tópico vinculado a uma questão deve pertencer a um dos Conteúdos já vinculados à mesma questão — motivo pelo qual mover um Tópico de Conteúdo (ao editar) pode quebrar essa validação em questões já cadastradas; **recomendação para o agente:** ao trocar o Conteúdo de um Tópico que já tem questões vinculadas, avaliar se vale um aviso adicional (não coberto nesta spec — sinalizar como ponto em aberto para o time revisar) |

## Pendências identificadas neste componente

1. **Validação de unicidade de nome:** não definida em nenhum documento-fonte (ver seção "Comportamento em casos especiais" acima) — recomendação de não bloquear no MVP, mas fica como decisão em aberto para o time confirmar.
2. **Troca de Conteúdo de um Tópico com questões já vinculadas (RN16):** o impacto dessa ação sobre questões existentes não foi coberto na sessão de grill-me nem em nenhum outro documento — recomenda-se validar com o time antes da implementação final.
