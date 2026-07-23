# Pendências das Specs de Tela — Consolidado
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Pendências (consolidado)
**Última atualização:** 22/07/2026

> Este documento reúne todas as pendências levantadas durante a criação das specs de tela a partir do protótipo Figma. Cada item referencia a spec de origem. Pendências de documentação/produto de caráter mais amplo (não ligadas a uma tela específica) continuam em [[Pendencias]].
>
> Todos os itens levantados na rodada anterior foram decididos em sessão de revisão de time (22/07/2026), com exceção do item 21, que fica formalmente pendente para uma próxima rodada de especificação.

---

## 🟡 Em aberto

### 21. Telas de Perfil e Menu não especificadas
**Origem:** [[Spec_Dashboard#Pendências identificadas nesta tela|Spec_Dashboard, item 1]]
Os ícones de usuário e menu no header do Dashboard não têm nenhuma tela associada no protótipo. A edição de interesses (RN14) provavelmente vive na tela de Perfil, que ainda não existe como spec. **Decisão do time:** a especificação dessa tela fica para uma próxima rodada — RN14 (edição de interesses) permanece sem uma tela definida até lá.

---

## ✅ Resolvidas (revisão de 22/07/2026)

### 1. Streak sem regra de negócio definida
**Resolvido:** calculado on-the-fly a partir de `answered_questions`, sem coluna dedicada em `users`. Conta dias distintos com pelo menos 1 questão respondida (independente de acerto). Corte à meia-noite (horário de Brasília). Zera com 1 dia inteiro sem atividade. Sem tolerância/perdão no MVP. → [[Analise_do_Sistema#^rn18|RN18]]

### 2. Tela de Questão — estados não prototipados
**Resolvido**, com os seguintes comportamentos definidos:
- **Feedback pós-resposta:** alternativa correta destacada visualmente; botões "Próxima questão" e "Ver resolução"; ao clicar em "Ver resolução", exibe abaixo das alternativas o vídeo (ou "vídeo indisponível" quando não houver URL cadastrada) seguido da resolução em texto.
- **Layout "Certo ou errado":** 2 botões grandes (Certo / Errado).
- **Layout "Dissertativa":** campo de resposta livre → botão "Ver resolução" → botões "Acertei"/"Errei" para autoavaliação. Gera registro normal em `answered_questions`, pontua igual às demais (RN08–RN10), sem campo de diferenciação de origem — risco de auto-inflação aceito conscientemente (ver [[Pendencias]]).
- **Encerramento do conjunto:** modal com total de questões respondidas, acertos, erros e pontos ganhos.
- **Gatilho do redirecionamento do visitante:** imediatamente após a resposta da 6ª (última) questão do lote fixo. Visitante pode repetir lotes ilimitados com outros filtros — decisão consciente de produto, não lacuna.
- **Ícone de tesoura (✂️):** confirmado como ferramenta de eliminação de alternativa, puramente cosmética/client-side, sem persistência em banco.
- Contadores do cabeçalho: escopo é a sessão atual do aluno logado (não histórico total) — label "sessão atual" deve constar explicitamente na tela para evitar confusão com o card de desempenho do Dashboard.

→ [[Analise_do_Sistema#^rn04|RN04]], [[Analise_do_Sistema#^rf05|RF05]]

### 3. Login/cadastro via Google sem suporte no modelo de dados
**Resolvido:** fora do escopo do MVP, por custo de implementação (OAuth, colisão de e-mail, mudança de schema) frente ao prazo. Botão removido do protótipo Figma no Cadastro e no Login. → [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)]]

### 4. Sem fluxo de recuperação de senha
**Resolvido:** entra no MVP. Sistema nativo de reset de senha do Laravel, e-mail transacional via Brevo, token de uso único, expiração de 1 hora. → [[Analise_do_Sistema#^rf15|RF15]]

### 5. Estado visual de "selecionado" não definido
**Resolvido:** cor de destaque = azul primário `#258BFC` (consistente com o papel dessa cor na identidade visual — ação do usuário, não feedback de acerto). Aplica-se tanto ao Checklist do Onboarding quanto ao campo "Tipo de questão" do Filtro.

### 6. Comportamento da tela de Filtro para o Visitante
**Resolvido:** Filtro reaproveitado, restrito aos campos Conteúdo, Tópico e Tipo de questão (Dificuldade e Quantidade ocultos). Regra fixa 2 fácil/2 médio/2 difícil por tópico. Nova regra de fallback definida para quando não há questões suficientes em algum nível — o sistema entrega o que existe, sem completar a diferença (regra estendida também para a versão logada). → [[Analise_do_Sistema#^rn04|RN04]]

### 7. Função do ícone de tesoura (✂️)
**Resolvido** — ver item 2 acima.

### 8. Divisão por zero / estados vazios no Dashboard
**Resolvido:** ambos os cards (percentual de acerto sem tentativas; tópico com mais acertos sem nenhum acerto) exibem "Sem dados ainda".

### 9. Sem estado de "nenhum resultado encontrado" no Filtro
**Resolvido:** mensagem simples "Nenhuma questão encontrada com esses filtros".

### 10. Opções do dropdown "Dificuldade" não visíveis no protótipo
**Resolvido:** rótulos padronizados como Qualquer, Fácil, **Médio**, Difícil, Progressão. Termo "intermediário" substituído por "médio" em toda a documentação e no enum `difficulty` da tabela `questions` para manter consistência entre UI e banco. → [[Analise_do_Sistema#5.4 questions (questões)]]

### 11. Escopo dos contadores no cabeçalho da tela de Questão
**Resolvido** — ver item 2 acima.

### 12. Efeito do botão "Voltar" na primeira etapa do Onboarding
**Resolvido:** o botão "Voltar" não existe nessa tela. → [[Analise_do_Sistema#^rn19|RN19]]

### 13. Política de Privacidade inexistente
**Resolvido:** documento combinado com Termos de Uso ("Termos de Uso e Política de Privacidade"). → [[Pendencias#Termos-e-Privacidade]]

### 14. Estilo de estados de erro não definido
**Resolvido:** será produzido um guia de convenções de erro reutilizável (cores, posicionamento de mensagem) baseado na paleta de [[Identidade_Visual]].

### 15. Divergências entre a Home prototipada e [[Fluxo_de_Navegacao]]
**Resolvido:**
- Link para "Questões (sem login)" passa a viver no menu hambúrguer, junto com links de navegação pelas seções da Home. Materiais de Estudos não entra no menu (feature ainda não implementada).
- Hero passa a ter 1 botão único ("Começar gratuitamente").
- Rótulo duplicado "A SOLUÇÃO" já corrigido no Figma.
- Rodapé: não será prototipado no Figma, mas entra no MVP com estrutura de conteúdo mínima definida em [[Fluxo_de_Navegacao#Rodapé]], sem necessidade de design elaborado.
- Ícone de menu no header agora tem função definida (abre o menu descrito acima).

### 16. Divergência entre RN12 e o fluxo real do Onboarding
**Resolvido:** RN12 reescrita, separando a coleta de dados obrigatórios (Cadastro) do checklist opcional (Onboarding). → [[Analise_do_Sistema#^rn12|RN12]]

### 17. Lista de conteúdos "hardcoded" no protótipo do Checklist
**Resolvido:** confirmado que a lista vem dinamicamente da tabela `contents`, exibida com paginação "mostrar mais".

### 18. Sem limite de seleção no Checklist de interesses
**Resolvido:** sem limite mínimo/máximo. Risco de esvaziamento da priorização do RF12 registrado como trade-off consciente em [[Pendencias]].

### 19. Proteção de acesso direto à tela de Onboarding
**Resolvido:** sem sessão ativa → redireciona para Home; sessão ativa que já completou o onboarding → redireciona para Dashboard. → [[Analise_do_Sistema#^rn19|RN19]]

### 20. Card "sugestão de próximo conteúdo" ausente no Dashboard
**Resolvido:** descartado definitivamente. A lógica de recomendação (RF12) permanece implementada para uso em outras partes do sistema.

---

## Resumo por tela

| Tela | Nº de pendências originais | Status |
|---|---|---|
| [[Spec_Home]] | 5 | ✅ Resolvido |
| [[Spec_Cadastro]] | 3 | ✅ Resolvido |
| [[Spec_Login]] | 2 | ✅ Resolvido |
| [[Spec_Onboarding_Boas_Vindas]] | 3 | ✅ Resolvido |
| [[Spec_Onboarding_Checklist]] | 3 | ✅ Resolvido |
| [[Spec_Dashboard]] | 5 | 4 resolvidos / 1 em aberto (item 21 — spec de Perfil) |
| [[Spec_Filtro_de_Questoes]] | 4 | ✅ Resolvido |
| [[Spec_Questao]] | 7 | ✅ Resolvido |
