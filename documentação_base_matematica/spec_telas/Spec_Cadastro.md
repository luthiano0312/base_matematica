# Cadastro — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 21/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Home (botão "começe gratuitamente" / "Começar agora")
   ↓
Cadastro
   ├── clique em "voltar" ────────────────────→ Home
   ├── clique em "Entrar" (rodapé do form) ───→ Login
   ├── preenche form + "Cadastrar-se" ────────→ Onboarding (boas-vindas)
   └── "Entrar com Google" ───────────────────→ Onboarding (boas-vindas) — ver Pendência 2
```

Confirma o fluxo definido em [[Fluxo_de_Navegacao]]: Cadastro → Onboarding.

---

## Campos / Componentes

### Nome
- **Tipo:** texto
- **Obrigatório?** Sim
- **Depende de outro campo?** Não
- **Comportamento:** placeholder "seu nome". Validação apenas de campo não vazio (não há regra de formato definida em [[Analise_do_Sistema]]).

### E-mail
- **Tipo:** texto (e-mail)
- **Obrigatório?** Sim
- **Depende de outro campo?** Não
- **Comportamento:** placeholder "nome@examplo.com". Deve validar formato de e-mail e checar unicidade (coluna `email` é única em `users`, ver [[Analise_do_Sistema#5.1 users (usuários / alunos)]]). Erro de "e-mail já cadastrado" deve ser exibido no submit — protótipo não define o estilo visual desse erro (ver Pendência 3).

### Senha
- **Tipo:** senha (texto mascarado)
- **Obrigatório?** Sim
- **Depende de outro campo?** Não
- **Comportamento:** placeholder "Crie sua senha". Deve respeitar [[Analise_do_Sistema#^rnf08|RNF08]]: mínimo 8 caracteres, ao menos 1 número, ao menos 1 letra maiúscula. Alimenta em tempo real o checklist de requisitos (ver abaixo).

### Checklist de requisitos de senha
- **Tipo:** indicador visual (3 itens com ícone de check)
- **Obrigatório?** N/A — é feedback, não input
- **Depende de outro campo?** Sim, do campo Senha.
- **Comportamento:** cada item ("Mínimo de 8 caracteres", "Pelo menos 1 número", "Pelo menos 1 letra maiúscula") deve alternar visualmente entre "não atendido" e "atendido" conforme o usuário digita a senha. **No protótipo estático os 3 itens aparecem sempre marcados como atendidos — isso é só o estado de mockup**; a implementação real precisa validar dinamicamente contra o valor digitado.

### Confirmar senha
- **Tipo:** senha (texto mascarado)
- **Obrigatório?** Sim
- **Depende de outro campo?** Sim, do campo Senha — deve ser idêntico a ele.
- **Comportamento:** placeholder "Repita sua senha". Se não coincidir com o campo Senha, bloquear o submit e exibir erro (estilo de erro não definido no protótipo — ver Pendência 3).

### Aceite de Termos de Uso e Política de Privacidade
- **Tipo:** checkbox
- **Obrigatório?** Sim — sem marcar, o cadastro não deve ser permitido.
- **Depende de outro campo?** Não
- **Comportamento:** checkbox + texto "Li e aceito os **Termos de Uso** e a **Política de Privacidade**." com os dois termos em destaque como links. No protótipo, ambos os links apontam para a própria página de cadastro (link placeholder). O documento de Termos de Uso ainda **não existe** — é pendência formal registrada em [[Pendencias#Termos-de-Uso]] e [[Analise_do_Sistema#4.3 Pendências de pré-lançamento]]. O mesmo vale para a Política de Privacidade, que não está sequer mencionada em nenhum outro documento do projeto (ver Pendência 1).

### Botão "Cadastrar-se"
- **Tipo:** botão de ação primária
- **Obrigatório?** N/A
- **Comportamento:** submete o formulário. Só deve ficar habilitado (ou só deve submeter com sucesso) se: Nome, E-mail, Senha e Confirmar senha preenchidos e válidos, senha atendendo RNF08, senhas coincidentes, e checkbox de termos marcado. Em caso de sucesso, cria o usuário e navega para Onboarding (boas-vindas). Em caso de erro (e-mail duplicado, campos inválidos), permanece na tela exibindo o erro correspondente.

### Botão "Entrar com Google"
- **Tipo:** botão de ação secundária (OAuth)
- **Comportamento:** fluxo de cadastro/login via conta Google. **Não há regra de negócio ou requisito funcional documentado em [[Analise_do_Sistema]] cobrindo login social** — nem o modelo de dados (`users`) prevê campos para isso (ex: `google_id`, senha opcional). Ver Pendência 2.

### Link "Já tem conta? Entrar"
- **Tipo:** link de navegação
- **Comportamento:** navega para a tela de Login.

### Botão "voltar"
- **Tipo:** link de navegação
- **Comportamento:** navega para a Home.

---

## Comportamento em casos especiais

- **Campos vazios no submit:** bloquear o envio e sinalizar quais campos estão pendentes (estilo visual do erro não definido no protótipo — ver Pendência 3).
- **E-mail já cadastrado:** submit deve falhar com mensagem apropriada, sem indicar se o e-mail existe por motivos de segurança de enumeração (recomendação geral — não é uma regra documentada, avaliar com o time).
- **Senha fora dos requisitos do RNF08:** submit bloqueado; checklist de requisitos deve indicar visualmente o que falta.
- **Confirmação de senha divergente:** submit bloqueado com erro no campo.
- **Termos não aceitos:** submit bloqueado.
- **Falha de rede/erro do servidor:** não definido no protótipo — deve seguir um padrão geral de erro do sistema (a ser definido em documento de convenções, se existir).

---

## Informações exibidas

### Estado inicial (formulário vazio)
- Logo do projeto
- Botão "voltar"
- Título "Criar conta" e subtítulo "Preencha seus dados para começar a estudar."
- Campos vazios com placeholders (Nome, E-mail, Senha, Confirmar senha)
- Checklist de requisitos de senha (todos não atendidos, visualmente — diferente do protótipo estático)
- Aceite de termos desmarcado
- Botão "Cadastrar-se"
- Divisor "ou" + botão "Entrar com Google"
- Link "Já tem conta? Entrar"

### Estado com erro de validação
- Mesmos elementos do estado inicial, com indicação visual de erro no(s) campo(s) inválido(s) e/ou mensagem de erro geral (ex: e-mail já cadastrado).

### Estado de sucesso
- Sem retorno visual na própria tela — o sistema navega imediatamente para o Onboarding.

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rf01\|RF01]] | Sistema deve permitir cadastro e login de aluno |
| [[Analise_do_Sistema#^rnf08\|RNF08]] | Senha: mínimo 8 caracteres, 1 número, 1 letra maiúscula; tela de Cadastro inclui confirmação de senha |

---

## Pendências identificadas nesta tela

1. **Política de Privacidade inexistente:** assim como os Termos de Uso (já registrados como pendência em [[Pendencias]]), a Política de Privacidade referenciada no checkbox de aceite não tem documento nem menção em nenhum outro lugar do projeto. Precisa ser redigida e adicionada às pendências formais de pré-lançamento.
2. **Login/cadastro via Google não documentado:** o protótipo inclui um botão "Entrar com Google", mas não há RN/RF cobrindo esse fluxo, nem o modelo de dados de `users` prevê isso (hoje exige `password`). Definir: (a) se entra no MVP; (b) alterações necessárias na tabela `users`; (c) se usuário via Google passa pelo Onboarding normalmente.
3. **Estilo de estados de erro não definido:** nenhuma tela do protótipo mostra como erros de validação (campo vazio, e-mail duplicado, senha fraca, senhas não coincidentes) devem aparecer visualmente. Recomenda-se um documento de convenções de UI para estados de erro, reutilizável em todas as telas com formulário.
