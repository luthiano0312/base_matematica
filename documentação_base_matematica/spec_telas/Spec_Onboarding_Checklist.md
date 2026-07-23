# Onboarding — Checklist de Interesses (etapa 2 de 2) — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Onboarding — Boas-vindas (1 de 2)
   ↓
Onboarding — Checklist (2 de 2)
   ├── clique em "Voltar" ─────────────────→ Onboarding — Boas-vindas (1 de 2)
   ├── clique em "pular por enquanto" ─────→ Dashboard (sem interesses marcados)
   └── clique em "Continuar" ──────────────→ Dashboard (com interesses marcados, se houver)
```

Segunda e última etapa do Onboarding. Coleta o checklist opcional de Conteúdos de interesse (RN12). Ao final desta etapa, o usuário chega ao Dashboard. Ver [[Analise_do_Sistema#^rn19|RN19]] para regras de proteção de acesso direto a esta tela.

---

## Campos / Componentes

### Barra de progresso
- **Tipo:** indicador visual (progress bar + texto "2 de 2")
- **Comportamento:** mostra 100% preenchido, indicando a última etapa do onboarding.

### Texto de instrução
- **Tipo:** texto estático
- **Conteúdo:** título "Quais conteúdos gostaria de aprender?" e subtítulo "Isso nos ajuda a sugerir quais exercícios você deve fazer."

### Lista de itens de conteúdo (checklist)
- **Tipo:** seleção múltipla (multi-select), um item por Conteúdo cadastrado
- **Obrigatório?** Não — é opcional, conforme [[Analise_do_Sistema#^rn12|RN12]]. O usuário pode avançar sem marcar nenhum item.
- **Depende de outro campo?** Não
- **Comportamento:** cada item tem um ícone e o nome do Conteúdo. Ao tocar/clicar, o item alterna entre selecionado/não selecionado. **Decisão fechada:** item selecionado usa a cor de destaque **azul primário (`#258BFC`)**, consistente com o papel dessa cor na identidade visual (ação do usuário, não feedback de acerto).
- **Origem dos dados — decisão fechada:** a lista de itens é **dinâmica**, vinda da tabela `contents` (cadastrada pela equipe de conteúdo via painel administrativo, conforme [[Analise_do_Sistema#^rn15|RN15]]). Os itens do protótipo (Frações, Porcentagem, etc.) são apenas exemplo/mock, não uma lista fixa.
- **Paginação — decisão fechada:** a lista usa paginação do tipo **"mostrar mais"** para comportar um número maior de conteúdos cadastrados sem gerar uma lista longa demais na tela.
- **Persistência:** cada item marcado gera um registro em `user_interests` (user_id + content_id), conforme [[Analise_do_Sistema#5.9 user_interests (interesses do aluno)]].

### Botão "Continuar"
- **Tipo:** botão de ação primária
- **Comportamento:** salva os interesses marcados (pode ser zero ou mais) e navega para o Dashboard. Não bloqueia o avanço mesmo sem seleção, já que o checklist é opcional (RN12/RN13).

### Botão "Voltar"
- **Tipo:** botão de navegação secundário
- **Comportamento:** retorna para a etapa 1 de 2 (Boas-vindas). Seleções já marcadas nesta tela devem ser preservadas ao voltar/avançar novamente (comportamento esperado; não confirmado explicitamente pelo protótipo).

### Link/botão "pular por enquanto"
- **Tipo:** ação secundária de skip
- **Comportamento:** pula a seleção de interesses e navega direto para o Dashboard, sem marcar nenhum conteúdo. Funcionalmente equivalente a clicar em "Continuar" sem marcar nada — conforme [[Analise_do_Sistema#^rn13|RN13]], a experiência é a mesma nos dois casos (sem filtro/priorização de conteúdo).

---

## Comportamento em casos especiais

- **Nenhum item selecionado:** permitido — segue RN13, experiência igual à de quem não tem interesses marcados (fallback em cascata de RF12: desempenho > conteúdo aleatório).
- **Todos ou muitos itens selecionados — decisão fechada:** permitido, **sem limite máximo**. Risco conhecido e aceito: quanto mais itens marcados, menos discriminativo fica o sorteio aleatório do RF12 entre interesses (documentado como trade-off consciente em [[Pendencias]]).
- **Edição posterior:** este checklist pode ser reaberto/editado depois pelo perfil do aluno, sem precisar refazer o onboarding, conforme [[Analise_do_Sistema#^rn14|RN14]] (tela de Perfil ainda não especificada — ver [[Spec_Dashboard#Pendências identificadas nesta tela|Spec_Dashboard, item 1]]).
- **Falha ao salvar (erro de rede):** não definido no protótipo — não bloqueia o MVP.
- **Acesso direto à URL do Onboarding — decisão fechada (RN19):** sem sessão ativa, redireciona para Home; com sessão ativa que já completou o onboarding anteriormente, redireciona para Dashboard.

---

## Informações exibidas

### Estado inicial (nenhum item selecionado)
- Barra de progresso "2 de 2"
- Título e subtítulo de instrução
- Lista de itens de conteúdo (carregada dinamicamente de `contents`, com paginação "mostrar mais"), todos não selecionados
- Botões "Continuar", "Voltar" e "pular por enquanto"

### Estado com itens selecionados
- Mesma estrutura, com os itens marcados exibindo fundo/borda em azul primário (`#258BFC`).

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rn12\|RN12]] | Cadastro coleta dados obrigatórios; Onboarding pede checklist de Conteúdos de interesse, opcional |
| [[Analise_do_Sistema#^rn13\|RN13]] | Se o aluno não preencher o checklist, a experiência é igual à de quem não marcou nenhum item |
| [[Analise_do_Sistema#^rn14\|RN14]] | Checklist de interesses é editável depois via tela/modal no perfil, sem limite de seleção |
| [[Analise_do_Sistema#^rn15\|RN15]] | Conteúdo é cadastrado via painel administrativo, único, sem distinção de papéis |
| [[Analise_do_Sistema#^rn19\|RN19]] | Proteção de acesso direto ao Onboarding |
| [[Analise_do_Sistema#^rf10\|RF10]] | Sistema deve oferecer onboarding com checklist opcional de Conteúdos de interesse |
| [[Analise_do_Sistema#^rf12\|RF12]] | Sistema deve priorizar/filtrar questões e conteúdo recomendado com base nos interesses marcados |

---

## Pendências identificadas nesta tela

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]].
