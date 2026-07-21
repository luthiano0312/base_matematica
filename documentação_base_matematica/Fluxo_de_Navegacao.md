# Fluxo_de_Navegacao
**Projeto:** Ceará Científico
**Tipo de documento:** Índice de Navegação
**Última atualização:** 20/07/2026

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
- Botões:
  - Começar
  - Conhecer o projeto

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
- Quem somos
- Informações da equipe

---

## Cadastro

### Objetivo
Criar uma nova conta.

### Campos
- Nome
- Email
- Senha (ver requisitos mínimos em [[Analise_do_Sistema#^rnf08|RNF08]] — ainda pendente, ver [[Pendencias#RNF-senha]])

### Ação
- Cadastrar-se

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

### Componentes

#### Checklist de conteúdos de interesse
Lista de tópicos para o usuário selecionar.

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
Indicador de sequência diária de estudos.

#### Card de desempenho
Deve apresentar:
- total de questões respondidas;
- acertos;
- erros;
- percentual de acerto;
- sugestão de próximo conteúdo para estudar;
- tópico com maior número de acertos;
- questões resolvidas.

---

## Questões (acesso sem login)

Reaproveita o front-end da tela de Questões do usuário logado — ver [[Spec_Filtro_e_Questoes_Logado]] — com restrições aplicadas via lógica condicional (ver [[Analise_do_Sistema#^rn04|RN04]]).

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

> **Observação:** a estrutura detalhada dessa tela ainda não foi definida.

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
Responder questões
        ↓
Cadastro/Login
```

---

# Funcionalidades previstas

- Cadastro
- Login
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
