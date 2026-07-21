# Identidade_Visual
**Projeto:** Ceará Científico
**Tipo de documento:** Identidade Visual
**Última atualização:** 20/07/2026

*Projeto Social de Educação Matemática*

## 1. Introdução e Posicionamento

Este documento formaliza as decisões de identidade visual do projeto Ceará Científico, uma plataforma educacional de caráter social voltada ao ensino de matemática para jovens do ensino médio. As definições aqui registradas orientam o desenvolvimento visual do produto e devem servir como referência para todos os membros da equipe.

### 1.1 Missão do Projeto

O projeto tem como objetivo ensinar os fundamentos da matemática de forma acessível, progressiva e engajante, em um formato inspirado em plataformas de aprendizado gamificado como o Duolingo.

### 1.2 Posicionamento Visual

A identidade visual deve comunicar simultaneamente dois valores centrais:

- **Confiança** — a plataforma transmite seriedade educacional. O usuário deve sentir que está se preparando de verdade.
- **Acessibilidade** — qualquer pessoa consegue aprender. A matemática não deve causar medo ou intimidação.

Esse equilíbrio — sério, mas acolhedor — é o princípio que orienta todas as decisões visuais descritas neste documento.

## 2. Paleta de Cores

A paleta foi desenvolvida para equilibrar profissionalismo e energia. Cores frias e escuras ancoram a seriedade educacional, enquanto os tons vibrantes trazem o elemento lúdico e de gamificação.

| **Nome** | **Código Hex** | **Papel na identidade** |
| --- | --- | --- |
| Verde vibrante | `#26E874` | Acertos, progresso, gamificação |
| Azul primário | `#258BFC` | Cor principal — navegação e ação |
| Azul escuro | `#061D44` | Fundos escuros, tipografia principal |
| Magenta | `#DE4EE1` | Destaque criativo — uso pontual |
| Lavanda | `#EFEEFF` | Fundo claro, respiro visual |

### 2.1 Diretrizes de Uso

- O azul primário (`#258BFC`) é a cor primária de ação principal: botões, links, elementos interativos.
- O azul escuro (`#061D44`) é a cor secundária: fundos de tela, cabeçalhos, tipografia de destaque.
- O verde (`#26E874`) é reservado para feedback positivo: respostas corretas, conquistas, progresso.
- O magenta (`#DE4EE1`) é usado de forma pontual em microelementos — nunca em áreas extensas.
- A lavanda (`#EFEEFF`) serve como fundo claro principal, garantindo legibilidade e respiro visual.

## 3. Tipografia

O sistema tipográfico é composto por duas famílias de fontes com papéis bem definidos, criando um contraste intencional entre o ambiente da interface e o ambiente matemático.

### 3.1 Nunito — Fonte de Interface

A Nunito é a fonte principal da plataforma, utilizada em todos os elementos de navegação, instrução e suporte ao usuário. Sua forma arredondada e aberta transmite acessibilidade e facilidade de leitura.

| **Nível** | **Peso** | **Aplicação** |
| --- | --- | --- |
| UI principal | SemiBold 600 | Botões, labels, navegação, menus |
| Destaque UI | Bold 700 | Pontuação, conquistas, alertas |
| Texto de apoio | Regular 400 | Dicas, explicações, textos de suporte |

### 3.2 Latin Modern / Computer Modern — Fonte Matemática

A Latin Modern (versão web da Computer Modern, fonte padrão do LaTeX) é utilizada em contextos matemáticos e formais. Sua serifa clássica traz autoridade acadêmica e faz a ponte visual com as expressões renderizadas pelo KaTeX.

| **Nível** | **Peso** | **Aplicação** |
| --- | --- | --- |
| Display | Regular | Títulos de módulo, cabeçalhos de seção de conteúdo |
| Enunciado | Regular | Texto do problema/questão |
| Expressões | Via KaTeX | Fórmulas, equações e símbolos matemáticos |

### 3.3 Princípios de Convivência entre as Fontes

- O contraste entre as fontes deve ser perceptível, mas não causar estranhamento.
- Cada fonte tem um território claro em tela — nunca devem se misturar no mesmo bloco de texto sem critério.
- O usuário não precisa notar a troca conscientemente, mas deve sentir que enunciados parecem matemática de verdade e que a interface é fácil de usar.
- Tamanho mínimo de corpo de texto: 16px, para garantir acessibilidade em dispositivos móveis (ver [[Analise_do_Sistema#^rnf05|RNF05]]).

## 4. Fórmulas e Símbolos Matemáticos

O tratamento de expressões matemáticas ocorre em duas camadas complementares: uma funcional, responsável pela renderização correta das fórmulas, e uma visual, que integra o vocabulário simbólico à identidade do projeto.

### 4.1 Uso Funcional — KaTeX

Todas as expressões matemáticas da plataforma serão renderizadas via KaTeX, biblioteca escolhida por sua leveza, velocidade e compatibilidade com a fonte Latin Modern.

- Expressões inline: espaçamento horizontal mínimo em relação ao texto adjacente, evitando colisão visual.
- Expressões em bloco: margem generosa acima e abaixo, com fundo levemente diferenciado ou espaço em branco para destacar a equação como objeto central da questão.
- Tamanho base mínimo: 18–20px, para garantir legibilidade de frações e expoentes em dispositivos móveis (ver [[Analise_do_Sistema#^rnf06|RNF06]]).

### 4.2 Uso Visual — Símbolos como Elemento de Marca

Símbolos matemáticos também funcionam como linguagem visual da marca, em contextos decorativos e de interface:

- **Decoração consciente:** símbolos em tamanho grande e opacidade reduzida como elementos gráficos de fundo em telas de loading, conquistas e separadores de seção.
- **Sistema de ícones temático:** ícones de interface inspirados em símbolos matemáticos (ex: ∑ para resumo, ✓ derivado de verificação lógica).
- **Símbolos âncora:** dois ou três símbolos selecionados para uso consistente como linguagem visual do projeto, evitando o uso aleatório de símbolos sem critério.

## 5. Logo e Mascote

### 5.1 Direção do Logo

A identidade visual adota a abordagem de símbolo geométrico/matemático combinado com mascote separado. O logo funciona institucionalmente, enquanto o mascote realiza o trabalho dentro da experiência do usuário.

Conceito de referência para o símbolo:

- Uma pirâmide estilizada como forma base do logo, representando estrutura sólida, base forte e progressão — valores diretamente alinhados à proposta do projeto.
- O símbolo deve funcionar em qualquer escala, do ícone do aplicativo a materiais impressos.

### 5.2 Diretrizes do Mascote

> ⚠️ **Nota de escopo:** o mascote descrito abaixo foi **postergado para uma fase futura** e **não faz parte do MVP atual** (ver [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)|Fora do MVP]]). O conteúdo desta seção permanece como referência de direção criativa para quando o mascote entrar em desenvolvimento.

O mascote tem papel de suporte dentro do aplicativo, sem dominar a interface. Aparece em momentos específicos da jornada do usuário:

- Onboarding — apresentação e boas-vindas
- Conquistas — celebração de progresso
- Erros — encorajamento e orientação
- Telas vazias — orientação ao usuário

Essa abordagem evita o custo tanto de tempo quanto de dinheiro em animações elaboradas, mantendo o mascote funcional e coerente com o tom do projeto — marcante o suficiente para criar vínculo, discreto o suficiente para não infantilizar a experiência.

## 6. Nome do Projeto

### 6.1 Opção mais adequada

**Base Matemática**

Essa é a melhor opção por sua clareza imediata e coerência com a identidade do projeto. Qualquer pessoa entende a proposta só de ouvi-lo, o que é fundamental para um projeto social com alcance amplo.

O termo "Base" carrega múltiplos significados alinhados à identidade:

- Base matemática — referência direta ao conteúdo ensinado
- Base de conhecimento — o alicerce educacional que o projeto constrói
- Base como fundação — o caráter social do projeto, que oferece estrutura sólida
- A base — no sentido popular brasileiro, algo acessível e próximo das pessoas

## 7. Próximos Passos

Com a identidade visual definida, os próximos passos recomendados são:

- Desenvolver o logo
- Definir o mascote (fase futura — ver nota na seção 5.2)
- Criar um style guide (documento visual com exemplos de aplicação em telas reais)
- Começar o desenvolvimento do sistema
