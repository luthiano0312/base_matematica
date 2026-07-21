# Pendencias
**Projeto:** Ceará Científico
**Tipo de documento:** Pendências
**Última atualização:** 20/07/2026

> Pendências de **documentação/produto**: decisões de regra de negócio não tomadas, documentos que ainda faltam existir, specs de tela ainda não escritas. Tarefas de desenvolvimento/código ficam em GitHub Issues (ou ferramenta equivalente), não aqui.

---

## 🔴 Alta prioridade

### RN17
**Arredondamento do modo Progressão.** No filtro de Dificuldade, o modo "Progressão" divide as questões retornadas em terços (1/3 fácil, 1/3 médio, 1/3 difícil). Quando a "Quantidade de questões" não for divisível por 3, a regra de arredondamento ainda não foi definida (a sobra vai para difícil? para fácil? o total é truncado?). Precisa ser fechado antes da implementação. Ver [[Analise_do_Sistema#^rn17]] e [[Spec_Filtro_e_Questoes_Logado]].

### RNF-senha
**Requisitos de senha.** [[Analise_do_Sistema#^rnf08]] estabelece que a senha deve seguir requisitos mínimos de segurança, mas os requisitos exatos (tamanho mínimo, uso obrigatório de números/maiúsculas, campo de confirmação de senha) ainda não foram definidos.

---

## 🟡 Média prioridade

### Multiplos-interesses
**Critério de escolha entre múltiplos interesses marcados.** Quando o aluno marca mais de um conteúdo de interesse no onboarding, ainda não há critério definido para priorizar um sobre o outro no filtro padrão de questões (ver [[Analise_do_Sistema#^rf12]]). Ainda não vira RN — resolver após esta migração, em uma decisão de produto dedicada.

### Fallback-aluno-novo
**Comportamento para aluno novo sem interesse e sem histórico.** Quando nenhum dos dois critérios de [[Analise_do_Sistema#^rf12]] se aplica (aluno sem interesses marcados e sem respostas registradas), ainda não está definido o que o sistema deve exibir por padrão (ex: conteúdo aleatório, mais recente cadastrado, etc.). Ainda não vira RN — resolver após esta migração.

---

## 🟢 Baixa prioridade

### Termos-de-Uso
**Termos de Uso — documento inexistente.** O campo de aceite de termos já existe na tela de Cadastro (ver [[Fluxo_de_Navegacao]]), mas o documento de Termos de Uso em si ainda não foi redigido. Registrado como pendência formal de pré-lançamento em [[Analise_do_Sistema#4.3 Pendências de pré-lançamento]].

---

## ✅ Resolvidas nesta migração

- **Reaproveitamento da tela de Questões para o Visitante** — resolvido: reaproveitamento é apenas de front-end, com as restrições de RN01/RN03/RN04/RF03 aplicadas via lógica condicional. Ver [[Analise_do_Sistema#^rn04]].
- **RF12 sem comportamento definido para filtro vazio** — resolvido: filtro vazio agora prioriza interesse do onboarding, com fallback em cascata para desempenho. Ver [[Analise_do_Sistema#^rf12]].
- **Mascote descrito como parte do MVP em [[Identidade_Visual]]** — resolvido: nota explícita adicionada deixando claro que o mascote foi postergado para fase futura (ver [[Identidade_Visual#5.2 Diretrizes do Mascote]] e [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)]]).
