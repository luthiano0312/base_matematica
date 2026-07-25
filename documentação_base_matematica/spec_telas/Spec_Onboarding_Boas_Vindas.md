# Onboarding — Boas-vindas (etapa 1 de 2) — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Cadastro (submit com sucesso)
   ↓
Onboarding — Boas-vindas (1 de 2)
   └── clique em "Continuar" ─────→ Onboarding — Checklist (2 de 2)
```

Esta é a primeira das duas etapas do Onboarding descrito em [[Fluxo_de_Navegacao]]. É puramente introdutória/institucional — não coleta nenhum dado do usuário (os dados de RN12 são coletados no Cadastro; o checklist de interesses é a segunda etapa).

> **Decisão fechada (RN19):** esta tela **não possui botão "Voltar"** — a conta já foi criada na etapa de Cadastro anterior, e um botão de retorno duplicaria/reabriria esse formulário já submetido. O único caminho de navegação para frente é "Continuar".

---

## Campos / Componentes

### Barra de progresso
- **Tipo:** indicador visual (progress bar + texto "1 de 2")
- **Obrigatório?** N/A
- **Comportamento:** exibe o progresso dentro do fluxo de Onboarding (2 etapas no total). Nesta tela, marca ~50% preenchido.

### Texto de boas-vindas
- **Tipo:** texto estático
- **Conteúdo:** título "Bem-vindo ao Base Matemática!" e um parágrafo de apresentação da plataforma.
- **Comportamento:** estático, sem interação.

### Card "Exercícios"
- **Tipo:** card informativo estático
- **Conteúdo:** ícone + título "Exercícios" + descrição "Prática guiada com correção imediata e explicações."
- **Comportamento:** estático, sem interação (não é clicável).

### Card "Progresso"
- **Tipo:** card informativo estático
- **Conteúdo:** título "Progresso" + ícone + descrição "Veja o quanto você avançou e o que vem pela frente."
- **Comportamento:** estático, sem interação.

### Botão "Continuar"
- **Tipo:** botão de ação primária
- **Comportamento:** avança para a segunda etapa do Onboarding (Checklist de interesses). Não há dado a validar nesta tela — o botão está sempre habilitado.

---

## Comportamento em casos especiais

- Não há estados de erro, carregamento ou vazio nesta tela — é 100% estática e não depende de dados da API.
- **Acesso direto/URL — decisão fechada (RN19):** ao acessar a URL desta etapa diretamente, sem sessão ativa (não passou pelo Cadastro/Login), o sistema redireciona para a Home. Um aluno com sessão ativa que já completou o Onboarding anteriormente é redirecionado direto para o Dashboard ao tentar acessar a URL novamente — não pode refazer o Onboarding. Ver [[Analise_do_Sistema#^rn19|RN19]].

---

## Informações exibidas

### Estado único (tela estática)
- Barra de progresso "1 de 2"
- Título e texto de boas-vindas
- Card "Exercícios"
- Card "Progresso"
- Botão "Continuar" (sem botão "Voltar")

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf10\|RF10]] | Sistema deve oferecer onboarding com checklist opcional de Conteúdos de interesse |
| [[Analise_do_Sistema#^rn12\|RN12]] | Cadastro coleta dados obrigatórios (nome, e-mail, senha); Onboarding coleta apenas o checklist de interesses, opcional |
| [[Analise_do_Sistema#^rn19\|RN19]] | Proteção de acesso ao Onboarding; ausência de botão "Voltar" |

---

## Pendências identificadas nesta tela

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]].
