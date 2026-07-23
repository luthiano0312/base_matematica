# Questão — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

> ⚠️ **Aviso importante sobre esta spec:** o protótipo Figma mostra **apenas um único estado** desta tela: uma questão de **múltipla escolha**, **ainda não respondida**. Não há telas prototipadas para: questão do tipo certo/errado, questão dissertativa, o estado de feedback após responder (acerto/erro), a exibição da resolução em texto, o acesso ao vídeo de resolução, nem a navegação para a próxima questão. Essas partes desta spec foram inferidas a partir de [[Analise_do_Sistema]] e estão claramente marcadas como tal — **precisam de validação visual antes da implementação**, não apenas de aprovação textual.

## Fluxo da tela

```
Filtro de Questões ("Continuar")
   ↓
Questão (1 de N)
   ├── seleciona alternativa/resposta + "Responder" ──→ mostra feedback (correto/errado) [não prototipado]
   │                                                        ↓
   │                                                    Próxima questão (2 de N) [navegação não prototipada]
   │                                                        ↓
   │                                                    ... até a última questão do conjunto (N de N)
   ↓
Fim do conjunto de questões → [tela/resumo de encerramento não prototipado — ver Pendência 1]
```

Para o **visitante** (sem login), esta mesma tela é reaproveitada com restrições de [[Analise_do_Sistema#^rn04|RN04]]: 6 questões fixas por tópico (2 fáceis, 2 intermediárias, 2 difíceis), sem vídeo de resolução, contadores em estado local (resetam ao sair), e redirecionamento para Cadastro/Login após responder.

---

## Campos / Componentes

### Cabeçalho de progresso da sessão
- **Tipo:** indicadores de estado (não interativos)
- **Conteúdo:** "questões respondidas: N", "acertos: N", "erros: N" (badges coloridos) e "questão X de N" (posição atual dentro do conjunto filtrado).
- **Comportamento:** os contadores de acertos/erros/respondidas se referem ao conjunto de questões da sessão atual de estudo (não fica claro se é o total histórico do aluno ou apenas o lote corrente — ver Pendência 2). Para o visitante, conforme RN04, esses contadores existem apenas em estado local/sessão e são resetados ao sair, sem persistir em `answered_questions`.

### Enunciado da questão
- **Tipo:** texto (renderizado via KaTeX quando contém expressões matemáticas, conforme [[Identidade_Visual#4.1 Uso Funcional — KaTeX]] e [[Analise_do_Sistema#^rnf04|RNF04]])
- **Comportamento:** exibe o campo `statement` da questão (`questions`). Tipografia usa a fonte matemática (Latin Modern), tamanho mínimo 18–20px para fórmulas (RNF06).

### Área de resposta — Múltipla escolha
- **Tipo:** lista de alternativas selecionáveis (seleção única)
- **Obrigatório?** Sim, uma alternativa deve estar selecionada para habilitar "Responder".
- **Comportamento:** cada alternativa é um bloco clicável (ex: "a) 42"). Ao clicar, deve indicar visualmente que está selecionada — **o protótipo mostra apenas o estado sem seleção**, não há um estado "alternativa selecionada" desenhado (ver Pendência 3).
- **Ícone de tesoura ao lado de cada alternativa:** presente no protótipo (`ri:scissors-fill`) ao lado de cada opção, mas sua função não está documentada em nenhum lugar. Hipótese: uma ferramenta de "descartar/eliminar alternativa" (estratégia de eliminação, comum em provas), mas isso **precisa ser confirmado** antes de implementar — ver Pendência 4.

### Área de resposta — Certo ou errado
- **Tipo:** não prototipado
- **Comportamento (inferido de [[Analise_do_Sistema#3.1 Requisitos Funcionais|RF04]]):** deve apresentar a afirmação (no próprio enunciado) e dois botões/opções de resposta — "Certo" e "Errado" — com correção automática. **Layout visual não definido** — ver Pendência 5.

### Área de resposta — Dissertativa
- **Tipo:** não prototipado
- **Comportamento (inferido de [[Analise_do_Sistema#^rf05|RF05]]):** deve conter um campo de texto livre para o aluno escrever sua resposta, e um botão para exibir a explicação/resolução (`text_resolution`) para autoavaliação — sem correção automática pelo sistema. **Layout visual não definido** — ver Pendência 5.

### Botão "Responder"
- **Tipo:** botão de ação primária
- **Comportamento:** submete a resposta atual (alternativa marcada, certo/errado escolhido, ou o fato de o aluno ter revelado a resolução da dissertativa). Cria um novo registro em `answered_questions` (RN11 — nunca atualiza registro anterior), calcula `is_correct` e `points_earned` conforme as regras de redenção (RN08–RN10), e deve then exibir o estado de feedback. Para o visitante, essa tentativa **não é persistida** (RN04).

### Estado de feedback (pós-resposta) — não prototipado
- **Tipo:** inferido, não desenhado no Figma
- **Comportamento esperado:**
  - Indicar visualmente se a resposta foi correta ou incorreta (ex: destaque verde/vermelho na alternativa escolhida e na correta, se diferente).
  - Exibir a resolução em texto (`text_resolution`).
  - Exibir/link para o vídeo de resolução (`video_resolution_url`, hospedado no YouTube conforme [[Analise_do_Sistema#^rnf07|RNF07]]) — **oculto/bloqueado para o visitante**, conforme RN04.
  - Botão para avançar para a próxima questão do conjunto.
- Ver Pendência 1 — nenhuma tela cobre esse estado.

---

## Comportamento em casos especiais

- **Refazer questão já errada e acertar:** ganha pontuação fixa de 5 pontos, independente da dificuldade (RN09).
- **Refazer questão já acertada:** não ganha pontos adicionais, independente do resultado (RN10).
- **Errar pela primeira vez:** não ganha nem perde pontos (RN08).
- **Última questão do conjunto respondida:** o que acontece a seguir (tela de resumo? volta ao Dashboard? repete o conjunto?) não está definido — ver Pendência 1.
- **Visitante ao tentar responder:** conforme RN04, o redirecionamento pós-resposta para Cadastro/Login "continua valendo" — ou seja, em algum momento do fluxo do visitante (provavelmente após ver o resultado/feedback), ele deve ser direcionado a criar conta ou entrar. O gatilho exato (imediatamente após responder? após terminar as 6 questões?) não está definido — ver Pendência 6.
- **Questão sem vídeo de resolução cadastrado:** `video_resolution_url` pode ser nulo — nesse caso, o botão/link de vídeo não deve aparecer (comportamento assumido, não confirmado no protótipo).

---

## Informações exibidas

### Estado "questão não respondida" (único estado prototipado)
- Contadores de sessão: respondidas, acertos, erros
- Posição atual ("questão X de N")
- Enunciado da questão
- Alternativas de resposta (para múltipla escolha)
- Botão "Responder"

### Estado "questão respondida" (feedback) — não prototipado
- Indicação de acerto/erro
- Resolução em texto
- Vídeo de resolução (se aluno logado e questão tiver vídeo cadastrado)
- Botão para avançar

### Estado "dissertativa revelada" — não prototipado
- Campo de resposta livre já preenchido pelo aluno
- Resolução em texto exibida para comparação
- Ação para o aluno se autoavaliar (correto/incorreto) — RF05 não especifica se isso gera algum registro de `is_correct`; ver Pendência 7.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rn04\|RN04]] | Restrições da tela de questões para o visitante |
| [[Analise_do_Sistema#^rn05\|RN05]] | Toda questão tem dificuldade obrigatória |
| [[Analise_do_Sistema#^rn07\|RN07]] | Pontuação fixa por dificuldade (fácil=10, intermediário=15, difícil=20) |
| [[Analise_do_Sistema#^rn08\|RN08]] | Primeira resposta: acerto ganha pontos cheios; erro não pontua |
| [[Analise_do_Sistema#^rn09\|RN09]] | Refazer questão errada e acertar: +5 pontos fixos |
| [[Analise_do_Sistema#^rn10\|RN10]] | Refazer questão já acertada: sem pontos adicionais |
| [[Analise_do_Sistema#^rn11\|RN11]] | Cada resposta gera novo registro, histórico preservado |
| [[Analise_do_Sistema#^rf04\|RF04]] | Correção automática para múltipla escolha e certo/errado |
| [[Analise_do_Sistema#^rf05\|RF05]] | Exibir explicação para dissertativa, sem correção automática |
| [[Analise_do_Sistema#^rf07\|RF07]] | Registrar cada tentativa como novo registro |
| [[Analise_do_Sistema#^rf08\|RF08]] | Calcular pontuação de cada tentativa |
| [[Analise_do_Sistema#^rnf04\|RNF04]] | Fórmulas renderizadas via KaTeX |
| [[Analise_do_Sistema#^rnf06\|RNF06]] | Tamanho mínimo de expressões matemáticas: 18–20px |
| [[Analise_do_Sistema#^rnf07\|RNF07]] | Vídeos hospedados externamente (YouTube), sistema guarda só a URL |

---

## Pendências identificadas nesta tela

> Esta é a tela com mais lacunas entre protótipo e regras de negócio — é o núcleo funcional da plataforma (RF04, RF05, RF07, RF08) e a maior parte dos seus estados não foi desenhada.

1. **Sem tela de encerramento do conjunto de questões:** não há definição do que acontece depois da última questão do lote (resumo de desempenho? volta ao Dashboard? repetir?).
2. **Escopo dos contadores do cabeçalho não confirmado:** "questões respondidas/acertos/erros" no topo da tela — não fica claro se são do conjunto atual (as N questões filtradas) ou do histórico total do aluno logado.
3. **Sem estado visual de "alternativa selecionada":** o protótipo mostra apenas alternativas não marcadas.
4. **Função do ícone de tesoura (✂️) ao lado das alternativas não documentada:** hipótese de "eliminar alternativa", mas precisa confirmação antes de implementar qualquer comportamento.
5. **Nenhum layout para os tipos "Certo ou errado" e "Dissertativa":** apenas múltipla escolha foi prototipada visualmente. Ambos os outros tipos precisam de tela própria antes da geração de código.
6. **Gatilho exato do redirecionamento do visitante para Cadastro/Login não definido:** RN04 confirma que existe, mas não especifica o momento (após cada resposta? só ao fim das 6 questões?).
7. **Autoavaliação da dissertativa não gera dado claro:** RF05 diz que "a avaliação fica a cargo do próprio aluno", mas não define se isso deveria gerar algum registro de acerto/erro em `answered_questions`, ou se essas tentativas ficam de fora do cálculo de pontuação e desempenho do Dashboard.
