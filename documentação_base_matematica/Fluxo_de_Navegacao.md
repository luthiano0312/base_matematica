# Fluxo_de_Navegacao
**Projeto:** Ceará Científico
**Tipo de documento:** Índice de Navegação
**Última atualização:** 22/07/2026

> Este documento é o **índice/mapa de alto nível** do fluxo de navegação do sistema. Telas que já têm uma spec de tela detalhada apontam para o documento correspondente. Telas sem spec detalhada ainda mantêm aqui um resumo de seus componentes, até que uma spec dedicada seja criada.

## Fluxo de Navegação

```text
Home
├── Cadastro
│   └── Onboarding
│       └── Dashboard
├── Login
│   └── Dashboard
├── Questões (sem login)
└── Materiais de Estudos (será implementado posteriormente)
```

A partir do **Dashboard**:

```text
Dashboard
├── Questões
└── Materiais de Estudos (será implementado posteriormente)
```

---

# Telas

## Home

### Objetivo
Apresentar o projeto, explicar seu propósito e incentivar o usuário a começar a utilizar a plataforma.

### Componentes

#### Hero
- Frase forte que resume o projeto
- Título
- Subtítulo
- Imagem de fundo
- Botão único: **"Começar gratuitamente"**

> *Nota: versão anterior deste documento previa 2 botões no Hero ("Começar" / "Conhecer o projeto"). Atualizado para refletir o protótipo Figma vigente, que usa 1 botão único.*

#### Menu (ícone hambúrguer)
O ícone de menu no header abre um menu com:
- Links de navegação pelas seções da própria Home (scroll para Objetivo, Problema, Solução, Como funciona, Público-alvo)
- Link direto para "Questões (sem login)"

Não inclui link para Materiais de Estudos, já que essa funcionalidade ainda não foi implementada.

#### Objetivo do projeto
Explicar que o projeto busca:
- tornar o ensino da matemática mais acessível;
- incentivar os estudos por meio da gamificação;
- aumentar o interesse dos estudantes;
- contribuir para o aprendizado.

#### Problema
Explicar:
- por que o projeto foi criado;
- qual problema ele resolve.

#### Solução
Explicação de como o projeto resolve o problema.

#### Como funciona
Visão geral da plataforma e de suas funcionalidades.

#### Público-alvo
Explicar para quem o projeto foi desenvolvido.

#### Chamada final (CTA)
- frase inspiradora;
- botão **Começar Agora**.

#### Rodapé

> **Nota de escopo:** o rodapé ainda não foi prototipado no Figma — o time optou por definir a estrutura de conteúdo mínima aqui e resolver o design diretamente na implementação, sem necessidade de um protótipo visual elaborado (é apenas o rodapé).

Estrutura de conteúdo mínima:
- **Quem somos:** breve descrição do projeto (1–2 frases, reaproveitando a missão descrita em [[Identidade_Visual#1.1 Missão do Projeto]])
- **Informações da equipe:** menção ao caráter social do projeto e ao tamanho da equipe (ver [[Arquitetura#2. Equipe]]) — não precisa listar nomes individuais no MVP
- **Links de navegação:** atalhos para as mesmas seções acessíveis pelo menu hambúrguer (Objetivo, Como funciona, etc.)
- **Links legais:** Termos de Uso e Política de Privacidade (documento combinado, ver [[Pendencias#Termos-e-Privacidade]])
- **Copyright/ano:** linha simples de rodapé (ex: "© 2026 Base Matemática")

---

## Cadastro

### Objetivo
Criar uma nova conta.

### Campos
- Nome
- Email
- Senha (mínimo 8 caracteres, 1 número, 1 letra maiúscula — ver [[Analise_do_Sistema#^rnf08|RNF08]])
- Confirmação de senha

### Ação
- Cadastrar-se

> **Nota:** o botão "Entrar com Google" presente em versões anteriores do protótipo foi removido — login via Google está fora do escopo do MVP (ver [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)|Fora do MVP]]).

### Fluxo

```text
Cadastro
    ↓
Onboarding
```

---

## Login

### Objetivo
Permitir acesso à plataforma.

### Campos
- Email
- Senha

### Ações
- Entrar
- **Esqueci minha senha** (ver [[Analise_do_Sistema#^rf15|RF15]]) — inicia fluxo de recuperação: aluno informa e-mail, recebe link de reset (token de uso único, válido por 1 hora) por e-mail via Brevo, define nova senha.

> **Nota:** o botão "Entrar com Google" presente em versões anteriores do protótipo foi removido — login via Google está fora do escopo do MVP.

### Fluxo

```text
Login
    ↓
Dashboard
```

---

## Onboarding

### Objetivo
Conhecer os interesses do usuário para personalizar sua experiência.

### Acesso
Ocorre imediatamente após o Cadastro. Não possui botão "Voltar" (a conta já foi criada na etapa anterior — ver [[Analise_do_Sistema#^rn19|RN19]]). Proteção de acesso direto via URL: sem sessão ativa → redireciona para Home; sessão ativa que já completou o onboarding → redireciona para Dashboard.

### Componentes

#### Checklist de conteúdos de interesse
Lista de tópicos para o usuário selecionar, carregada dinamicamente da tabela `contents` (não hardcoded). Exibida com paginação "mostrar mais" caso a lista seja extensa. Sem limite mínimo ou máximo de seleção. Item selecionado usa a cor de destaque azul primário (`#258BFC`, ver [[Identidade_Visual#2. Paleta de Cores]]).

Exemplo:

> "Em quais conteúdos você tem mais dificuldade?"

---

## Dashboard

### Objetivo
Exibir um resumo do progresso do usuário.

### Componentes

#### Atalhos
Acesso rápido para:
- Questões
- Materiais de estudo

#### Day Streak
Indicador de sequência diária de estudos (ver [[Analise_do_Sistema#^rn18|RN18]]).

#### Card de desempenho
Deve apresentar:
- total de questões respondidas;
- acertos;
- erros;
- percentual de acerto (exibe "Sem dados ainda" quando o aluno não possui nenhuma tentativa registrada, evitando divisão por zero);
- tópico com maior número de acertos (exibe "Sem dados ainda" quando o aluno possui tentativas mas nenhum acerto ainda);
- questões resolvidas.

> **Nota:** o card "sugestão de próximo conteúdo para estudar", previsto em versões anteriores deste documento, foi **descartado** — não consta no protótipo Figma e a equipe decidiu não incluí-lo no MVP. A lógica de recomendação de conteúdo (RF12) permanece implementada para uso em outras partes do sistema.

---

## Questões (acesso sem login)

Reaproveita o front-end da tela de Questões do usuário logado — ver [[Spec_Filtro_e_Questoes_Logado]] — com restrições aplicadas via lógica condicional (ver [[Analise_do_Sistema#^rn04|RN04]]).

O Filtro exibido ao visitante contém apenas os campos **Conteúdo**, **Tópico** e **Tipo de questão** — os campos Dificuldade e Quantidade de questões não são exibidos, sendo sempre aplicada a regra fixa de 6 questões por tópico (2 fáceis, 2 médias, 2 difíceis, ou o total disponível quando inferior a isso — ver RN04). Ao final do lote de 6 questões, é exibido o mesmo modal de encerramento da versão logada (total respondidas, acertos, erros, pontos), seguido de redirecionamento para a tela de Cadastro.

---

## Questões (usuário logado)

→ ver [[Spec_Filtro_e_Questoes_Logado]]

---

## Materiais de Estudos

### Objetivo
Disponibilizar materiais para aprendizagem.

### Acesso
Disponível:
- pela Home;
- pelo Dashboard.

> **Observação:** a estrutura detalhada dessa tela ainda não foi definida. Ainda não possui link no menu hambúrguer da Home (ver seção "Menu" acima), por não estar implementada no MVP atual.

---

# Fluxos Resumidos

## Novo usuário

```text
Home
    ↓
Cadastro
    ↓
Onboarding
    ↓
Dashboard
```

## Usuário existente

```text
Home
    ↓
Login
    ↓
Dashboard
```

## Visitante

```text
Home
    ↓
Questões
        ↓
Responder 6 questões (lote fixo 2/2/2)
        ↓
Modal de encerramento
        ↓
Cadastro/Login
```

> Visitante pode retornar ao Filtro e repetir o ciclo com outros filtros, sem limite total de lotes (decisão consciente de produto — ver [[Analise_do_Sistema#^rn04|RN04]]).

---

# Funcionalidades previstas

- Cadastro
- Login
- Recuperação de senha
- Onboarding
- Dashboard
- Day Streak
- Estatísticas de desempenho
- Sistema de filtros
- Questões com pontuação
- Resolução comentada
- Vídeos de resolução
- Materiais de estudo
- Gamificação
