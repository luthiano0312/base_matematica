# Login — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Home (botão "entrar") ou Cadastro (link "Já tem conta? Entrar")
   ↓
Login
   ├── clique em "voltar" ──────────────────→ Home
   ├── clique em "Cadastre-se" ─────────────→ Cadastro
   ├── clique em "Esqueci minha senha" ─────→ fluxo de recuperação (ver abaixo)
   └── login com sucesso ───────────────────→ Dashboard
```

Confirma o fluxo definido em [[Fluxo_de_Navegacao]]: Login → Dashboard.

> **Decisão fechada:** o botão "Entrar com Google" presente em versões anteriores do protótipo foi **removido** — login/cadastro via Google está fora do escopo do MVP (ver [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)|Fora do MVP]]).

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
- **Comportamento:** submete e-mail e senha. Se as credenciais forem válidas, autentica o usuário e navega para o Dashboard. Se inválidas, exibe erro conforme [[Convencoes_UI]] (mensagem genérica "E-mail ou senha incorretos.", sem indicar qual dos dois campos está errado).

### Link "Esqueci minha senha" — decisão fechada, novo componente
- **Tipo:** link de ação secundária, abaixo do campo Senha
- **Comportamento:** inicia o fluxo de recuperação de senha (RF15), implementado via sistema nativo de reset de senha do Laravel (`Illuminate\Auth\Passwords`):
  1. Aluno é levado a uma tela (ou modal) para informar o e-mail da conta.
  2. Sistema envia, via **Brevo** (ver [[Analise_do_Sistema#^rnf09|RNF09]]), um e-mail com link de reset contendo um **token de uso único, válido por 1 hora**.
  3. Ao acessar o link, o aluno é levado a uma tela para definir nova senha, respeitando os mesmos requisitos de [[Analise_do_Sistema#^rnf08|RNF08]] (mínimo 8 caracteres, 1 número, 1 maiúscula) e com campo de confirmação.
  4. Token expirado ou já utilizado deve exibir erro claro, com opção de solicitar um novo link.
- **Nota de implementação:** as telas específicas desse fluxo (solicitação de e-mail, confirmação de envio, definição de nova senha) ainda não foram desenhadas no Figma nem especificadas em detalhe — ficam como próxima spec a ser criada. O comportamento de regra de negócio, no entanto, já está fechado (ver [[Analise_do_Sistema#^rf15|RF15]]).

### Link "Ainda não tem uma conta? Cadastre-se"
- **Tipo:** link de navegação
- **Comportamento:** navega para a tela de Cadastro.

### Botão "voltar"
- **Tipo:** link de navegação
- **Comportamento:** navega para a Home.

---

## Comportamento em casos especiais

- **Credenciais inválidas:** submit deve falhar com uma mensagem genérica (ex: "e-mail ou senha incorretos"), sem indicar especificamente qual dos dois campos está errado, por segurança. Estilo visual do erro segue [[Convencoes_UI]].
- **Campos vazios no submit:** bloquear o envio e sinalizar os campos pendentes, conforme [[Convencoes_UI#3.1 Campo obrigatório vazio]].
- **Falha de rede/erro do servidor:** segue [[Convencoes_UI#3.6 Erro genérico de rede/servidor]].

---

## Informações exibidas

### Estado inicial (formulário vazio)
- Logo do projeto
- Botão "voltar"
- Título "Bem-vindo de volta!" e subtítulo "entre com sua conta para continuar sua jornada."
- Campos vazios com placeholders (E-mail, Senha)
- Link "Esqueci minha senha"
- Botão "Entrar"
- Link "Ainda não tem uma conta? Cadastre-se"

### Estado com erro de validação
- Mesmos elementos do estado inicial, com indicação visual de erro (ex: credenciais inválidas), conforme [[Convencoes_UI]].

### Estado de sucesso
- Sem retorno visual na própria tela — o sistema navega imediatamente para o Dashboard.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf01\|RF01]] | Sistema deve permitir cadastro e login de aluno |
| [[Analise_do_Sistema#^rf15\|RF15]] | Recuperação de senha: token de uso único, expiração de 1 hora, e-mail via Brevo |
| [[Analise_do_Sistema#^rnf08\|RNF08]] | Requisitos mínimos de senha, aplicáveis também à redefinição |
| [[Analise_do_Sistema#^rnf09\|RNF09]] | Envio de e-mails transacionais via Brevo |

---

## Pendências identificadas nesta tela

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]].

**Item novo, ainda em aberto:** as telas específicas do fluxo de recuperação de senha (solicitar e-mail, confirmação de envio, definir nova senha) ainda não têm spec própria — ficam para uma próxima rodada de especificação, junto com [[Spec_Dashboard#Pendências identificadas nesta tela|Perfil e Menu]].
