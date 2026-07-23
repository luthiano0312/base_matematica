# Pendencias
**Projeto:** Ceará Científico
**Tipo de documento:** Pendências
**Última atualização:** 22/07/2026

> Pendências de **documentação/produto**: decisões de regra de negócio não tomadas, documentos que ainda faltam existir, specs de tela ainda não escritas. Tarefas de desenvolvimento/código ficam em GitHub Issues (ou ferramenta equivalente), não aqui.

---

## 🟢 Baixa prioridade

### Termos-e-Privacidade
**Termos de Uso e Política de Privacidade — documento único combinado, inexistente.** O campo de aceite já existe na tela de Cadastro (ver [[Fluxo_de_Navegacao]]), mas o documento em si ainda não foi redigido. Decisão de produto: em vez de dois documentos separados, será um único documento combinado, reduzindo esforço de manutenção para um projeto pequeno. Registrado como pendência formal de pré-lançamento em [[Analise_do_Sistema#4.3 Pendências de pré-lançamento]].

### Risco de auto-inflação de pontos em questões dissertativas
A correção de questões dissertativas é feita por autoavaliação do próprio aluno ("Acertei"/"Errei"), sem nenhuma validação do sistema, e pontua normalmente (ver [[Analise_do_Sistema#^rf05|RF05]]). Isso permite, em tese, que um aluno ganhe pontos sem de fato acertar. **Decisão consciente:** aceito para o MVP, assumindo baixo volume de questões dissertativas cadastradas. Se o volume crescer, reavaliar — possível mitigação futura: campo `self_assessed` em `answered_questions` para diferenciar correção automática de autodeclarada (útil especialmente se leaderboard/ranking for implementado em fase futura de gamificação).

### Checklist de interesses sem limite pode esvaziar a priorização do RF12
RN14 define que não há limite mínimo/máximo de conteúdos marcáveis como interesse. Se um aluno marcar muitos ou todos os conteúdos, o sorteio aleatório entre interesses (RF12) perde poder discriminativo — na prática, se aproxima do comportamento de "sem interesse marcado". **Decisão consciente:** aceito sem limite no MVP; sem ação necessária a menos que se observe esse padrão de uso na prática.

---

## ✅ Resolvidas nesta migração

- **Reaproveitamento da tela de Questões para o Visitante** — resolvido: reaproveitamento é apenas de front-end, com as restrições de RN01/RN03/RN04/RF03 aplicadas via lógica condicional. Ver [[Analise_do_Sistema#^rn04]].
- **Mascote descrito como parte do MVP em [[Identidade_Visual]]** — resolvido: nota explícita adicionada deixando claro que o mascote foi postergado para fase futura (ver [[Identidade_Visual#5.2 Diretrizes do Mascote]] e [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)]]).
- **RN17 — arredondamento do modo Progressão** — resolvido: base = quantidade ÷ 3 (arredondado para baixo) por nível, resto distribuído na ordem fácil → médio → difícil. Ver [[Analise_do_Sistema#^rn17]].
- **RNF-senha — requisitos mínimos** — resolvido: mínimo 8 caracteres, 1 número, 1 maiúscula, com campo de confirmação de senha no cadastro. Ver [[Analise_do_Sistema#^rnf08]].
- **Múltiplos interesses — critério de priorização** — resolvido: sorteio aleatório entre os interesses marcados a cada sessão. Ver [[Analise_do_Sistema#^rf12]].
- **Fallback aluno novo — comportamento sem interesse e sem histórico** — resolvido: conteúdo aleatório entre todos os cadastrados. Ver [[Analise_do_Sistema#^rf12]].
- **Streak sem regra de negócio definida** — resolvido: calculado on-the-fly, corte à meia-noite (Brasília), qualquer questão respondida conta, quebra com 1 dia sem atividade. Ver [[Analise_do_Sistema#^rn18]].
- **Estados da Tela de Questão** — resolvido: feedback pós-resposta, layout certo/errado, layout dissertativa (com autoavaliação), modal de encerramento e gatilho de redirecionamento do visitante todos definidos. Ver [[Pendencias_Specs_de_Tela]].
- **Login/cadastro via Google** — resolvido: fora do escopo do MVP. Botão removido do protótipo Figma. Ver [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)]].
- **Recuperação de senha** — resolvido: entra no MVP, via sistema nativo do Laravel + Brevo, token de uso único, expiração de 1 hora. Ver [[Analise_do_Sistema#^rf15]].

---

## Ver também

Pendências específicas de tela (levantadas a partir do protótipo Figma) ficam consolidadas em [[Pendencias_Specs_de_Tela]].
