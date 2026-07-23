# Analise_do_Sistema
**Projeto:** Ceará Científico
**Tipo de documento:** Regras e Requisitos
**Última atualização:** 22/07/2026

*Projeto Social de Educação Matemática*

## 1. Contexto e Objetivo

Plataforma web educacional voltada ao ensino de matemática para jovens do ensino médio, com experiência gamificada inspirada no Duolingo. Caráter social, com foco em acessibilidade e seriedade educacional ao mesmo tempo.

### 1.1 Usuários

- **Aluno** — público-alvo principal, acessa majoritariamente pelo celular
- **Visitante** — acesso sem login, experiência limitada
- **Produtor de conteúdo** — equipe de 7 pessoas, cadastra conteúdo via painel admin
- **Professora orientadora** — validação pedagógica (processo manual, externo ao sistema)

### 1.2 Conteúdo Oferecido

- Questões (múltipla escolha, certo/errado, dissertativa)
- Resumos e artigos de estudo (vinculados a Conteúdo e, opcionalmente, a Tópico)
- Resolução em texto e resolução em vídeo (vinculadas a 1 questão específica)

---

## 2. Regras de Negócio

| **ID** | **Regra**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| RN01   | Visitante acessa resumos/artigos livremente; questões com restrição; sem perfil/progresso                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rn01 |
| RN02   | Aluno autenticado tem acesso completo a todo o conteúdo e funcionalidades                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rn02 |
| RN03   | Ao acessar questões sem login, visitante é redirecionado para página alternativa com experiência limitada                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rn03 |
| RN04   | Página pública de questões exibe 6 por tópico (2 fáceis, 2 intermediárias, 2 difíceis), fixo no código, sem vídeo explicativo. **Nota de implementação:** esta tela reaproveita o mesmo front-end da tela de questões do usuário logado (ver [[Spec_Filtro_e_Questoes_Logado]]), mas com as restrições de RN01/RN03/RN04/RF03 aplicadas via lógica condicional no backend e no frontend — não é um reaproveitamento 1:1. Detalhes: (a) para o visitante, o Filtro exibe apenas os campos Conteúdo, Tópico e Tipo de questão — os campos Dificuldade e Quantidade de questões não aparecem para o visitante, sendo sempre aplicada a regra fixa de 6 questões por tópico (2 fáceis, 2 intermediárias, 2 difíceis); (b) o vídeo de resolução fica oculto/bloqueado para o visitante; (c) tentativas do visitante não são persistidas em `answered_questions` (sem `user_id`) — contadores da tela ("respondidas", "acertos", "erros") funcionam apenas em estado local/sessão, resetando ao sair; (d) o redirecionamento pós-resposta para cadastro/login ocorre imediatamente após a resposta da 6ª (última) questão do lote — o visitante pode voltar ao Filtro e responder novos lotes de 6 com outros filtros indefinidamente, sem limite total; isso é uma decisão consciente de produto (prioriza acesso ao conteúdo educacional mesmo sem cadastro, coerente com o caráter social do projeto), não uma lacuna; (e) o visitante controla apenas Conteúdo, Tópico e Tipo de questão no Filtro — Dificuldade e Quantidade ficam sempre fixos na regra 2/2/2; (f) **regra de fallback por insuficiência de questões** (vale também para a versão logada, não só para o visitante): se não houver questões suficientes em algum nível de dificuldade dentro do filtro aplicado, o sistema entrega apenas as questões existentes, sem completar a diferença — ex.: filtro com apenas 3 questões cadastradas de um tipo, todas fáceis → retorna 2 fáceis, 0 médias, 0 difíceis (nunca ultrapassa a quantidade real disponível em cada nível). | ^rn04 |
| RN05   | Toda questão deve ter nível de dificuldade obrigatório, atribuído manualmente pela equipe de conteúdo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rn05 |
| RN06   | Uma questão é obrigatoriamente vinculada a 1 ou mais Conteúdos, e opcionalmente a 0 ou mais Tópicos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn06 |
| RN07   | Pontuação por dificuldade é fixa no código: fácil = 10, médio = 15, difícil = 20 (esses valores podem mudar de acordo com os feedbacks dos testes)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn07 |
| RN08   | Ao responder uma questão pela primeira vez: acerto ganha pontos cheios (conforme RN07); erro não ganha nem perde pontos. Aplica-se também à questão dissertativa, cuja correção é feita por autoavaliação do próprio aluno (ver RF05) — não há distinção de origem entre correção automática e autoavaliação no cálculo de pontos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ^rn08 |
| RN09   | Ao refazer uma questão já errada anteriormente e acertar: ganha pontuação fixa de 5 pontos (independente da dificuldade da questão). Regra também se aplica a questões dissertativas autoavaliadas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rn09 |
| RN10   | Ao refazer uma questão já acertada anteriormente: não ganha pontos adicionais, independente do resultado. Regra também se aplica a questões dissertativas autoavaliadas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rn10 |
| RN11   | Cada resposta do aluno gera um novo registro (nunca atualiza um registro anterior), preservando histórico completo de tentativas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ^rn11 |
| RN12   | **Cadastro:** coleta os dados obrigatórios do aluno — nome, e-mail e senha (ver RNF08) — no momento da criação da conta. **Onboarding:** ocorre em seguida ao Cadastro e coleta apenas o checklist de Conteúdos de interesse, de preenchimento opcional (ver RN13). *(Redação anterior atribuía ao Onboarding a coleta de nome/e-mail/senha; corrigido para refletir o fluxo real do protótipo, onde essa coleta ocorre na tela de Cadastro.)*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn12 |
| RN13   | Se o aluno não preencher o checklist de interesses, a experiência é a mesma de quem não marcou nenhum item (sem filtro/priorização)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn13 |
| RN14   | Checklist de interesses é editável depois via tela/modal no perfil, sem reabrir o onboarding. Não há limite mínimo ou máximo de conteúdos que podem ser marcados como interesse.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ^rn14 |
| RN15   | Conteúdo é cadastrado via painel administrativo único, acessível a qualquer membro da equipe de produção de conteúdo (sem distinção de papéis no MVP)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rn15 |
| RN16   | Todo Tópico vinculado a uma questão deve pertencer a um dos Conteúdos já vinculados à mesma questão (validação aplicada no backend)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn16 |
| RN17   | No modo "Progressão" do filtro de dificuldade, as questões retornadas são divididas por: base = quantidade ÷ 3 (arredondado para baixo) em cada nível; o resto é distribuído na ordem fácil → médio → difícil. Exemplos: N=4 → 2 fácil, 1 médio, 1 difícil. N=5 → 2 fácil, 2 médio, 1 difícil. O campo "Quantidade de questões" é obrigatório nesse modo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ^rn17 |
| RN18   | **Day Streak:** calculado on-the-fly a partir do histórico em `answered_questions` (sem campo dedicado em `users`), contando dias distintos com pelo menos 1 questão respondida (independente de acerto ou erro). Corte de dia à meia-noite, horário de Brasília — uma resposta às 23h50 e outra às 00h10 conta como 2 dias consecutivos de streak. O streak zera para 0 caso o aluno fique um dia inteiro sem nenhuma atividade registrada. Não há tolerância/perdão de dias no MVP.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ^rn18 |
| RN19   | **Proteção de acesso ao Onboarding:** ao acessar a URL do Onboarding diretamente, sem sessão ativa (não passou pelo Cadastro/Login), o sistema redireciona para a Home. Um aluno com sessão ativa que já completou o Onboarding anteriormente é redirecionado para o Dashboard ao tentar acessar a URL novamente (não pode refazer). A tela de Onboarding não possui botão "Voltar" (ver RN12 — a conta já foi criada na etapa anterior, evitando duplicação/reabertura do Cadastro).                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ^rn19 |

*RN16 é uma regra de consistência de dados que não é garantida automaticamente pelo banco — deve ser validada na camada de backend (Laravel) no momento do cadastro/edição da questão.*

---

## 3. Requisitos

### 3.1 Requisitos Funcionais

| **ID** | **Descrição**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| RF01   | Sistema deve permitir cadastro e login de aluno                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | ^rf01 |
| RF02   | Sistema deve exibir conteúdo (resumo/artigo) sem necessidade de login                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ^rf02 |
| RF03   | Sistema deve restringir acesso completo a questões e vídeos a usuários autenticados                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ^rf03 |
| RF04   | Sistema deve corrigir automaticamente questões de múltipla escolha e certo/errado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ^rf04 |
| RF05   | Sistema deve exibir explicação de resolução para questões dissertativas. Correção não é automática: o aluno digita a resposta livremente, solicita a resolução ("Ver resolução") e se autoavalia através dos botões "Acertei"/"Errei", gerando um registro em `answered_questions` como qualquer outra questão (ver RN08–RN10). **Risco conhecido e aceito:** por não haver validação real da autoavaliação, existe possibilidade de auto-inflação de pontos; decisão consciente de não mitigar no MVP por volume esperado de questões dissertativas ser baixo (ver [[Pendencias]]).                                                                    | ^rf05 |
| RF06   | Sistema deve permitir filtro/busca de questões por Conteúdo e Tópico. **Extensão:** o filtro deve aceitar também um campo "Quantidade de questões", opcional na maioria dos modos de dificuldade e **obrigatório no modo Progressão** (ver RN17). Para o visitante, os campos Dificuldade e Quantidade de questões não são exibidos (ver RN04).                                                                                                                                                                                                                                                                                                               | ^rf06 |
| RF07   | Sistema deve registrar cada tentativa de resposta do aluno como um novo registro (resultado, data/hora)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ^rf07 |
| RF08   | Sistema deve calcular pontuação de cada tentativa, aplicando a regra de redenção (RN08–RN10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ^rf08 |
| RF09   | Sistema deve exibir pontuação total acumulada do aluno                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rf09 |
| RF10   | Sistema deve oferecer onboarding com checklist opcional de Conteúdos de interesse                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ^rf10 |
| RF11   | Sistema deve permitir edição do checklist de interesses após o onboarding, via tela/modal dedicado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rf11 |
| RF12   | Sistema deve priorizar/filtrar questões e conteúdo recomendado com base nos interesses marcados. **Comportamento do filtro vazio:** quando nenhum filtro é aplicado, o sistema segue um fallback em cascata: (1) conteúdo marcado como interesse no onboarding (`user_interests`) — quando o aluno marca mais de um interesse, o sistema sorteia aleatoriamente entre os marcados a cada sessão; (2) se não houver interesse marcado (RN13), cai para o conteúdo com mais acertos (desempenho); (3) quando o aluno não tem interesse marcado nem histórico de respostas (aluno novo), o sistema exibe conteúdo aleatório entre todos os cadastrados. | ^rf12 |
| RF13   | Sistema deve oferecer painel administrativo para cadastro de Questões, Resumos/Artigos e vínculos com Tópico/Conteúdo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ^rf13 |
| RF14   | Painel administrativo deve oferecer template de cadastro de questão por tipo (múltipla escolha / certo-errado / dissertativa)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ^rf14 |
| RF15   | Sistema deve oferecer fluxo de recuperação de senha ("esqueci minha senha"): aluno solicita reset informando e-mail, recebe link com token de uso único válido por 1 hora, e define nova senha respeitando os requisitos de RNF08. Implementado via sistema de reset de senha nativo do Laravel (`Illuminate\Auth\Passwords`), com envio de e-mail via Brevo (ver RNF09).                                                                                                                                                                                                                                                                                    | ^rf15 |

### 3.2 Requisitos Não Funcionais

| **ID** | **Descrição**                                                                                                                                         |        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| RNF01  | Interface responsiva, com prioridade mobile (público acessa majoritariamente pelo celular)                                                            | ^rnf01 |
| RNF02  | Backend em Laravel expondo API REST                                                                                                                   | ^rnf02 |
| RNF03  | Frontend em React, consumindo API via Axios                                                                                                           | ^rnf03 |
| RNF04  | Expressões matemáticas renderizadas via KaTeX                                                                                                         | ^rnf04 |
| RNF05  | Tamanho mínimo de corpo de texto: 16px (acessibilidade mobile)                                                                                        | ^rnf05 |
| RNF06  | Tamanho base de expressões matemáticas: 18–20px (legibilidade de frações/expoentes no celular)                                                        | ^rnf06 |
| RNF07  | Vídeos de resolução são hospedados externamente (YouTube); sistema armazena apenas a URL                                                              | ^rnf07 |
| RNF08  | A senha do aluno deve ter mínimo 8 caracteres, ao menos 1 número e ao menos 1 letra maiúscula. Tela de Cadastro inclui campo de confirmação de senha. | ^rnf08 |
| RNF09  | Envio de e-mails transacionais (recuperação de senha) via Brevo.                                                                                       | ^rnf09 |

---

## 4. Escopo do MVP

### 4.1 Dentro do MVP

- Autenticação (visitante e aluno)
- Questões: múltipla escolha, certo/errado, dissertativa
- Resumos e artigos de estudo
- Resolução em texto e resolução em vídeo (URL do YouTube), vinculadas a questão específica
- Filtro de questões por Conteúdo/Tópico (incluindo modo Progressão — RN17)
- Página pública de questões (limitada, RN04)
- Histórico de tentativas do aluno, com regra de redenção na pontuação
- Pontuação simples, fixa por dificuldade, com regra de redenção
- Onboarding com checklist opcional de interesses
- Edição de interesses no perfil
- Painel administrativo para cadastro de conteúdo (questões, resumos, resoluções)
- Day Streak (RN18)
- Recuperação de senha (RF15)

### 4.2 Fora do MVP (fases futuras)

- Conquistas/badges
- Vídeo aula de conteúdo geral (não vinculada a questão)
- Fluxo de aprovação pedagógica dentro do sistema
- Revisão futura da regra de tentativas (caso a redenção fixa ainda se mostre insuficiente)
- Critério técnico formal de classificação de dificuldade
- Papéis/permissões diferenciados dentro do painel admin
- Card "sugestão de próximo conteúdo" no Dashboard — descartado do protótipo (a lógica de recomendação do RF12 continua existindo para uso em outras telas)
- **Login/Cadastro via Google** — decisão de escopo: fora do MVP por custo de implementação (OAuth, tratamento de colisão de e-mail, mudança de schema) frente ao prazo apertado. Botão removido do protótipo Figma nas telas de Cadastro e Login.
- **Mascote** — descrito na seção 5.2 de [[Identidade_Visual]] como parte da experiência (onboarding, conquistas, erros, telas vazias), mas foi **postergado para uma fase futura** e não faz parte do escopo atual do MVP.

### 4.3 Pendências de pré-lançamento

- **Termos de Uso e Política de Privacidade** — documento combinado. O campo de aceite já existe na tela de Cadastro (ver [[Fluxo_de_Navegacao]]), mas o documento ainda não existe. Precisa ser redigido e publicado antes do lançamento. → ver [[Pendencias#Termos-e-Privacidade]]

---

## 5. Modelagem de Dados

*Nomenclatura: nomes de tabelas e colunas em inglês (padrão de banco). Tradução em português incluída entre parênteses para facilitar o entendimento da equipe.*

### 5.1 users (usuários / alunos)

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id | PK | Identificador |
| name (nome) | string | Nome do aluno |
| email (e-mail) | string | E-mail, único |
| password (senha) | string | Senha (hash) — ver requisitos mínimos em RNF08 |
| created_at (criado em) | datetime | Data de criação |

*Streak (RN18) não possui coluna dedicada — é calculado on-the-fly a partir de `answered_questions.answered_at` sempre que solicitado (ex: ao carregar o Dashboard).*

### 5.2 contents (conteúdos — nível amplo)

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id | PK | Identificador |
| name (nome) | string | Ex: "Equações do 2º grau" |

### 5.3 topics (tópicos — nível específico)

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id | PK | Identificador |
| name (nome) | string | Ex: "Fórmula de Bhaskara" |
| content_id | FK | Conteúdo ao qual pertence (1 tópico → 1 conteúdo) |

*Relação contents → topics é 1:N. Um conteúdo pode ter vários tópicos, mas cada tópico pertence a exatamente 1 conteúdo.*

### 5.4 questions (questões)

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id | PK | Identificador |
| statement (enunciado) | text | Enunciado da questão |
| type (tipo) | enum | múltipla escolha / certo-errado / dissertativa |
| correct_answer (alternativa certa) | string | Resposta/alternativa correta |
| difficulty (nível de dificuldade) | enum | fácil / médio / difícil |
| text_resolution (resolução em texto) | text | Explicação escrita da resolução |
| video_resolution_url (resolução em vídeo) | string | URL do vídeo no YouTube |

### 5.5 question_content (vínculo questão ↔ conteúdo)

Relação N:N, obrigatória — toda questão deve ter no mínimo 1 registro nesta tabela.

| **Coluna** | **Tipo** |
| --- | --- |
| question_id | FK |
| content_id | FK |

### 5.6 question_topic (vínculo questão ↔ tópico)

Relação N:N, opcional — uma questão pode não ter nenhum tópico vinculado. Quando houver vínculo, o content_id do tópico deve estar presente em algum registro de question_content para a mesma questão (RN16).

| **Coluna** | **Tipo** |
| --- | --- |
| question_id | FK |
| topic_id | FK |

### 5.7 answered_questions (questões respondidas)

Cada resposta do aluno gera uma nova linha — histórico completo de tentativas preservado (RN11). **Nota:** tentativas de visitante (sem login) não geram registro nesta tabela (ver RN04). Questões dissertativas autoavaliadas geram registro normalmente (ver RF05) — não há coluna adicional distinguindo correção automática de autoavaliação.

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id | PK | Identificador |
| user_id | FK | Referência a users |
| question_id | FK | Referência a questions |
| is_correct (acertou) | boolean | Se essa tentativa foi correta |
| points_earned (pontos ganhos) | integer | Pontos dessa tentativa específica (0, redenção ou cheio) |
| answered_at (respondido em) | datetime | Data/hora da tentativa |

### 5.8 study_materials (resumos e artigos de estudo)

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id | PK | Identificador |
| title (título) | string | Título do material |
| content (conteúdo do texto) | text | Corpo do texto |
| topic_id | FK | Referência a topics (opcional) |
| content_id | FK | Referência a contents |

### 5.9 user_interests (interesses do aluno)

Usado no checklist de onboarding e na tela/modal de edição de interesses no perfil. Sem limite mínimo/máximo de registros por aluno (ver RN14).

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| user_id | FK | Referência a users |
| content_id | FK | Referência a contents |

### 5.10 password_reset_tokens (recuperação de senha)

Tabela padrão do Laravel (`Illuminate\Auth\Passwords`), usada pelo fluxo de RF15.

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| email | string | E-mail do aluno solicitante |
| token | string | Token de reset (hash), uso único |
| created_at | datetime | Usado para calcular expiração (1 hora, ver RF15) |
