# Cadastro — Especificação de Tela
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que a tela deve conter e as regras de comportamento — funciona como contrato para geração de código (manual ou assistida por IA).

## Fluxo da tela

```
Home (botão "começe gratuitamente" / "Começar agora")
   ↓
Cadastro
   ├── clique em "voltar" ────────────────────→ Home
   ├── clique em "Entrar" (rodapé do form) ───→ Login
   └── preenche form + "Cadastrar-se" ────────→ Onboarding (boas-vindas)
```

Confirma o fluxo definido em [[Fluxo_de_Navegacao]]: Cadastro → Onboarding.

> **Decisão fechada:** o botão "Entrar com Google" presente em versões anteriores do protótipo foi **removido** — login/cadastro via Google está fora do escopo do MVP (ver [[Analise_do_Sistema#4.2 Fora do MVP (fases futuras)|Fora do MVP]]).

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
- **Comportamento:** placeholder "nome@examplo.com". Deve validar formato de e-mail e checar unicidade (coluna `email` é única em `users`, ver [[Analise_do_Sistema#5.1 users (usuários / alunos)]]). Erro de "e-mail já cadastrado" segue o padrão definido em [[Convencoes_UI#3.2 E-mail duplicado (Cadastro)]].

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
- **Comportamento:** placeholder "Repita sua senha". Se não coincidir com o campo Senha, bloquear o submit e exibir erro conforme [[Convencoes_UI#3.4 Senhas não coincidem (Cadastro — campo de confirmação)]].

### Aceite de Termos de Uso e Política de Privacidade
- **Tipo:** checkbox
- **Obrigatório?** Sim — sem marcar, o cadastro não deve ser permitido.
- **Depende de outro campo?** Não
- **Comportamento:** checkbox + texto "Li e aceito os **Termos de Uso e a Política de Privacidade**." com o termo em destaque como link único, apontando para o documento combinado (decisão fechada: Termos de Uso e Política de Privacidade viraram **um único documento**, não dois — ver [[Pendencias#Termos-e-Privacidade]] e [[Analise_do_Sistema#4.3 Pendências de pré-lançamento]]). O documento em si ainda precisa ser redigido antes do lançamento — isso é pendência formal de pré-lançamento, não uma lacuna desta spec.

### Botão "Cadastrar-se"
- **Tipo:** botão de ação primária
- **Obrigatório?** N/A
- **Comportamento:** submete o formulário. Só deve ficar habilitado (ou só deve submeter com sucesso) se: Nome, E-mail, Senha e Confirmar senha preenchidos e válidos, senha atendendo RNF08, senhas coincidentes, e checkbox de termos marcado. Em caso de sucesso, cria o usuário e navega para Onboarding (boas-vindas). Em caso de erro (e-mail duplicado, campos inválidos), permanece na tela exibindo o erro correspondente, seguindo [[Convencoes_UI]].

### Link "Já tem conta? Entrar"
- **Tipo:** link de navegação
- **Comportamento:** navega para a tela de Login.

### Botão "voltar"
- **Tipo:** link de navegação
- **Comportamento:** navega para a Home.

---

## Comportamento em casos especiais

- **Campos vazios no submit:** bloquear o envio e sinalizar quais campos estão pendentes, conforme [[Convencoes_UI#3.1 Campo obrigatório vazio]].
- **E-mail já cadastrado:** submit deve falhar com mensagem apropriada, sem indicar se o e-mail existe por motivos de segurança de enumeração (recomendação geral — não é uma regra documentada, avaliar com o time).
- **Senha fora dos requisitos do RNF08:** submit bloqueado; checklist de requisitos deve indicar visualmente o que falta.
- **Confirmação de senha divergente:** submit bloqueado com erro no campo.
- **Termos não aceitos:** submit bloqueado.
- **Falha de rede/erro do servidor:** segue [[Convencoes_UI#3.6 Erro genérico de rede/servidor]].

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
- Link "Já tem conta? Entrar"

### Estado com erro de validação
- Mesmos elementos do estado inicial, com indicação visual de erro no(s) campo(s) inválido(s) e/ou mensagem de erro geral (ex: e-mail já cadastrado), conforme [[Convencoes_UI]].

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

Todas as pendências desta tela foram resolvidas em sessão de revisão de time (22/07/2026). Ver histórico de decisões em [[Pendencias_Specs_de_Tela]]. Estilo de erro consolidado em [[Convencoes_UI]].
