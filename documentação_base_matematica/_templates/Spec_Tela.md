# [Nome da Tela] — Especificação de Tela
**Projeto:** Ceará Científico
**Tipo de documento:** Spec de Tela
**Última atualização:** [DD/MM/AAAA]

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
[Tela/Estado de entrada]
   ↓
[Próximo estado]
   ↓
[Próximo estado]
   ↓
[Estado final / saída]
```

Descrever brevemente como se chega a esta tela e para onde o usuário vai ao sair dela.

---

## Campos / Componentes

Para cada campo ou componente da tela, descrever:

### [Nome do campo/componente]
- **Tipo:** (texto, seleção, dropdown, checklist, etc.)
- **Obrigatório?** Sim/Não — e em quais condições, se variável.
- **Depende de outro campo?** (ex: filtro em cascata) — descrever a dependência.
- **Comportamento:** o que acontece quando o usuário interage com o campo.

Repetir esta estrutura para cada campo/componente da tela.

---

## Comportamento em casos especiais

Descrever o que acontece em situações fora do fluxo padrão, por exemplo:
- Filtros/campos vazios (comportamento padrão do sistema).
- Estados de erro (ex: falha ao carregar dados, validação de campo).
- Estados vazios (ex: nenhum resultado encontrado).
- Diferenças de comportamento entre tipos de usuário (ex: visitante vs. aluno logado), se aplicável.

---

## Informações exibidas

Listar, por estado da tela (antes/depois de uma ação, por exemplo), quais informações aparecem para o usuário.

### [Estado 1, ex: "Antes de responder"]
- Informação A
- Informação B

### [Estado 2, ex: "Depois de responder"]
- Informação C
- Informação D

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rnXX\|RNXX]] | Resumo curto da regra |
| [[Analise_do_Sistema#^rfXX\|RFXX]] | Resumo curto da regra |

> Usar sempre wikilink com âncora de bloco (ver [[Convencoes]], seção 4), nunca texto simples.
