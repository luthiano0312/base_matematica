# Filtro de Questões — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Dashboard (atalho "Questões")
   ↓
Filtro de Questões
   ├── clique em "Limpar filtro" ────→ reseta todos os campos (permanece na tela)
   └── clique em "Continuar" ────────→ Tela de Questão (com as questões filtradas)
```

Esta tela corresponde ao filtro do aluno logado, referenciado em [[Fluxo_de_Navegacao#Questões (usuário logado)]]. Para o **visitante**, o mesmo front-end é reaproveitado, mas com campos restritos — ver [[Analise_do_Sistema#^rn04|RN04]] e a seção "Comportamento em casos especiais" abaixo.

---

## Campos / Componentes

### Conteúdo
- **Tipo:** dropdown (seleção única)
- **Obrigatório?** Não (ver [[Analise_do_Sistema#^rf06|RF06]] — filtro por Conteúdo/Tópico é opcional na maioria dos modos).
- **Depende de outro campo?** Não — mas é pré-requisito para habilitar o filtro de Tópico.
- **Comportamento:** lista os `contents` cadastrados no sistema. Ao selecionar um Conteúdo, habilita o dropdown de Tópico. Exibido também para o visitante.

### Tópico
- **Tipo:** dropdown (seleção única), em cascata com Conteúdo
- **Obrigatório?** Não
- **Depende de outro campo?** Sim — de Conteúdo. Enquanto nenhum Conteúdo estiver selecionado, aparece desabilitado com o texto "Escolha um conteúdo primeiro" e a nota de apoio "O tópico depende do conteúdo escolhido."
- **Comportamento:** ao habilitar, lista apenas os `topics` cujo `content_id` corresponde ao Conteúdo selecionado. Exibido também para o visitante.

### Dificuldade
- **Tipo:** dropdown (seleção única)
- **Obrigatório?** Não na maioria dos modos; passa a ser tratado de forma especial no modo "Progressão" (ver campo Quantidade de questões).
- **Depende de outro campo?** Não
- **Comportamento:** valor padrão "Qualquer". Opções confirmadas: **Qualquer, Fácil, Médio, Difícil, Progressão** (modo especial descrito em [[Analise_do_Sistema#^rn17|RN17]], que distribui as questões entre os 3 níveis). *(Rótulo "Intermediário" de versões anteriores foi padronizado para "Médio" em toda a documentação e no enum `difficulty` do banco.)*
- **Não exibido para o visitante** — ver "Comportamento em casos especiais".

### Quantidade de questões
- **Tipo:** campo numérico
- **Obrigatório?** Depende do modo de Dificuldade: opcional na maioria dos modos; **obrigatório no modo Progressão**, conforme [[Analise_do_Sistema#^rn17|RN17]] e [[Analise_do_Sistema#^rf06|RF06]].
- **Depende de outro campo?** Sim, do campo Dificuldade (regra de obrigatoriedade condicional).
- **Comportamento:** placeholder "Ex.: 10 questões". Quando Dificuldade = Progressão, o sistema deve distribuir as questões entre fácil/médio/difícil segundo a fórmula de RN17 (base = quantidade ÷ 3 arredondado para baixo, resto distribuído na ordem fácil → médio → difícil).
- **Não exibido para o visitante** — ver "Comportamento em casos especiais".

### Tipo de questão
- **Tipo:** seleção múltipla (multi-select) entre 3 opções: "Múltipla escolha", "Certo ou errado", "Dissertativa"
- **Obrigatório?** Não — nota explícita na tela: "Selecione um ou mais tipos. Deixe em branco para incluir todos."
- **Depende de outro campo?** Não
- **Comportamento:** cada opção pode ser marcada/desmarcada independentemente. Item selecionado deve usar a cor de destaque **azul primário (`#258BFC`)**, consistente com o papel dessa cor na identidade visual (ação do usuário, não feedback de acerto) — decisão fechada, mesma regra aplicada ao Checklist do Onboarding. Exibido também para o visitante.

### Botão "Continuar"
- **Tipo:** botão de ação primária
- **Comportamento:** aplica os filtros selecionados e navega para a tela de Questão, carregando a primeira questão do conjunto filtrado. Deve funcionar mesmo com todos os filtros vazios (retorna questões sem filtro, respeitando RF06).

### Botão "Limpar filtro"
- **Tipo:** botão de ação secundária
- **Comportamento:** reseta todos os campos do formulário visíveis (Conteúdo, Tópico, Dificuldade, Quantidade, Tipo de questão — ou apenas Conteúdo/Tópico/Tipo para o visitante) para o estado inicial, sem navegar para outra tela.

---

## Comportamento em casos especiais

- **Visitante (sem login) — decisão fechada:** o Filtro é **exibido** ao visitante, mas restrito a 3 campos: **Conteúdo, Tópico e Tipo de questão**. Os campos **Dificuldade e Quantidade de questões não aparecem** — o sistema sempre aplica a regra fixa de 2 fáceis/2 médias/2 difíceis por tópico (ver [[Analise_do_Sistema#^rn04|RN04]]), sem vídeo de resolução disponível.
  - **Regra de fallback por insuficiência de questões** (vale também para o aluno logado): se o filtro aplicado não tiver questões suficientes em algum nível de dificuldade, o sistema entrega apenas as questões existentes, sem completar a diferença. Ex.: filtro de "Certo ou errado" com apenas 3 questões cadastradas, todas fáceis → retorna 2 fáceis, 0 médias, 0 difíceis.
  - Ao terminar o lote de 6, é exibido o mesmo modal de encerramento do usuário logado (ver [[Spec_Questao#Estado de feedback (pós-resposta)]]), seguido de redirecionamento para Cadastro.
  - O visitante pode retornar a este Filtro e repetir o processo com outros filtros, sem limite total de lotes — decisão consciente de produto (ver [[Analise_do_Sistema#^rn04|RN04]]).
- **Modo Progressão sem Quantidade preenchida:** deve bloquear o "Continuar" e sinalizar o campo Quantidade como obrigatório. Estilo visual de erro será padronizado por um guia de convenções de UI a ser produzido (mesma pendência registrada em [[Spec_Cadastro]]).
- **Filtro sem nenhuma questão correspondente — decisão fechada:** exibe mensagem simples **"Nenhuma questão encontrada com esses filtros"**, sem navegar para a tela de Questão.
- **Conteúdo trocado após Tópico já selecionado:** ao trocar o Conteúdo, o Tópico selecionado anteriormente deve ser resetado, já que pertencia ao Conteúdo anterior.

---

## Informações exibidas

### Estado inicial (filtros vazios) — aluno logado
- Título "Filtrar questões"
- Dropdown "Conteúdo" vazio ("Selecione um conteúdo")
- Dropdown "Tópico" desabilitado ("Escolha um conteúdo primeiro")
- Dropdown "Dificuldade" com valor padrão "Qualquer"
- Campo "Quantidade de questões" vazio
- Seleção "Tipo de questão" com nenhuma opção marcada
- Botões "Continuar" e "Limpar filtro"

### Estado inicial (filtros vazios) — visitante
- Título "Filtrar questões"
- Dropdown "Conteúdo" vazio ("Selecione um conteúdo")
- Dropdown "Tópico" desabilitado ("Escolha um conteúdo primeiro")
- Seleção "Tipo de questão" com nenhuma opção marcada
- **Sem** os campos Dificuldade e Quantidade de questões
- Botões "Continuar" e "Limpar filtro"

### Estado com Conteúdo selecionado
- Dropdown "Tópico" habilitado, listando os tópicos do conteúdo escolhido.

### Estado com Dificuldade = Progressão (apenas aluno logado)
- Campo "Quantidade de questões" passa a ser obrigatório.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rn04\|RN04]] | Página pública de questões (visitante) reaproveita este front-end, com restrições aplicadas |
| [[Analise_do_Sistema#^rn06\|RN06]] | Uma questão é vinculada a 1+ Conteúdos e opcionalmente a 0+ Tópicos |
| [[Analise_do_Sistema#^rn17\|RN17]] | Modo "Progressão" do filtro de dificuldade: distribuição fácil/médio/difícil; Quantidade obrigatória nesse modo |
| [[Analise_do_Sistema#^rf06\|RF06]] | Sistema deve permitir filtro de questões por Conteúdo e Tópico, incluindo Quantidade de questões |

---

## Pendências identificadas nesta tela

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]].
