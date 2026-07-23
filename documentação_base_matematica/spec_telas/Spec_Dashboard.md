# Dashboard — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Login (sucesso) / Onboarding — Checklist (Continuar ou pular)
   ↓
Dashboard
   ├── clique em "Questões" ─────────────→ Filtro de questões
   ├── clique em "Materiais de estudo" ──→ Materiais de Estudos (tela ainda não especificada)
   ├── clique no ícone de usuário ───────→ Perfil (tela não desenhada no protótipo)
   └── clique no ícone de menu ──────────→ Menu (conteúdo não desenhado no protótipo)
```

O Dashboard é a tela inicial do aluno autenticado, conforme [[Fluxo_de_Navegacao]]. É alimentada inteiramente por dados do usuário logado — não há versão "visitante" desta tela (visitante não tem Dashboard).

---

## Campos / Componentes

### Header
- **Tipo:** barra fixa no topo
- **Conteúdo:** logo, ícone de usuário, ícone de menu.
- **Comportamento:** ícone de usuário deve levar à tela de Perfil (não especificada neste protótipo — ver Pendência 1). Ícone de menu abre um menu cujo conteúdo não está definido no protótipo (mesma pendência já registrada em [[Spec_Home]]).

### Saudação
- **Tipo:** texto dinâmico
- **Conteúdo:** "olá, {nome do aluno}!" + "Bom te ver de novo. Continue construindo sua base."
- **Comportamento:** `{nome do aluno}` vem do campo `name` de `users`.

### Card "Day Streak"
- **Tipo:** card informativo, com dado dinâmico
- **Conteúdo:** ícone de fogo, rótulo "Dias consecutivos", texto de incentivo "Continue amanhã para não perder o seu streak", e uma ilustração decorativa à direita.
- **Comportamento:** deve exibir a sequência atual de dias consecutivos de estudo do aluno. **O protótipo não mostra o número de dias em lugar nenhum do card** — apenas uma ilustração decorativa. Ver Pendência 2, que é crítica: não há nenhuma regra de negócio no sistema definindo como o streak é calculado, incrementado ou zerado.

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
- **Comportamento:** conta o total de registros do aluno em `answered_questions`.

### Seção "Desempenho" — cards "Acertos" / "Erros"
- **Tipo:** dois cards lado a lado, com dado dinâmico
- **Conteúdo:** número de acertos (verde) e número de erros (vermelho).
- **Comportamento:** conta registros de `answered_questions` com `is_correct = true` / `false` para o aluno.

### Seção "Desempenho" — card "Percentual de acertos"
- **Tipo:** card com dado dinâmico + barra de progresso visual
- **Conteúdo:** percentual calculado + rótulo "PERCENTUAL DE ACERTOS" + barra preenchida proporcionalmente.
- **Comportamento:** `acertos / questões respondidas`, arredondado. Se o aluno não respondeu nenhuma questão ainda, o cálculo resulta em divisão por zero — ver Pendência 3.

### Seção "Desempenho" — card "Tópico com mais acertos"
- **Tipo:** card com dado dinâmico
- **Conteúdo:** rótulo "Tópico com mais acertos" + nome do tópico + contagem de acertos naquele tópico (ex: "Frações — 14 acertos").
- **Comportamento:** tópico (`topics`) com maior número de tentativas corretas do aluno. Ver Pendência 4 sobre o que exibir se o aluno ainda não tiver nenhum acerto.

---

## Comportamento em casos especiais

- **Aluno novo, sem nenhuma tentativa registrada:** todos os cards de desempenho (questões respondidas, acertos, erros, percentual, tópico com mais acertos) precisam de um estado "zerado" bem definido — o protótipo só mostra o estado com dados (48 respondidas, 36 acertos, 12 erros, 75%, Frações). Ver Pendências 3 e 4.
- **Streak zerado (aluno não estuda há mais de 1 dia):** comportamento não definido — nem a regra de cálculo do streak está documentada em nenhum lugar (ver Pendência 2).
- **Carregamento dos dados:** não há estado de loading definido no protótipo (tela estática).
- **Erro ao carregar dados do usuário:** não definido no protótipo.

---

## Informações exibidas

### Estado padrão (aluno com histórico de respostas)
- Nome do aluno na saudação
- Streak de dias consecutivos (visual apenas — sem número definido, ver Pendência 2)
- Total de pontos acumulados
- Atalhos para Questões e Materiais de estudo
- Total de questões respondidas
- Total de acertos e erros
- Percentual de acertos com barra visual
- Tópico com mais acertos e sua contagem

### Estado "aluno novo" (sem tentativas registradas) — não coberto pelo protótipo
- Mesma estrutura de cards, mas com valores zerados/placeholder — comportamento a ser definido (ver Pendências 3 e 4).

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf09\|RF09]] | Sistema deve exibir pontuação total acumulada do aluno |
| [[Analise_do_Sistema#^rn07\|RN07]] | Pontuação por dificuldade é fixa no código |
| [[Analise_do_Sistema#^rn08\|RN08]] a [[Analise_do_Sistema#^rn11\|RN11]] | Regras de cálculo de pontos e histórico de tentativas |

---

## Pendências identificadas nesta tela

1. **Telas de Perfil e Menu não especificadas:** o header do Dashboard tem ícones de usuário e menu sem nenhuma tela associada no protótipo. A edição de interesses (RN14) provavelmente vive na tela de Perfil — que ainda não existe como spec.
2. **Streak sem regra de negócio (crítico):** o card "Day Streak" é puramente visual no protótipo (nenhum número de dias aparece) e **não há nenhuma RN/RF em [[Analise_do_Sistema]] definindo como o streak é calculado, incrementado, ou zerado** (ex: o que conta como "um dia de estudo"? Precisa responder pelo menos 1 questão? Existe timezone/corte de meia-noite?). Essa é uma funcionalidade de gamificação citada tanto na [[Arquitetura]] (pontuação básica no MVP) quanto no [[Fluxo_de_Navegacao]], mas sem regra formal. Recomenda-se registrar isso como pendência formal em [[Pendencias]] antes de implementar.
3. **Divisão por zero no percentual de acertos:** para um aluno sem nenhuma tentativa, o cálculo de "percentual de acertos" precisa de tratamento explícito (exibir 0% ou "—", em vez de erro).
4. **Estado vazio do card "Tópico com mais acertos":** não definido o que exibir quando o aluno ainda não tem nenhum acerto registrado (card vazio, oculto, ou mensagem tipo "responda questões para ver seu progresso").
5. **Card "sugestão de próximo conteúdo" ausente:** [[Fluxo_de_Navegacao#Dashboard]] lista "sugestão de próximo conteúdo para estudar" como parte do card de desempenho, mas esse elemento **não aparece no protótipo Figma**. Confirmar se foi descartado ou se ainda deve ser incluído (isso se conecta à lógica de RF12).
