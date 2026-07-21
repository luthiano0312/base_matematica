# Home — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
[Entrada direta — URL raiz / primeiro acesso]
   ↓
Home
   ├── clique em "entrar" (header) ──────────────→ Login
   ├── clique em "começe gratuitamente" (hero) ──→ Cadastro
   └── clique em "Começar agora" (CTA final) ────→ Cadastro
```

A Home é a porta de entrada do sistema para visitantes não autenticados. Não há pré-requisito de navegação para chegar até ela. A saída se dá sempre para **Cadastro** ou **Login**, conforme o botão escolhido — não há acesso a Questões ou Materiais diretamente pela Home neste protótipo (diferente do índice em [[Fluxo_de_Navegacao]], que lista "Questões (sem login)" como filho da Home — ver Pendência 1 abaixo).

---

## Campos / Componentes

### Header
- **Tipo:** barra fixa no topo (não fica claro no protótipo estático se é `sticky`/fixed durante o scroll — assumir `sticky` por ser padrão em landing pages mobile-first).
- **Conteúdo:** logo ("base matemática"), botão "entrar", ícone de menu (hambúrguer).
- **Comportamento:**
  - Botão **entrar** → navega para Login.
  - Ícone de **menu** → o protótipo não define o conteúdo do menu (não há tela de menu aberto). Assumir que é o menu mobile padrão, com no mínimo os mesmos destinos do header (Entrar) — **comportamento exato pendente de definição**.

### Hero
- **Tipo:** seção de destaque, topo da página.
- **Conteúdo:**
  - Título: "Construa sua base em matemática aprendendo na prática" (com destaque de cor no trecho "aprendendo na prática").
  - Subtítulo: "Uma plataforma de ensino gamificado que ajuda alunos do ensino médio a dominarem a matemática resolvendo exercícios."
  - Botão: "começe gratuitamente"
- **Comportamento:** botão navega para Cadastro.
- **Observação:** [[Fluxo_de_Navegacao]] descreve dois botões no Hero ("Começar" e "Conhecer o projeto"), mas o protótipo Figma mostra apenas **um** botão ("começe gratuitamente"). Ver Pendência 2.

### Seção "Objetivo do projeto"
- **Tipo:** bloco de texto + lista de cards.
- **Conteúdo:**
  - Rótulo: "OBJETIVO DO PROJETO"
  - Título: "Tornar a matemática mais acessível para todo mundo."
  - Texto de apoio explicando o caráter social/gamificado do projeto.
  - 4 cards brancos, cada um com um título curto e uma descrição de uma linha:
    1. "Questões gamificadas" — Aprenda resolvendo desafios
    2. "Conteúdos organizados" — Estude por assunto e tópico
    3. "Acompanhe seu progresso" — Pontuação e evolução contínua
    4. "Totalmente acessível" — Feito para celular e computador
- **Comportamento:** estático, sem interação (cards não são clicáveis).

### Seção "O problema"
- **Tipo:** bloco de texto + lista de cards escuros.
- **Conteúdo:**
  - Rótulo: "O PROBLEMA"
  - Título: "Por que criamos este projeto?"
  - Texto de apoio.
  - 3 cards escuros com ícone, título e descrição:
    1. "Medo da disciplina"
    2. "Defasagem acumulada"
    3. "Falta de acesso"
- **Comportamento:** estático, sem interação.

### Seção "A solução"
- **Tipo:** bloco de texto + lista de itens com check + card ilustrativo de questão.
- **Conteúdo:**
  - Rótulo: "A SOLUÇÃO"
  - Título: "Aprender matemática fica mais simples quando existe um caminho."
  - Texto de apoio.
  - 3 itens com ícone de check, título curto e descrição:
    1. "Aprenda por etapas"
    2. "Receba feedback imediato"
    3. "Evolua no seu ritmo"
  - Um card escuro ilustrando visualmente como é uma questão na plataforma (tag de dificuldade, enunciado, imagem, 4 alternativas). **É apenas ilustrativo/decorativo** — não é uma questão funcional, não tem interação de resposta.
- **Comportamento:** estático, sem interação real nas alternativas do card ilustrativo.

### Seção "Como funciona"
- **Tipo:** bloco de texto + grid 2x2 de cards.
- **Conteúdo:**
  - Rótulo: "COMO FUNCIONA"
  - Título: "Tudo que você precisa para estudar melhor."
  - Texto de apoio.
  - 4 cards com ícone, título e descrição:
    1. "Questões variadas"
    2. "Resumos e artigos"
    3. "Resolução em vídeo"
    4. "Pontuação justa"
- **Comportamento:** estático, sem interação.

### Seção "Público-alvo"
- **Tipo:** bloco de texto + ilustração decorativa (imagem de pessoa usando celular + círculos coloridos de fundo).
- **Conteúdo:**
  - Rótulo: "A SOLUÇÃO" (repetido — parece reaproveitamento do mesmo rótulo da seção anterior; **provável inconsistência de conteúdo no protótipo**, ver Pendência 3).
  - Título: "Feito para o aluno do ensino médio."
  - Texto de apoio direcionado a alunos do 1º ao 3º ano / preparação para o Enem.
- **Comportamento:** estático, puramente ilustrativo.

### Seção "Chamada final (CTA)"
- **Tipo:** seção de encerramento com fundo em gradiente e elementos decorativos (símbolos matemáticos ao fundo).
- **Conteúdo:**
  - Título: "Sua base começa hoje."
  - Texto de apoio: "Junte-se à comunidade de alunos que estão redescobrindo a matemática, um exercício de cada vez."
  - Botão: "Começar agora"
- **Comportamento:** botão navega para Cadastro.

---

## Comportamento em casos especiais

- **Visitante vs. aluno logado:** a Home é destinada a visitantes. Não há variação de conteúdo prevista no protótipo para usuário já autenticado — comportamento de um aluno logado que acessa a Home (ex: redirecionar direto para o Dashboard, ou manter a Home igual) **não está definido**. Recomenda-se redirecionar automaticamente para o Dashboard se houver sessão ativa, mas isso precisa ser validado com o time.
- **Responsividade:** o protótipo foi desenhado em largura mobile (412px), conforme prioridade definida em [[Analise_do_Sistema#^rnf01|RNF01]]. O comportamento em telas maiores (desktop) não está desenhado no protótipo — deve seguir os princípios gerais de responsividade da [[Arquitetura]], sem quebrar a hierarquia de conteúdo.
- **Estados de erro/carregamento:** não se aplicam — a Home é uma página estática, sem dados dinâmicos vindos da API.

---

## Informações exibidas

### Estado único (página estática, sem variação de dados)
- Todo o conteúdo institucional descrito nos componentes acima (textos fixos, não vêm do backend).
- Nenhuma informação de usuário é exibida (sem nome, pontuação, progresso — isso é exclusivo do Dashboard).

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rnf01\|RNF01]] | Interface responsiva, prioridade mobile |

*Nenhuma outra regra de negócio (RN/RF) do documento de Análise do Sistema se aplica diretamente à Home — é uma tela institucional/estática, sem lógica de dados.*

---

## Pendências identificadas nesta tela

1. **Divergência de estrutura:** [[Fluxo_de_Navegacao]] lista "Questões (sem login)" e "Materiais de Estudos" como acessíveis diretamente pela Home. O protótipo Figma da Home não mostra links/botões para essas telas — os únicos destinos são Cadastro e Login. Confirmar se esses acessos devem ser adicionados à Home ou se ocorrem só a partir do Dashboard.
2. **Divergência de botões do Hero:** documentação prévia menciona 2 botões ("Começar" e "Conhecer o projeto"); protótipo mostra apenas 1 ("começe gratuitamente"). Confirmar qual versão vale.
3. **Rótulo duplicado:** a seção "Público-alvo" usa o rótulo "A SOLUÇÃO", igual à seção anterior. Provavelmente deveria ser algo como "PARA QUEM É" ou "PÚBLICO-ALVO". Confirmar o texto correto.
4. **Rodapé ausente:** [[Fluxo_de_Navegacao]] prevê um rodapé com "Quem somos" e "Informações da equipe". Esse bloco não existe no protótipo Figma atual. Confirmar se deve ser incluído no MVP ou fica de fora.
5. **Comportamento do ícone de menu:** não há tela/estado mostrando o que abre ao clicar no ícone de menu no header. Definir conteúdo (provavelmente os mesmos links do rodapé/header em formato mobile).
