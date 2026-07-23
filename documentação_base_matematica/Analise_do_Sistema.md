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
| RN04   | Página pública de questões exibe 6 por tópico (2 fáceis, 2 intermediárias, 2 difíceis), fixo no código, sem vídeo explicativo. **Nota de implementação:** esta tela reaproveita o mesmo front-end da tela de questões do usuário logado (ver [[Spec_Filtro_e_Questoes_Logado]]), mas com as restrições de RN01/RN03/RN04/RF03 aplicadas via lógica condicional no backend e no frontend — não é um reaproveitamento 1:1. Detalhes: (a) para o visitante, os filtros não são livres — o sistema aplica automaticamente a restrição de 6 questões fixas por tópico (2 fáceis, 2 intermediárias, 2 difíceis); (b) o vídeo de resolução fica oculto/bloqueado para o visitante; (c) tentativas do visitante não são persistidas em `answered_questions` (sem `user_id`) — contadores da tela ("respondidas", "acertos", "erros") funcionam apenas em estado local/sessão, resetando ao sair; (d) o redirecionamento pós-resposta para cadastro/login continua valendo. | ^rn04 |
| RN05   | Toda questão deve ter nível de dificuldade obrigatório, atribuído manualmente pela equipe de conteúdo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rn05 |
| RN06   | Uma questão é obrigatoriamente vinculada a 1 ou mais Conteúdos, e opcionalmente a 0 ou mais Tópicos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn06 |
| RN07   | Pontuação por dificuldade é fixa no código: fácil = 10, intermediário = 15, difícil = 20 (esses valores podem mudar de acordo com os feedbacks dos testes)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ^rn07 |
| RN08   | Ao responder uma questão pela primeira vez: acerto ganha pontos cheios (conforme RN07); erro não ganha nem perde pontos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ^rn08 |
| RN09   | Ao refazer uma questão já errada anteriormente e acertar: ganha pontuação fixa de 5 pontos (independente da dificuldade da questão)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn09 |
| RN10   | Ao refazer uma questão já acertada anteriormente: não ganha pontos adicionais, independente do resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ^rn10 |
| RN11   | Cada resposta do aluno gera um novo registro (nunca atualiza um registro anterior), preservando histórico completo de tentativas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ^rn11 |
| RN12   | Onboarding pede dados básicos (nome, e-mail, senha) obrigatórios e checklist de Conteúdos de interesse, opcional                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ^rn12 |
| RN13   | Se o aluno não preencher o checklist de interesses, a experiência é a mesma de quem não marcou nenhum item (sem filtro/priorização)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn13 |
| RN14   | Checklist de interesses é editável depois via tela/modal no perfil, sem reabrir o onboarding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ^rn14 |
| RN15   | Conteúdo é cadastrado via painel administrativo único, acessível a qualquer membro da equipe de produção de conteúdo (sem distinção de papéis no MVP)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rn15 |
| RN16   | Todo Tópico vinculado a uma questão deve pertencer a um dos Conteúdos já vinculados à mesma questão (validação aplicada no backend)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rn16 |
| RN17   | No modo "Progressão" do filtro de dificuldade, as questões retornadas são divididas por: base = quantidade ÷ 3 (arredondado para baixo) em cada nível; o resto é distribuído na ordem fácil → médio → difícil. Exemplos: N=4 → 2 fácil, 1 médio, 1 difícil. N=5 → 2 fácil, 2 médio, 1 difícil. O campo "Quantidade de questões" é obrigatório nesse modo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rn17 |

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
| RF05   | Sistema deve exibir explicação de resolução para questões dissertativas, sem correção automática                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ^rf05 |
| RF06   | Sistema deve permitir filtro/busca de questões por Conteúdo e Tópico. **Extensão:** o filtro deve aceitar também um campo "Quantidade de questões", opcional na maioria dos modos de dificuldade e **obrigatório no modo Progressão** (ver RN17).                                                                                                                                                                                                                                                                                                                                                                                                               | ^rf06 |
| RF07   | Sistema deve registrar cada tentativa de resposta do aluno como um novo registro (resultado, data/hora)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ^rf07 |
| RF08   | Sistema deve calcular pontuação de cada tentativa, aplicando a regra de redenção (RN08–RN10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ^rf08 |
| RF09   | Sistema deve exibir pontuação total acumulada do aluno                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ^rf09 |
| RF10   | Sistema deve oferecer onboarding com checklist opcional de Conteúdos de interesse                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ^rf10 |
| RF11   | Sistema deve permitir edição do checklist de interesses após o onboarding, via tela/modal dedicado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ^rf11 |
| RF12   | Sistema deve priorizar/filtrar questões e conteúdo recomendado com base nos interesses marcados. **Comportamento do filtro vazio (atualizado):** quando nenhum filtro é aplicado, o sistema segue um fallback em cascata: (1) conteúdo marcado como interesse no onboarding (`user_interests`),Quando o aluno marca mais de um interesse, o sistema sorteia aleatoriamente entre os marcados a cada sessão; (2) se não houver interesse marcado (RN13), cai para o conteúdo com mais acertos (desempenho); (3) Quando o aluno não tem interesse marcado nem histórico de respostas (aluno novo), o sistema exibe conteúdo aleatório entre todos os cadastrados. | ^rf12 |
| RF13   | Sistema deve oferecer painel administrativo para cadastro de Questões, Resumos/Artigos e vínculos com Tópico/Conteúdo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ^rf13 |
| RF14   | Painel administrativo deve oferecer template de cadastro de questão por tipo (múltipla escolha / certo-errado / dissertativa)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ^rf14 |

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

### 4.2 Fora do MVP (fases futuras)

- Conquistas/badges
- Vídeo aula de conteúdo geral (não vinculada a questão)
- Fluxo de aprovação pedagógica dentro do sistema
- Revisão futura da regra de tentativas (caso a redenção fixa ainda se mostre insuficiente)
- Critério técnico formal de classificação de dificuldade
- Papéis/permissões diferenciados dentro do painel admin
- **Mascote** — descrito na seção 5.2 de [[Identidade_Visual]] como parte da experiência (onboarding, conquistas, erros, telas vazias), mas foi **postergado para uma fase futura** e não faz parte do escopo atual do MVP.

### 4.3 Pendências de pré-lançamento

- **Termos de Uso** — o campo de aceite já existe na tela de Cadastro (ver [[Fluxo_de_Navegacao]]), mas o documento de Termos de Uso ainda não existe. Precisa ser redigido e publicado antes do lançamento. → ver [[Pendencias#Termos-de-Uso]]

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

| **Coluna**                                | **Tipo** | **Descrição**                                  |
| ----------------------------------------- | -------- | ---------------------------------------------- |
| id                                        | PK       | Identificador                                  |
| statement (enunciado)                     | text     | Enunciado da questão                           |
| type (tipo)                               | enum     | múltipla escolha / certo-errado / dissertativa |
| correct_answer (alternativa certa)        | string   | Resposta/alternativa correta                   |
| difficulty (nível de dificuldade)         | enum     | fácil / média / difícil                        |
| text_resolution (resolução em texto)      | text     | Explicação escrita da resolução                |
| video_resolution_url (resolução em vídeo) | string   | URL do vídeo no YouTube                        |

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

Cada resposta do aluno gera uma nova linha — histórico completo de tentativas preservado (RN11). **Nota:** tentativas de visitante (sem login) não geram registro nesta tabela (ver RN04).

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

Usado no checklist de onboarding e na tela/modal de edição de interesses no perfil.

| **Coluna** | **Tipo** | **Descrição** |
| --- | --- | --- |
| user_id | FK | Referência a users |
| content_id | FK | Referência a contents |
