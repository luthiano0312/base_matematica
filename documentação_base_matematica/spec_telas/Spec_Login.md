# Login — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Home (botão "entrar") ou Cadastro (link "Já tem conta? Entrar")
   ↓
Login
   ├── clique em "voltar" ──────────────────→ Home
   ├── clique em "Cadastre-se" ─────────────→ Cadastro
   ├── login com sucesso ───────────────────→ Dashboard
   └── "Entrar com Google" ─────────────────→ Dashboard — ver Pendência 1
```

Confirma o fluxo definido em [[Fluxo_de_Navegacao]]: Login → Dashboard.

---

## Campos / Componentes

### E-mail
- **Tipo:** texto (e-mail)
- **Obrigatório?** Sim
- **Depende de outro campo?** Não
- **Comportamento:** placeholder "nome@examplo.com".

### Senha
- **Tipo:** senha (texto mascarado)
- **Obrigatório?** Sim
- **Depende de outro campo?** Não
- **Comportamento:** placeholder "Sua senha". Diferente da tela de Cadastro, aqui **não há** checklist de requisitos — é apenas o campo de entrada, validado contra a senha já cadastrada.

### Botão "Entrar"
- **Tipo:** botão de ação primária
- **Comportamento:** submete e-mail e senha. Se as credenciais forem válidas, autentica o usuário e navega para o Dashboard. Se inválidas, exibe erro (estilo visual não definido no protótipo — mesma pendência já registrada em [[Spec_Cadastro]]).

### Botão "Entrar com Google"
- **Tipo:** botão de ação secundária (OAuth)
- **Comportamento:** mesma observação da tela de Cadastro — fluxo de login social não está coberto por nenhuma regra de negócio documentada. Ver Pendência 1.

### Link "Ainda não tem uma conta? Cadastre-se"
- **Tipo:** link de navegação
- **Comportamento:** navega para a tela de Cadastro.

### Botão "voltar"
- **Tipo:** link de navegação
- **Comportamento:** navega para a Home.

---

## Comportamento em casos especiais

- **Credenciais inválidas:** submit deve falhar com uma mensagem genérica (ex: "e-mail ou senha incorretos"), sem indicar especificamente qual dos dois campos está errado, por segurança. Estilo visual do erro não definido no protótipo (ver [[Spec_Cadastro#Pendências identificadas nesta tela]], item 3).
- **Campos vazios no submit:** bloquear o envio e sinalizar os campos pendentes.
- **Recuperação de senha:** o protótipo **não tem** um link "esqueci minha senha" nem qualquer tela associada. Ver Pendência 2.
- **Falha de rede/erro do servidor:** não definido no protótipo.

---

## Informações exibidas

### Estado inicial (formulário vazio)
- Logo do projeto
- Botão "voltar"
- Título "Bem-vindo de volta!" e subtítulo "entre com sua conta para continuar sua jornada."
- Campos vazios com placeholders (E-mail, Senha)
- Botão "Entrar"
- Divisor "ou" + botão "Entrar com Google"
- Link "Ainda não tem uma conta? Cadastre-se"

### Estado com erro de validação
- Mesmos elementos do estado inicial, com indicação visual de erro (ex: credenciais inválidas).

### Estado de sucesso
- Sem retorno visual na própria tela — o sistema navega imediatamente para o Dashboard.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf01\|RF01]] | Sistema deve permitir cadastro e login de aluno |

---

## Pendências identificadas nesta tela

1. **Login via Google não documentado:** mesma pendência já levantada em [[Spec_Cadastro#Pendências identificadas nesta tela]], item 2 — não há RN/RF cobrindo esse fluxo nem suporte no modelo de dados atual de `users`.
2. **Sem fluxo de recuperação de senha:** nem o protótipo nem [[Analise_do_Sistema]] preveem uma opção de "esqueci minha senha". Isso é uma lacuna relevante para um sistema com autenticação por senha — recomenda-se levar essa decisão ao time antes do lançamento (poderia ser adicionada a [[Pendencias]] como pendência formal).
