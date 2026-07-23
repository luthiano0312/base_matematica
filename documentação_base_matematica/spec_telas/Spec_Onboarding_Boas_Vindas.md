# Onboarding — Boas-vindas (etapa 1 de 2) — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Cadastro (submit com sucesso)
   ↓
Onboarding — Boas-vindas (1 de 2)
   └── clique em "Continuar" ─────→ Onboarding — Checklist (2 de 2)
```

Esta é a primeira das duas etapas do Onboarding descrito em [[Fluxo_de_Navegacao]]. É puramente introdutória/institucional — não coleta nenhum dado do usuário (os dados de RN12 são coletados no Cadastro; o checklist de interesses é a segunda etapa).

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
- **Acesso direto/URL:** se um usuário não autenticado (ou sem ter acabado de se cadastrar) acessar esta tela diretamente, o comportamento esperado não está definido no protótipo. Recomenda-se restringir o acesso a usuários recém-cadastrados ainda não onboardados (ver Pendência 2).

---

## Informações exibidas

### Estado único (tela estática)
- Barra de progresso "1 de 2"
- Título e texto de boas-vindas
- Card "Exercícios"
- Card "Progresso"
- Botão "Continuar"

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf10\|RF10]] | Sistema deve oferecer onboarding com checklist opcional de Conteúdos de interesse |
| [[Analise_do_Sistema#^rn12\|RN12]] | Onboarding pede dados básicos (nome, e-mail, senha) obrigatórios e checklist de Conteúdos de interesse, opcional |

---

## Pendências identificadas nesta tela

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]].
