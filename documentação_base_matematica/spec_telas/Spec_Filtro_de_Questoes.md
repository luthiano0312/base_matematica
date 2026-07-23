# Filtro de Questões — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Dashboard (atalho "Questões")
   ↓
Filtro de Questões
   ├── clique em "Limpar filtro" ────→ reseta todos os campos (permanece na tela)
   └── clique em "Continuar" ────────→ Tela de Questão (com as questões filtradas)
```

Esta tela corresponde ao filtro do aluno logado, referenciado em [[Fluxo_de_Navegacao#Questões (usuário logado)]]. Para o **visitante**, o mesmo front-end é reaproveitado, mas com filtros restritos automaticamente (sem liberdade de escolha) — ver [[Analise_do_Sistema#^rn04|RN04]] e a seção "Comportamento em casos especiais" abaixo.

---

## Campos / Componentes

### Conteúdo
- **Tipo:** dropdown (seleção única)
- **Obrigatório?** Não (ver [[Analise_do_Sistema#^rf06|RF06]] — filtro por Conteúdo/Tópico é opcional na maioria dos modos).
- **Depende de outro campo?** Não — mas é pré-requisito para habilitar o filtro de Tópico.
- **Comportamento:** lista os `contents` cadastrados no sistema. Ao selecionar um Conteúdo, habilita o dropdown de Tópico.

### Tópico
- **Tipo:** dropdown (seleção única), em cascata com Conteúdo
- **Obrigatório?** Não
- **Depende de outro campo?** Sim — de Conteúdo. Enquanto nenhum Conteúdo estiver selecionado, aparece desabilitado com o texto "Escolha um conteúdo primeiro" e a nota de apoio "O tópico depende do conteúdo escolhido."
- **Comportamento:** ao habilitar, lista apenas os `topics` cujo `content_id` corresponde ao Conteúdo selecionado.

### Dificuldade
- **Tipo:** dropdown (seleção única)
- **Obrigatório?** Não na maioria dos modos; passa a ser tratado de forma especial no modo "Progressão" (ver campo Quantidade de questões).
- **Depende de outro campo?** Não
- **Comportamento:** valor padrão "Qualquer". **O protótipo não mostra a lista de opções do dropdown aberto** — pelas regras de negócio, as opções esperadas são: Qualquer, Fácil, Intermediário, Difícil, e **Progressão** (modo especial descrito em [[Analise_do_Sistema#^rn17|RN17]], que distribui as questões entre os 3 níveis). Ver Pendência 1.

### Quantidade de questões
- **Tipo:** campo numérico
- **Obrigatório?** Depende do modo de Dificuldade: opcional na maioria dos modos; **obrigatório no modo Progressão**, conforme [[Analise_do_Sistema#^rn17|RN17]] e [[Analise_do_Sistema#^rf06|RF06]].
- **Depende de outro campo?** Sim, do campo Dificuldade (regra de obrigatoriedade condicional).
- **Comportamento:** placeholder "Ex.: 10 questões". Quando Dificuldade = Progressão, o sistema deve distribuir as questões entre fácil/médio/difícil segundo a fórmula de RN17 (base = quantidade ÷ 3 arredondado para baixo, resto distribuído na ordem fácil → médio → difícil).

### Tipo de questão
- **Tipo:** seleção múltipla (multi-select) entre 3 opções: "Múltipla escolha", "Certo ou errado", "Dissertativa"
- **Obrigatório?** Não — nota explícita na tela: "Selecione um ou mais tipos. Deixe em branco para incluir todos."
- **Depende de outro campo?** Não
- **Comportamento:** cada opção pode ser marcada/desmarcada independentemente. **Assim como no checklist do Onboarding ([[Spec_Onboarding_Checklist#Pendências identificadas nesta tela]], item 1), o protótipo não diferencia visualmente uma opção selecionada de uma não selecionada** — mesma pendência se repete aqui (ver Pendência 2).

### Botão "Continuar"
- **Tipo:** botão de ação primária
- **Comportamento:** aplica os filtros selecionados e navega para a tela de Questão, carregando a primeira questão do conjunto filtrado. Deve funcionar mesmo com todos os filtros vazios (retorna questões sem filtro, respeitando RF06).

### Botão "Limpar filtro"
- **Tipo:** botão de ação secundária
- **Comportamento:** reseta todos os campos do formulário (Conteúdo, Tópico, Dificuldade, Quantidade, Tipo de questão) para o estado inicial, sem navegar para outra tela.

---

## Comportamento em casos especiais

- **Visitante (sem login):** conforme [[Analise_do_Sistema#^rn04|RN04]], o visitante **não deve ter liberdade de filtro** — o sistema aplica automaticamente a restrição de 6 questões fixas por tópico (2 fáceis, 2 intermediárias, 2 difíceis), sem vídeo de resolução disponível. Não fica claro no protótipo se, para o visitante, esta tela de Filtro é **pulada** (indo direto para a tela de Questão) ou se é **exibida mas com os campos bloqueados/ocultos**. Ver Pendência 3.
- **Modo Progressão sem Quantidade preenchida:** deve bloquear o "Continuar" e sinalizar o campo Quantidade como obrigatório (estilo de erro não definido no protótipo — mesma pendência já registrada em [[Spec_Cadastro#Pendências identificadas nesta tela]], item 3).
- **Filtro sem nenhuma questão correspondente:** não há tela/estado de "nenhum resultado encontrado" definida no protótipo. Deve ser tratado antes de navegar para a tela de Questão (ver Pendência 4).
- **Conteúdo trocado após Tópico já selecionado:** ao trocar o Conteúdo, o Tópico selecionado anteriormente deve ser resetado, já que pertencia ao Conteúdo anterior.

---

## Informações exibidas

### Estado inicial (filtros vazios)
- Título "Filtrar questões"
- Dropdown "Conteúdo" vazio ("Selecione um conteúdo")
- Dropdown "Tópico" desabilitado ("Escolha um conteúdo primeiro")
- Dropdown "Dificuldade" com valor padrão "Qualquer"
- Campo "Quantidade de questões" vazio
- Seleção "Tipo de questão" com nenhuma opção marcada
- Botões "Continuar" e "Limpar filtro"

### Estado com Conteúdo selecionado
- Dropdown "Tópico" habilitado, listando os tópicos do conteúdo escolhido.

### Estado com Dificuldade = Progressão
- Campo "Quantidade de questões" passa a ser obrigatório (indicação visual a definir).

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

1. **Opções do dropdown "Dificuldade" não visíveis no protótipo:** por estar sempre fechado nas telas exportadas, não é possível confirmar os rótulos exatos das opções (assumido: Qualquer, Fácil, Intermediário, Difícil, Progressão). Confirmar antes de implementar.
2. **Estado de seleção do "Tipo de questão" não definido visualmente** — mesma pendência já registrada para o checklist do Onboarding.
3. **Comportamento desta tela para o Visitante não está claro:** confirmar se o Filtro é ocultado/pulado para quem acessa sem login (indo direto para a tela de Questão com as 6 perguntas fixas de RN04), ou se é exibido com os campos bloqueados.
4. **Sem estado de "nenhum resultado encontrado":** não há tela ou mensagem definida para quando o filtro escolhido não retorna nenhuma questão.
