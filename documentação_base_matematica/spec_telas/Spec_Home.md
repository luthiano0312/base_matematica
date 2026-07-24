# Home — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
[Entrada direta — URL raiz / primeiro acesso]
   ↓
Home
   ├── clique em "entrar" (header) ──────────────────→ Login
   ├── clique no ícone de menu (header) ─────────────→ abre menu (ver "Menu" abaixo)
   │        ├── links de navegação pelas seções da Home
   │        └── link "Experimente alguns exercícios" ─→ Questões (sem login)
   ├── clique em "começe gratuitamente" (hero) ──────→ Cadastro
   └── clique em "Começar agora" (CTA final) ────────→ Cadastro
```

A Home é a porta de entrada do sistema para visitantes não autenticados. Não há pré-requisito de navegação para chegar até ela. A saída se dá para **Cadastro**, **Login**, ou **Questões (sem login)** via o menu — decisão fechada, ver componente "Menu" abaixo.

---

## Campos / Componentes

### Header
- **Tipo:** barra fixa no topo (não fica claro no protótipo estático se é `sticky`/fixed durante o scroll — assumir `sticky` por ser padrão em landing pages mobile-first).
- **Conteúdo:** logo ("base matemática"), botão "entrar", ícone de menu (hambúrguer).
- **Comportamento:**
  - Botão **entrar** → navega para Login.
  - Ícone de **menu** → decisão fechada, ver componente "Menu" abaixo.

### Menu (ícone hambúrguer) — decisão fechada
- **Tipo:** menu/dropdown aberto pelo ícone hambúrguer do header
- **Conteúdo:**
  - Links de navegação por scroll até as seções da própria Home: Objetivo, Problema, Solução, Como funciona, Público-alvo
  - Link **"Experimente alguns exercícios"**, que navega direto para a tela de Questões (sem login) — ver [[Fluxo_de_Navegacao#Questões (acesso sem login)]]
- **Não inclui** link para Materiais de Estudos, já que essa funcionalidade ainda não foi implementada no MVP.
- Resolve a antiga Pendência 1 (divergência entre [[Fluxo_de_Navegacao]] e o protótipo): o acesso a "Questões (sem login)" pela Home existe, mas vive dentro do menu, não como botão solto na tela.

### Hero
- **Tipo:** seção de destaque, topo da página.
- **Conteúdo:**
  - Título: "Construa sua base em matemática aprendendo na prática" (com destaque de cor no trecho "aprendendo na prática").
  - Subtítulo: "Uma plataforma de ensino gamificado que ajuda alunos do ensino médio a dominarem a matemática resolvendo exercícios."
  - Botão único: "começe gratuitamente"
- **Comportamento:** botão navega para Cadastro.
- **Decisão fechada (antiga Pendência 2):** o Hero tem **1 botão só**. A versão anterior da documentação, que previa 2 botões ("Começar" / "Conhecer o projeto"), estava desatualizada e foi corrigida — o protótipo Figma vigente é a referência.

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
  - Rótulo: **"PÚBLICO-ALVO"** — decisão fechada (antiga Pendência 3). O rótulo "A SOLUÇÃO", duplicado da seção anterior, já foi corrigido diretamente no protótipo Figma.
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

### Rodapé — decisão fechada (antiga Pendência 4)
- **Tipo:** seção de encerramento da página, fora do fluxo de scroll principal
- **Comportamento:** entra no MVP. Não foi prototipado visualmente no Figma — o time optou por definir o conteúdo mínimo em texto e resolver o design diretamente na implementação, sem necessidade de protótipo visual elaborado.
- **Conteúdo completo (4 colunas + linha de copyright) já definido em** [[Fluxo_de_Navegacao#Rodapé]] — não duplicado aqui para evitar desalinhamento entre os dois documentos; consultar a spec de navegação para o texto pronto de cada coluna.

---

## Comportamento em casos especiais

- **Visitante vs. aluno logado:** a Home é destinada a visitantes. Não há variação de conteúdo prevista no protótipo para usuário já autenticado — comportamento de um aluno logado que acessa a Home (ex: redirecionar direto para o Dashboard, ou manter a Home igual) **não está definido** e não bloqueia o MVP. Recomenda-se redirecionar automaticamente para o Dashboard se houver sessão ativa, mas isso precisa ser validado com o time em uma rodada futura.
- **Responsividade:** o protótipo foi desenhado em largura mobile (412px), conforme prioridade definida em [[Analise_do_Sistema#^rnf01|RNF01]]. O comportamento em telas maiores (desktop) não está desenhado no protótipo — deve seguir os princípios gerais de responsividade da [[Arquitetura]], sem quebrar a hierarquia de conteúdo. O rodapé, especificamente, deve usar layout em colunas no desktop e empilhado verticalmente no mobile (ver [[Fluxo_de_Navegacao#Rodapé]]).
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

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]].
