# Pontos de Atualização — Documentação vs. Decisões do Protótipo

> Auditoria comparando `Análise do Sistema`, `Arquitetura` e `Identidade Visual` com as decisões tomadas durante a estruturação do protótipo. Organizado por prioridade, já que o prazo está apertado.

---

## 🔴 Crítico — impacta modelo de dados e regras de negócio

### 1. ✅ RESOLVIDO — Reaproveitar a tela de Questões (logado) para o Visitante

**Decisão:** o reaproveitamento é **apenas de front-end** (mesmo design/componente visual). As regras RN01, RN03, RN04 e RF03 continuam valendo *por trás* da tela — quem implementa precisa adaptar via lógica condicional, não é reaproveitamento 1:1:

- **Filtros**: para o visitante, a tela deve aplicar a restrição da RN04 (6 questões fixas por tópico — 2 fáceis, 2 intermediárias, 2 difíceis) em vez de aceitar filtros livres. Vale avaliar se os campos de filtro ficam ocultos/desabilitados para visitante, ou se ficam visíveis mas sem efeito — decisão de UI ainda em aberto, mas o comportamento de backend está definido.
- **Vídeo de resolução**: deve ficar oculto/bloqueado para visitante (RN04/RF03), mesmo o componente reaproveitado tendo esse bloco.
- **Persistência de tentativas**: visitante não tem `user_id`, então respostas dele **não são gravadas** em `answered_questions` — contadores da tela ("respondidas", "acertos", "erros") funcionam **apenas em estado local/sessão**, resetando ao sair.
- Redirecionamento pós-resposta para cadastro/login continua valendo, reconectado à tela reaproveitada.

**Ação:** atualizar RN04 com uma nota indicando que a tela é a mesma do usuário logado, mas com essas restrições aplicadas via lógica condicional no front e no back.

---

### 2. ✅ RESOLVIDO — RF12 (recomendação por interesses)

**Decisão:** o comportamento padrão do filtro vazio (antes baseado só em desempenho) agora **prioriza interesse**, com fallback em cascata:

1. Conteúdo marcado como interesse no onboarding (`user_interests`) — usa RF12 como pretendido
2. Se não houver interesse marcado (RN13), cai para o conteúdo com mais acertos (desempenho)
3. Se nenhum dos dois existir (aluno novo), comportamento ainda em aberto

**Pendências que sobraram dessa decisão** (novas, pequenas):
- Critério de escolha quando o aluno marcou **mais de um** interesse (qual conteúdo priorizar entre eles?)
- Comportamento para aluno novo sem interesse e sem histórico de respostas

Já atualizei isso no `Filtro_e_Questoes_Logado.md`.

---

## 🟡 Médio — falta formalizar nas tabelas de RN/RF

### 3. Modo "Progressão" da Dificuldade não está nas regras de negócio formais

O dropdown de Dificuldade com a opção "Progressão" (divide em 1/3 fácil, 1/3 médio, 1/3 difícil, com campo de quantidade obrigatório) foi definido só na conversa e no `.md` de Filtro — não existe uma RN correspondente no documento de Análise. Vale adicionar algo como:

> RN17 (sugestão): No modo "Progressão", as questões retornadas são divididas em terços por dificuldade. Se a quantidade não for divisível por 3, [definir regra de arredondamento — ainda não decidido].

**Esse arredondamento ainda não foi definido** — vale fechar isso antes da implementação (ex: sobra vai pra difícil? pra fácil? trunca?).

### 4. Requisitos de senha não estão documentados

RN12/RF01 mencionam senha como campo obrigatório, mas não há RNF especificando os requisitos mínimos (8 caracteres, 1 número, 1 maiúscula) nem confirmação de senha. Vale adicionar isso na seção de Requisitos Não Funcionais.

### 5. Campo "Quantidade de questões" no filtro não está modelado

Não aparece nem no fluxo original (`Fluxo de Navegação`) nem nas RN/RF. Vale formalizar como parte de RF06 (filtro/busca) ou criar uma RN nova.

---

## 🟢 Baixo — decisão de escopo, não incoerência de dados

### 6. Mascote adiado para fase futura

O documento de Identidade Visual (seção 5.2) descreve o mascote em Onboarding, conquistas, erros e telas vazias como parte do MVP. Você decidiu adiar isso pro protótipo atual. Vale adicionar uma nota no documento de identidade visual (ou no de Análise, seção "Fora do MVP") deixando explícito que o mascote foi postergado, para não gerar confusão em quem ler o documento depois e achar que já deveria estar implementado.

### 7. Termos de Uso — pendência formal

Já discutimos isso: o campo existe na tela, mas o documento não existe. Vale adicionar isso como item explícito na lista "Fora do MVP" ou como uma pendência de pré-lançamento no documento de Análise, já que hoje não há registro formal desse risco em nenhum dos três documentos.

---

## Resumo por prioridade

| Prioridade | Item | Ação sugerida |
|---|---|---|
| ✅ | Reaproveitamento da tela de visitante | Resolvido — front-end reaproveitado, regras aplicadas via lógica condicional |
| ✅ | RF12 sem lugar de uso | Resolvido — filtro vazio agora prioriza interesse, com fallback por desempenho |
| 🟡 | Critério de escolha entre múltiplos interesses marcados | Definir antes da implementação do filtro padrão |
| 🟡 | Comportamento para aluno novo sem interesse e sem histórico | Definir antes da implementação do filtro padrão |
| 🟡 | Modo Progressão sem RN formal | Adicionar RN17 + definir regra de arredondamento |
| 🟡 | Requisitos de senha não documentados | Adicionar RNF |
| 🟡 | Campo quantidade de questões não modelado | Adicionar à RF06 ou nova RN |
| 🟢 | Mascote adiado | Anotar no doc de Identidade Visual |
| 🟢 | Termos de uso pendente | Registrar como pendência formal |
