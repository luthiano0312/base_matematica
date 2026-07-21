# Arquitetura
**Projeto:** Ceará Científico
**Tipo de documento:** Arquitetura
**Última atualização:** 20/07/2026

*Projeto Social de Educação Matemática*

## 1. Introdução e Contexto

Este documento formaliza as decisões de arquitetura do sistema do Ceará Científico, uma plataforma educacional de caráter social voltada ao ensino de matemática para jovens do ensino médio. As definições aqui registradas orientam o desenvolvimento técnico do produto e devem servir como referência para toda a equipe.

## 2. Equipe

O projeto conta com 9 integrantes com papéis bem definidos:

| **Papel** | **Quantidade** | **Responsabilidade** |
| --- | --- | --- |
| Desenvolvedores | 2 | Desenvolvimento do sistema |
| Produtores de conteúdo | 7 | Criação de questões, resumos e vídeos |

A validação pedagógica do conteúdo é responsabilidade da professora orientadora de matemática em conjunto com os membros da equipe com experiência na área.

## 3. Funcionalidades do MVP

O MVP foca no essencial para o ensino de matemática, priorizando as funcionalidades de maior impacto pedagógico. Funcionalidades de gamificação e recursos adicionais serão desenvolvidos em fases posteriores, com exceção de um sistema de pontuação básico que será desenvolvido para esse MVP.

### 3.1 Questões

O núcleo da plataforma. Existem três tipos de questão:

- **Múltipla escolha**
  - O aluno seleciona uma dentre as opções apresentadas
  - Correção automática pelo sistema
- **Certo ou errado**
  - O aluno avalia uma afirmação como verdadeira ou falsa
  - Correção automática pelo sistema
- **Dissertativa**
  - O aluno escreve sua resposta livremente
  - O sistema exibe a explicação da resolução para comparação
  - A avaliação fica a cargo do próprio aluno

### 3.2 Resumos e Artigos

Conteúdo textual de apoio ao aprendizado. Cada resumo ou artigo está vinculado a um tópico matemático ou conteúdo e serve como material de suporte para as questões correspondentes, além de servir como material didático para estudo.

### 3.3 Vídeo Aulas

Conteúdo em vídeo dividido em duas categorias:

- Resolução em vídeo para questões específicas

## 4. Stack Tecnológica

| **Camada** | **Tecnologia** | **Observação** |
| --- | --- | --- |
| Plataforma | Web | Responsividade levada a sério desde o início |
| Backend | Laravel | API REST consumida pelo frontend |
| Frontend | React | Interface do usuário |
| HTTP Client | Axios | Comunicação entre frontend e API |
| Renderização de fórmulas | KaTeX | |

A responsividade deve ser considerada desde o início do desenvolvimento — não como ajuste final. O público-alvo (jovens do ensino médio) acessa majoritariamente pelo celular.

## 5. Cronograma de Desenvolvimento

| **Período** | **Disponibilidade** | **Foco** |
| --- | --- | --- |
| Até julho | ~2 horas/dia | Preparação: aprendizado de React, modelagem de dados, configuração do projeto |
| Férias de julho | Dia todo | Sprint principal: desenvolvimento do MVP completo |

Prazo final: fim de julho de 2025. Após as férias, a disponibilidade da equipe de desenvolvimento reduz significativamente. O MVP deve estar funcional até o final das férias.
