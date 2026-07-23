# Dashboard — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Login (sucesso) / Onboarding — Checklist (Continuar ou pular)
   ↓
Dashboard
   ├── clique em "Questões" ─────────────→ Filtro de questões
   ├── clique em "Materiais de estudo" ──→ Materiais de Estudos (tela ainda não especificada)
   ├── clique no ícone de usuário ───────→ Perfil (tela ainda não especificada — ver Pendência 1)
   └── clique no ícone de menu ──────────→ Menu (conteúdo ainda não especificado — ver Pendência 1)
```

O Dashboard é a tela inicial do aluno autenticado, conforme [[Fluxo_de_Navegacao]]. É alimentada inteiramente por dados do usuário logado — não há versão "visitante" desta tela (visitante não tem Dashboard).

---

## Campos / Componentes

### Header
- **Tipo:** barra fixa no topo
- **Conteúdo:** logo, ícone de usuário, ícone de menu.
- **Comportamento:** ícone de usuário deve levar à tela de Perfil e ícone de menu deve abrir um menu — **nenhuma das duas telas está especificada ainda**. Decisão de time: a especificação fica para uma próxima rodada (ver Pendência 1). Nota: este menu é distinto do menu hambúrguer da Home (que já tem comportamento definido em [[Fluxo_de_Navegacao#Menu (ícone hambúrguer)]]) — o menu do header do Dashboard ainda não tem conteúdo definido.

### Saudação
- **Tipo:** texto dinâmico
- **Conteúdo:** "olá, {nome do aluno}!" + "Bom te ver de novo. Continue construindo sua base."
- **Comportamento:** `{nome do aluno}` vem do campo `name` de `users`.

### Card "Day Streak"
- **Tipo:** card informativo, com dado dinâmico
- **Conteúdo:** ícone de fogo, rótulo "Dias consecutivos", número do streak atual, texto de incentivo "Continue amanhã para não perder o seu streak", e uma ilustração decorativa à direita.
- **Comportamento:** exibe a sequência atual de dias consecutivos de estudo do aluno, calculada **on-the-fly** a partir de `answered_questions` (sem coluna dedicada em `users`), conforme [[Analise_do_Sistema#^rn18|RN18]]:
  - Conta dias distintos com pelo menos 1 questão respondida (independente de acerto ou erro).
  - Corte de dia à meia-noite, horário de Brasília.
  - Zera para 0 se o aluno ficar um dia inteiro sem nenhuma atividade registrada.
  - Sem tolerância/perdão de dias no MVP.
- O protótipo Figma precisa ser atualizado para incluir o número do streak no card (hoje mostra só a ilustração decorativa).

### Card "Pontos acumulados"
- **Tipo:** card informativo, com dado dinâmico
- **Conteúdo:** ícone de estrela, rótulo "Pontos acumulados", número grande com o total de pontos, texto de incentivo "Responda questões para ganhar mais pontos."
- **Comportamento:** exibe a soma de `points_earned` de todas as tentativas do aluno em `answered_questions`, conforme [[Analise_do_Sistema#^rf09|RF09]].

### Seção "Estudos" — atalho "Questões"
- **Tipo:** botão/atalho de navegação
- **Conteúdo:** ícone, título "Questões", subtítulo "Pratique com exercícios", seta indicando navegação.
- **Comportamento:** navega para a tela de Filtro de questões.

### Seção "Estudos" — atalho "Materiais de estudo"
- **Tipo:** botão/atalho de navegação
- **Conteúdo:** ícone, título "Materiais de estudo", subtítulo "Leia a teoria e revise conceitos", seta indicando navegação.
- **Comportamento:** navega para a tela de Materiais de Estudos. Essa tela **ainda não tem estrutura definida**, conforme nota explícita em [[Fluxo_de_Navegacao#Materiais de Estudos]].

### Seção "Desempenho" — card "Questões respondidas"
- **Tipo:** card com dado dinâmico
- **Conteúdo:** número total + rótulo "QUESTÕES RESPONDIDAS".
- **Comportamento:** conta o total de registros do aluno em `answered_questions` (histórico total, diferente dos contadores de sessão da tela de Questão — ver [[Spec_Questao#Cabeçalho de progresso da sessão]]).

### Seção "Desempenho" — cards "Acertos" / "Erros"
- **Tipo:** dois cards lado a lado, com dado dinâmico
- **Conteúdo:** número de acertos (verde) e número de erros (vermelho).
- **Comportamento:** conta registros de `answered_questions` com `is_correct = true` / `false` para o aluno.

### Seção "Desempenho" — card "Percentual de acertos"
- **Tipo:** card com dado dinâmico + barra de progresso visual
- **Conteúdo:** percentual calculado + rótulo "PERCENTUAL DE ACERTOS" + barra preenchida proporcionalmente.
- **Comportamento:** `acertos / questões respondidas`, arredondado. **Se o aluno não respondeu nenhuma questão ainda, o card exibe o texto "Sem dados ainda" no lugar do percentual e da barra** (evita divisão por zero — decisão fechada, ver antiga Pendência 3).

### Seção "Desempenho" — card "Tópico com mais acertos"
- **Tipo:** card com dado dinâmico
- **Conteúdo:** rótulo "Tópico com mais acertos" + nome do tópico + contagem de acertos naquele tópico (ex: "Frações — 14 acertos").
- **Comportamento:** tópico (`topics`) com maior número de tentativas corretas do aluno. **Se o aluno ainda não tiver nenhum acerto registrado (mesmo que já tenha tentativas), o card exibe "Sem dados ainda"** (decisão fechada, ver antiga Pendência 4).

> **Nota:** o card "sugestão de próximo conteúdo para estudar", previsto em versão anterior de [[Fluxo_de_Navegacao#Dashboard]], foi **descartado definitivamente** — não faz parte do MVP. A lógica de recomendação (RF12) permanece implementada para uso em outras partes do sistema (ex: fallback de conteúdo no Filtro).

---

## Comportamento em casos especiais

- **Aluno novo, sem nenhuma tentativa registrada:** cards de "Percentual de acertos" e "Tópico com mais acertos" exibem "Sem dados ainda"; "Questões respondidas", "Acertos" e "Erros" exibem 0 normalmente; Day Streak exibe 0.
- **Streak zerado (aluno não estuda há mais de 1 dia):** ver RN18 — o card simplesmente reflete 0, calculado on-the-fly, sem estado especial adicional de UI necessário.
- **Carregamento dos dados:** não há estado de loading definido no protótipo (tela estática) — segue como pendência de implementação, não bloqueia o MVP.
- **Erro ao carregar dados do usuário:** não definido no protótipo — segue como pendência de implementação, não bloqueia o MVP.

---

## Informações exibidas

### Estado padrão (aluno com histórico de respostas)
- Nome do aluno na saudação
- Streak de dias consecutivos (número calculado on-the-fly, ver RN18)
- Total de pontos acumulados
- Atalhos para Questões e Materiais de estudo
- Total de questões respondidas
- Total de acertos e erros
- Percentual de acertos com barra visual
- Tópico com mais acertos e sua contagem

### Estado "aluno novo" (sem tentativas registradas)
- Mesma estrutura de cards; "Percentual de acertos" e "Tópico com mais acertos" mostram "Sem dados ainda"; demais campos numéricos mostram 0.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf09\|RF09]] | Sistema deve exibir pontuação total acumulada do aluno |
| [[Analise_do_Sistema#^rn07\|RN07]] | Pontuação por dificuldade é fixa no código |
| [[Analise_do_Sistema#^rn08\|RN08]] a [[Analise_do_Sistema#^rn11\|RN11]] | Regras de cálculo de pontos e histórico de tentativas |
| [[Analise_do_Sistema#^rn18\|RN18]] | Cálculo do Day Streak |

---

## Pendências identificadas nesta tela

1. **Telas de Perfil e Menu não especificadas:** o header do Dashboard tem ícones de usuário e menu sem nenhuma tela associada no protótipo. A edição de interesses (RN14) provavelmente vive na tela de Perfil. **Decisão do time (22/07/2026):** especificação fica para uma próxima rodada — não bloqueia o restante do MVP, mas RN14 fica sem uma tela definida até lá.
