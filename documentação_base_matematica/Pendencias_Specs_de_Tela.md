# Pendências das Specs de Tela — Consolidado
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Pendências (consolidado)
**Última atualização:** 21/07/2026

> Este documento reúne todas as pendências levantadas durante a criação das specs de tela a partir do protótipo Figma, para discussão e decisão do time antes de seguir para o desenvolvimento. Cada item referencia a spec de origem. Pendências de documentação/produto de caráter mais amplo (não ligadas a uma tela específica) continuam em [[Pendencias]].

---

## 🔴 Prioridade alta — bloqueiam ou impactam fortemente o desenvolvimento

### 1. Streak sem regra de negócio definida
**Origem:** [[Spec_Dashboard#Pendências identificadas nesta tela|Spec_Dashboard, item 2]]
O card "Day Streak" existe no protótipo, mas é puramente visual — nenhum número de dias aparece, e **não há nenhuma RN/RF em [[Analise_do_Sistema]]** definindo como o streak é calculado, incrementado ou zerado (o que conta como "um dia de estudo"? precisa responder ao menos 1 questão? qual o corte de horário/timezone?). É uma peça central de gamificação sem regra formal.

### 2. Tela de Questão — mais da metade dos estados não prototipados
**Origem:** [[Spec_Questao#Pendências identificadas nesta tela|Spec_Questao]]
É o núcleo funcional da plataforma (RF04, RF05, RF07, RF08) e o protótipo cobre só um estado (múltipla escolha, não respondida). Faltam:
- Estado de feedback pós-resposta (acerto/erro, resolução em texto, vídeo de resolução)
- Layout do tipo "Certo ou errado"
- Layout do tipo "Dissertativa" (campo de resposta livre + resolução para autoavaliação)
- Tela/resumo de encerramento do conjunto de questões (o que acontece após a última questão)
- Gatilho exato do redirecionamento do visitante para Cadastro/Login (RN04 confirma que existe, mas não diz quando)
- Se a autoavaliação da dissertativa gera algum registro de acerto/erro em `answered_questions`, ou fica fora do cálculo de desempenho

### 3. Login/cadastro via Google sem suporte no modelo de dados
**Origem:** [[Spec_Cadastro#Pendências identificadas nesta tela|Spec_Cadastro, item 2]] e [[Spec_Login#Pendências identificadas nesta tela|Spec_Login, item 1]]
O protótipo tem botão "Entrar com Google" no Cadastro e no Login, mas não há RN/RF cobrindo esse fluxo, e a tabela `users` hoje exige `password` (sem campo para `google_id` ou senha opcional). Definir se entra no MVP e o que muda no modelo de dados.

### 4. Sem fluxo de recuperação de senha
**Origem:** [[Spec_Login#Pendências identificadas nesta tela|Spec_Login, item 2]]
Nem o protótipo nem [[Analise_do_Sistema]] preveem "esqueci minha senha". Lacuna relevante para um sistema com autenticação por senha — avaliar se entra no MVP ou fica registrado como pendência de pré-lançamento.

---

## 🟡 Prioridade média — afetam comportamento/UX, mas não bloqueiam a estrutura geral

### 5. Estado visual de "selecionado" não definido (2 telas)
**Origem:** [[Spec_Onboarding_Checklist#Pendências identificadas nesta tela|Spec_Onboarding_Checklist, item 1]] e [[Spec_Filtro_de_Questoes#Pendências identificadas nesta tela|Spec_Filtro_de_Questoes, item 2]]
- Checklist de interesses do Onboarding: itens não diferenciam visualmente marcado vs. não marcado.
- Filtro de Questões, campo "Tipo de questão": mesma falta de diferenciação visual entre opções marcadas/desmarcadas.

### 6. Comportamento da tela de Filtro para o Visitante
**Origem:** [[Spec_Filtro_de_Questoes#Pendências identificadas nesta tela|Spec_Filtro_de_Questoes, item 3]]
Não está claro se o Filtro é ocultado/pulado para quem acessa sem login (indo direto para a tela de Questão com as 6 perguntas fixas de RN04), ou se é exibido com os campos bloqueados.

### 7. Função do ícone de tesoura (✂️) ao lado das alternativas
**Origem:** [[Spec_Questao#Pendências identificadas nesta tela|Spec_Questao, item 4]]
Aparece ao lado de cada alternativa na tela de Questão, sem função documentada. Hipótese: ferramenta de "eliminar alternativa" (estratégia de eliminação). Precisa confirmação antes de implementar.

### 8. Divisão por zero / estados vazios no Dashboard
**Origem:** [[Spec_Dashboard#Pendências identificadas nesta tela|Spec_Dashboard, itens 3 e 4]]
- Cálculo de "percentual de acertos" precisa de tratamento explícito para aluno sem nenhuma tentativa (evitar divisão por zero).
- Card "Tópico com mais acertos" não tem estado definido para quando o aluno ainda não tem nenhum acerto.

### 9. Sem estado de "nenhum resultado encontrado" no Filtro
**Origem:** [[Spec_Filtro_de_Questoes#Pendências identificadas nesta tela|Spec_Filtro_de_Questoes, item 4]]
Não há tela/mensagem definida para quando o filtro escolhido não retorna nenhuma questão.

### 10. Opções do dropdown "Dificuldade" não visíveis no protótipo
**Origem:** [[Spec_Filtro_de_Questoes#Pendências identificadas nesta tela|Spec_Filtro_de_Questoes, item 1]]
O dropdown nunca aparece aberto nas telas exportadas. Assumido: Qualquer, Fácil, Intermediário, Difícil, Progressão (RN17) — confirmar rótulos exatos.

### 11. Escopo dos contadores no cabeçalho da tela de Questão
**Origem:** [[Spec_Questao#Pendências identificadas nesta tela|Spec_Questao, item 2]]
"questões respondidas/acertos/erros" no topo — não fica claro se são do conjunto atual (lote filtrado) ou do histórico total do aluno logado.

### 12. Efeito do botão "Voltar" na primeira etapa do Onboarding
**Origem:** [[Spec_Onboarding_Boas_Vindas#Pendências identificadas nesta tela|Spec_Onboarding_Boas_Vindas, item 1]]
A conta já foi criada no Cadastro antes desta etapa. Clicar em "Voltar" retorna visualmente ao Cadastro, mas não deve duplicar o cadastro. Não está definido se, em vez disso, deveria levar ao Dashboard ou à Home.

---

## 🟢 Prioridade baixa — inconsistências de conteúdo/texto ou lacunas de documentação

### 13. Política de Privacidade inexistente
**Origem:** [[Spec_Cadastro#Pendências identificadas nesta tela|Spec_Cadastro, item 1]]
Assim como os Termos de Uso (já pendência formal em [[Pendencias]]), a Política de Privacidade referenciada no checkbox de aceite do Cadastro não existe em nenhum documento do projeto.

### 14. Estilo de estados de erro não definido (padrão geral)
**Origem:** [[Spec_Cadastro#Pendências identificadas nesta tela|Spec_Cadastro, item 3]] (também citado em Spec_Login e Spec_Filtro_de_Questoes)
Nenhuma tela do protótipo mostra como erros de validação devem aparecer visualmente (campo vazio, e-mail duplicado, senha fraca, senhas não coincidentes, filtro obrigatório não preenchido). Recomenda-se um documento de convenções de UI reutilizável em todas as telas com formulário.

### 15. Divergências entre a Home prototipada e [[Fluxo_de_Navegacao]]
**Origem:** [[Spec_Home#Pendências identificadas nesta tela|Spec_Home]]
- "Questões (sem login)" e "Materiais de Estudos" listados como acessíveis pela Home no fluxo de navegação, mas sem link/botão correspondente no protótipo.
- Hero com 2 botões documentados ("Começar" / "Conhecer o projeto") vs. 1 botão no protótipo ("começe gratuitamente").
- Rótulo duplicado "A SOLUÇÃO" nas seções "Solução" e "Público-alvo".
- Rodapé (Quem somos / Informações da equipe) previsto na documentação, ausente no protótipo.
- Comportamento do ícone de menu no header não definido.

### 16. Divergência entre RN12 e o fluxo real do Onboarding
**Origem:** [[Spec_Onboarding_Boas_Vindas#Pendências identificadas nesta tela|Spec_Onboarding_Boas_Vindas, item 3]]
RN12 atribui ao "Onboarding" a coleta de nome/e-mail/senha, mas no protótipo essa coleta ocorre na tela de Cadastro. Sugerir atualização da redação de RN12.

### 17. Lista de conteúdos "hardcoded" no protótipo do Checklist
**Origem:** [[Spec_Onboarding_Checklist#Pendências identificadas nesta tela|Spec_Onboarding_Checklist, item 2]]
Confirmar que os 10 itens mostrados são só exemplo, e que a lista real deve vir dinamicamente da tabela `contents`.

### 18. Sem limite de seleção no Checklist de interesses
**Origem:** [[Spec_Onboarding_Checklist#Pendências identificadas nesta tela|Spec_Onboarding_Checklist, item 3]]
Não há regra definindo número mínimo/máximo de conteúdos marcáveis como interesse.

### 19. Proteção de acesso direto à tela de Onboarding
**Origem:** [[Spec_Onboarding_Boas_Vindas#Pendências identificadas nesta tela|Spec_Onboarding_Boas_Vindas, item 2]]
Não definido o comportamento se a URL do Onboarding for acessada sem ter passado pelo Cadastro.

### 20. Card "sugestão de próximo conteúdo" ausente no Dashboard
**Origem:** [[Spec_Dashboard#Pendências identificadas nesta tela|Spec_Dashboard, item 5]]
[[Fluxo_de_Navegacao]] lista esse card como parte do Dashboard, mas ele não aparece no protótipo Figma. Confirmar se foi descartado ou se falta implementar (conecta-se à lógica de RF12).

### 21. Telas de Perfil e Menu não especificadas
**Origem:** [[Spec_Dashboard#Pendências identificadas nesta tela|Spec_Dashboard, item 1]]
Os ícones de usuário e menu no header do Dashboard não têm nenhuma tela associada no protótipo. A edição de interesses (RN14) provavelmente vive na tela de Perfil, que ainda não existe como spec.

---

## Resumo por tela

| Tela | Nº de pendências |
|---|---|
| [[Spec_Home]] | 5 |
| [[Spec_Cadastro]] | 3 |
| [[Spec_Login]] | 2 |
| [[Spec_Onboarding_Boas_Vindas]] | 3 |
| [[Spec_Onboarding_Checklist]] | 3 |
| [[Spec_Dashboard]] | 5 |
| [[Spec_Filtro_de_Questoes]] | 4 |
| [[Spec_Questao]] | 7 |
