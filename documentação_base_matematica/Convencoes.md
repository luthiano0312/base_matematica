# Convencoes
**Projeto:** Ceará Científico
**Tipo de documento:** Convenções
**Última atualização:** 20/07/2026

> Este documento define as convenções de escrita, nomenclatura e estrutura da documentação do projeto. Deve ser consultado por qualquer pessoa — incluindo produtores de conteúdo — antes de criar ou editar um documento no vault.

## 1. Nomenclatura de arquivos

- Todos os nomes de arquivo usam **snake_case, sem acento**.
  - Correto: `Fluxo_de_Navegacao.md`
  - Incorreto: `Fluxo de Navegação.md`

## 2. Cabeçalho comum

Todo documento de produto começa com o bloco de metadados abaixo (texto simples, sem frontmatter YAML):

```markdown
# [Nome do Documento]
**Projeto:** Ceará Científico
**Tipo de documento:** [Regras e Requisitos / Arquitetura / Identidade Visual / Índice de Navegação / Spec de Tela / Pendências]
**Última atualização:** [DD/MM/AAAA]
```

Não incluir campo de status (rascunho/aprovado) nem changelog manual — o histórico de versões fica a cargo do Git/GitHub.

## 3. Templates

Template formal (em `_templates/`) existe apenas para **documentos que se repetem**. Hoje, o único caso é a **Spec de Tela** (`_templates/Spec_Tela.md`).

Documentos únicos no projeto — Arquitetura, Identidade Visual, Fluxo de Navegação, Pendências, Convenções — **não** têm template formal. Usam apenas o cabeçalho comum (seção 2) e uma estrutura de seções própria.

## 4. Referências cruzadas a RN/RF/RNF

- Toda citação de uma regra (RN/RF/RNF) **fora** do documento de Análise deve usar **wikilink do Obsidian com âncora de bloco**, nunca texto simples.
- Formato do link: `[[Analise_do_Sistema#^rn05]]`
- No documento `Analise_do_Sistema.md`, as regras continuam organizadas em **tabela** (não viram heading individual, para preservar a visão geral). Cada linha da tabela recebe um **block reference** do Obsidian (`^rn05`, `^rf12` etc.) ao final da linha, para permitir o link.

Exemplo de linha de tabela com block reference:

```
| RN05 | Toda questão deve ter nível de dificuldade obrigatório... | ^rn05
```

(a sintaxe exata pode precisar de ajuste fino conforme o comportamento do Obsidian para block references dentro de tabelas.)

## 5. Pendências vinculadas

Quando uma regra for formalizada de forma incompleta (falta algum detalhe/critério), o próprio texto da regra deve conter um link para a entrada correspondente em `Pendencias.md`.

Exemplo: `⚠️ Ver [[Pendencias#RN17]]`

## 6. Elementos visuais (cor, imagens de fonte)

- Não recriar swatches de cor nem incorporar imagens no markdown.
- Paleta de cores: manter apenas como tabela texto com hex code — o hex já é fonte de verdade suficiente.
- Exemplos de fonte (imagens do docx original): remover, manter apenas a descrição textual (nome da fonte, peso, aplicação).

## 7. Estrutura de pastas do vault

```
/ (raiz do vault)
├── Analise_do_Sistema.md
├── Arquitetura.md
├── Identidade_Visual.md
├── Fluxo_de_Navegacao.md
├── Pendencias.md
├── Convencoes.md
├── Spec_Filtro_e_Questoes_Logado.md
├── _templates/
│   └── Spec_Tela.md
└── _archive/
    ├── Analise_do_Sistema.docx
    ├── Arquitetura.docx
    ├── Identidade_Visual.docx
    └── Pontos_de_Atualizacao_Documentacao.md
```

Documentos de produto ficam soltos na raiz, sem subpastas por categoria. `_templates/` e `_archive/` são as únicas subpastas, com prefixo `_` para sinalizar que não são conteúdo ativo de produto.
