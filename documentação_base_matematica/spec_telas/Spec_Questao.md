# Questão — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

> ⚠️ **Aviso sobre o protótipo:** o Figma segue mostrando apenas o estado de múltipla escolha ainda não respondida como referência visual completa. Os demais estados descritos abaixo (feedback pós-resposta, certo/errado, dissertativa, encerramento) foram **decididos em sessão de revisão de time (22/07/2026)**, mas ainda **precisam ser desenhados no Figma** antes da implementação — a decisão de comportamento está fechada, a referência visual pixel-a-pixel ainda não existe para esses estados.

## Fluxo da tela

```
Filtro de Questões ("Continuar")
   ↓
Questão (1 de N)
   ├── seleciona alternativa/resposta + "Responder" ──→ alternativa correta destacada
   │                                                        ├── "Ver resolução" ──→ vídeo (ou "vídeo indisponível") + resolução em texto
   │                                                        └── "Próxima questão" ──→ Questão (2 de N)
   │                                                        ... até a última questão do conjunto (N de N)
   ↓
Fim do conjunto de questões → Modal de encerramento (total respondidas, acertos, erros, pontos)
   ↓
[aluno logado] Dashboard / [visitante] Cadastro (após a 6ª questão, ver RN04)
```

Para o **visitante** (sem login), esta mesma tela é reaproveitada com restrições de [[Analise_do_Sistema#^rn04|RN04]]: 6 questões fixas por tópico (2 fáceis, 2 médias, 2 difíceis, ou o total disponível quando insuficiente), sem vídeo de resolução, contadores em estado local (resetam ao sair), e redirecionamento para Cadastro após responder a última questão do lote.

---

## Campos / Componentes

### Cabeçalho de progresso da sessão
- **Tipo:** indicadores de estado (não interativos)
- **Conteúdo:** "questões respondidas: N", "acertos: N", "erros: N" (badges coloridos) e "questão X de N" (posição atual dentro do conjunto filtrado).
- **Comportamento — decisão fechada:** os contadores refletem a **sessão atual** (o lote filtrado), não o histórico total do aluno. A tela deve exibir o rótulo explícito **"sessão atual"** junto a esses contadores, para não confundir com o card de desempenho do Dashboard (histórico total — ver [[Spec_Dashboard]]). Para o visitante, conforme RN04, esses contadores existem apenas em estado local/sessão e são resetados ao sair, sem persistir em `answered_questions`.

### Enunciado da questão
- **Tipo:** texto (renderizado via KaTeX quando contém expressões matemáticas, conforme [[Identidade_Visual#4.1 Uso Funcional — KaTeX]] e [[Analise_do_Sistema#^rnf04|RNF04]])
- **Comportamento:** exibe o campo `statement` da questão (`questions`). Tipografia usa a fonte matemática (Latin Modern), tamanho mínimo 18–20px para fórmulas (RNF06).

### Área de resposta — Múltipla escolha
- **Tipo:** lista de alternativas selecionáveis (seleção única)
- **Obrigatório?** Sim, uma alternativa deve estar selecionada para habilitar "Responder".
- **Comportamento:** cada alternativa é um bloco clicável (ex: "a) 42"). Ao clicar, deve indicar visualmente que está selecionada — o protótipo mostra apenas o estado sem seleção. *(Não perguntado explicitamente na sessão de revisão; por consistência com o mesmo padrão de design aplicado ao Checklist do Onboarding e ao campo "Tipo de questão" do Filtro, a recomendação é usar azul primário `#258BFC` também aqui — mas isso ainda precisa de confirmação explícita do time antes de fechar.)*
- **Ícone de tesoura ao lado de cada alternativa — decisão fechada:** ferramenta de **eliminação de alternativa** (estratégia de eliminação). É puramente **cosmética/client-side**, sem nenhuma persistência em banco — o estado de "eliminada" existe só na sessão do navegador.

### Área de resposta — Certo ou errado
- **Tipo:** decisão fechada — 2 botões grandes: **"Certo"** e **"Errado"**
- **Comportamento (RF04):** apresenta a afirmação (no próprio enunciado) e os dois botões, com correção automática. Ainda precisa ser desenhado no Figma (comportamento já definido, visual pixel-a-pixel pendente).

### Área de resposta — Dissertativa
- **Tipo:** decisão fechada — campo de texto livre + fluxo de autoavaliação
- **Comportamento (RF05):**
  1. O aluno digita a resposta livremente no campo de texto.
  2. Clica em **"Ver resolução"**.
  3. O sistema exibe a resolução em texto (`text_resolution`) para comparação.
  4. Aparecem os botões **"Acertei"** / **"Errei"** para o aluno se autoavaliar.
  5. A autoavaliação gera um registro normal em `answered_questions` (com `is_correct` definido pela escolha do aluno), pontuando igual às demais questões (RN07–RN10), **sem** nenhuma coluna que diferencie correção automática de autoavaliação.
  - **Risco conhecido e aceito:** por não haver validação real da resposta, existe possibilidade de auto-inflação de pontos. Decisão consciente do time: aceitável no MVP dado o volume esperado de questões dissertativas ser baixo (ver [[Pendencias]]).
- Ainda precisa ser desenhado no Figma.

### Botão "Responder"
- **Tipo:** botão de ação primária
- **Comportamento:** submete a resposta atual (alternativa marcada, certo/errado escolhido). Para dissertativa, a "resposta" não passa por este botão — o fluxo usa "Ver resolução" seguido de "Acertei"/"Errei" (ver acima). Cria um novo registro em `answered_questions` (RN11 — nunca atualiza registro anterior), calcula `is_correct` e `points_earned` conforme as regras de redenção (RN08–RN10), e em seguida exibe o estado de feedback. Para o visitante, essa tentativa **não é persistida** (RN04).

### Estado de feedback (pós-resposta) — decisão fechada
- **Comportamento:**
  - A alternativa correta é destacada visualmente (múltipla escolha) — ou o resultado Certo/Errado é indicado (certo/errado) — ou o resultado da autoavaliação é registrado (dissertativa).
  - Dois botões: **"Próxima questão"** e **"Ver resolução"**.
  - Ao clicar em "Ver resolução": exibe, na mesma tela, abaixo das alternativas, primeiro o **vídeo de resolução** (`video_resolution_url`) — ou o texto **"Vídeo indisponível"** quando a questão não tiver URL cadastrada — seguido da **resolução em texto** (`text_resolution`) logo abaixo.
  - Vídeo **oculto/bloqueado para o visitante**, conforme RN04 (mesmo se a questão tiver `video_resolution_url` cadastrada).
  - Ainda precisa ser desenhado no Figma.

### Modal de encerramento do conjunto de questões — decisão fechada
- **Tipo:** modal, exibido ao concluir a última questão do lote (posição N de N)
- **Conteúdo:** total de questões respondidas, acertos, erros e total de pontos ganhos naquele lote.
- **Comportamento após fechar o modal:**
  - Aluno logado → Dashboard.
  - Visitante → redirecionamento para a tela de Cadastro (ver [[Analise_do_Sistema#^rn04|RN04]]).
- Ainda precisa ser desenhado no Figma.

---

## Comportamento em casos especiais

- **Refazer questão já errada e acertar:** ganha pontuação fixa de 5 pontos, independente da dificuldade (RN09). Aplica-se também à dissertativa autoavaliada.
- **Refazer questão já acertada:** não ganha pontos adicionais, independente do resultado (RN10). Aplica-se também à dissertativa autoavaliada.
- **Errar pela primeira vez:** não ganha nem perde pontos (RN08).
- **Última questão do conjunto respondida — decisão fechada:** exibe o modal de encerramento (ver acima).
- **Visitante ao terminar a última questão do lote — decisão fechada:** o gatilho do redirecionamento é **imediatamente após responder a 6ª (última) questão** do lote fixo, via o modal de encerramento. O visitante pode fechar a aba a qualquer momento antes disso sem nenhuma penalidade (nada acontece), e pode voltar ao Filtro para responder novos lotes de 6 com outros filtros, indefinidamente — decisão consciente de produto, não lacuna (ver [[Analise_do_Sistema#^rn04|RN04]]).
- **Questão sem vídeo de resolução cadastrado — decisão fechada:** exibe o texto "Vídeo indisponível" no espaço reservado ao vídeo, em vez de ocultar o espaço.

---

## Informações exibidas

### Estado "questão não respondida"
- Contadores de sessão: respondidas, acertos, erros (com rótulo "sessão atual")
- Posição atual ("questão X de N")
- Enunciado da questão
- Área de resposta (múltipla escolha / certo-errado / dissertativa, conforme o tipo)
- Botão "Responder" (múltipla escolha e certo/errado) ou fluxo "Ver resolução" → "Acertei"/"Errei" (dissertativa)

### Estado "questão respondida" (feedback)
- Indicação de acerto/erro
- Botões "Próxima questão" e "Ver resolução"
- Ao expandir "Ver resolução": vídeo de resolução (ou "Vídeo indisponível") + resolução em texto

### Estado "fim do conjunto de questões"
- Modal com total de questões respondidas, acertos, erros, pontos ganhos no lote
- Redirecionamento: Dashboard (logado) ou Cadastro (visitante)

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rn04\|RN04]] | Restrições da tela de questões para o visitante, incluindo gatilho de redirecionamento e regra de fallback por insuficiência de questões |
| [[Analise_do_Sistema#^rn05\|RN05]] | Toda questão tem dificuldade obrigatória |
| [[Analise_do_Sistema#^rn07\|RN07]] | Pontuação fixa por dificuldade (fácil=10, médio=15, difícil=20) |
| [[Analise_do_Sistema#^rn08\|RN08]] | Primeira resposta: acerto ganha pontos cheios; erro não pontua (inclui dissertativa autoavaliada) |
| [[Analise_do_Sistema#^rn09\|RN09]] | Refazer questão errada e acertar: +5 pontos fixos (inclui dissertativa autoavaliada) |
| [[Analise_do_Sistema#^rn10\|RN10]] | Refazer questão já acertada: sem pontos adicionais (inclui dissertativa autoavaliada) |
| [[Analise_do_Sistema#^rn11\|RN11]] | Cada resposta gera novo registro, histórico preservado |
| [[Analise_do_Sistema#^rf04\|RF04]] | Correção automática para múltipla escolha e certo/errado |
| [[Analise_do_Sistema#^rf05\|RF05]] | Dissertativa: campo livre + "Ver resolução" + autoavaliação "Acertei"/"Errei", gerando registro normal |
| [[Analise_do_Sistema#^rf07\|RF07]] | Registrar cada tentativa como novo registro |
| [[Analise_do_Sistema#^rf08\|RF08]] | Calcular pontuação de cada tentativa |
| [[Analise_do_Sistema#^rnf04\|RNF04]] | Fórmulas renderizadas via KaTeX |
| [[Analise_do_Sistema#^rnf06\|RNF06]] | Tamanho mínimo de expressões matemáticas: 18–20px |
| [[Analise_do_Sistema#^rnf07\|RNF07]] | Vídeos hospedados externamente (YouTube), sistema guarda só a URL |

---

## Pendências identificadas nesta tela

1. **Referência visual no Figma:** todos os comportamentos desta tela foram decididos textualmente (sessão de revisão de 22/07/2026), mas os estados de feedback, certo/errado, dissertativa e o modal de encerramento **ainda precisam ser desenhados no protótipo** antes da implementação em código.
2. **Estado visual de "alternativa selecionada" (múltipla escolha):** ainda não confirmado explicitamente pelo time — a spec assume por consistência a mesma cor azul primária (`#258BFC`) usada em outras telas, mas isso precisa de confirmação antes de fechar.
