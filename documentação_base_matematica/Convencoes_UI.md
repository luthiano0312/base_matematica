# Convencoes_UI
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Convenções de Interface
**Última atualização:** 22/07/2026

> Este documento define como estados de erro devem aparecer visualmente em qualquer tela com formulário ou validação. Reutiliza a paleta e tipografia definidas em [[Identidade_Visual]] — não repete essas definições aqui. Objetivo: garantir que cada dev/produtor de conteúdo implemente erro do mesmo jeito, sem inventar um padrão novo por tela.

---

## 1. Cor de erro

> ⚠️ **Gap identificado:** [[Identidade_Visual#2. Paleta de Cores]] não define uma cor oficial para erro/estado negativo — só cobre verde (acerto), azul (ação), azul escuro (fundo), magenta (destaque pontual) e lavanda (fundo claro). O card "Erros" do Dashboard (ver [[Spec_Dashboard]]) já implica uma cor vermelha, mas ela nunca foi formalizada com hex.
>
> **Proposta desta spec**, até o time confirmar ou ajustar oficialmente em [[Identidade_Visual]]:

| Nome | Hex | Uso |
|---|---|---|
| Vermelho de erro | `#F13A3A` | Mensagens de erro, bordas de campo inválido, ícone de erro |

Esse tom foi escolhido por ter contraste suficiente tanto sobre a lavanda (`#EFEEFF`) quanto sobre fundos brancos, e por não colidir visualmente com o magenta (`#DE4EE1`), que já é usado para destaque pontual.

---

## 2. Onde a mensagem de erro aparece

**Padrão: inline, abaixo do campo.** Não usar toast nem banner no topo da tela para erros de validação de formulário — o aluno precisa associar o erro ao campo específico, sem precisar caçar a mensagem em outro lugar da tela.

- Mensagem em texto vermelho (`#F13A3A`), tamanho igual ao texto de apoio (Nunito Regular 400, conforme [[Identidade_Visual#3.1 Nunito — Fonte de Interface]])
- Borda do campo também muda para vermelho (`#F13A3A`), substituindo a borda padrão
- Ícone pequeno de alerta (ex: `!` dentro de círculo) ao lado esquerdo da mensagem, para não depender só da cor (acessibilidade — daltonismo)
- A mensagem aparece **assim que o campo perde o foco** com valor inválido (validação "on blur"), não apenas ao tentar submeter o formulário — evita o aluno só descobrir todos os erros de uma vez no fim

**Exceção — erro genérico de rede/servidor:** usa banner no topo da tela (fundo vermelho claro, texto vermelho escuro), já que não está associado a um campo específico.

---

## 3. Casos cobertos

### 3.1 Campo obrigatório vazio
- Mensagem: "Este campo é obrigatório."
- Dispara ao tentar submeter com o campo vazio, ou ao sair do campo (blur) se já foi tocado uma vez.

### 3.2 E-mail duplicado (Cadastro)
- Mensagem: "Este e-mail já está cadastrado. Tente fazer login."
- Nota: o texto já sugere a ação alternativa (login), evitando o aluno ficar preso sem saber o que fazer.

### 3.3 Senha fraca (Cadastro)
- Mensagem: "A senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 letra maiúscula." (ver [[Analise_do_Sistema#^rnf08|RNF08]])
- Validação em tempo real conforme o aluno digita é recomendada (não obrigatória no MVP), mostrando quais requisitos já foram atendidos.

### 3.4 Senhas não coincidem (Cadastro — campo de confirmação)
- Mensagem: "As senhas não coincidem."
- Dispara ao sair do campo de confirmação, comparando com o campo de senha.

### 3.5 Filtro obrigatório não preenchido (modo Progressão)
- Contexto: [[Spec_Filtro_de_Questoes]] — campo "Quantidade de questões" se torna obrigatório quando Dificuldade = Progressão (ver [[Analise_do_Sistema#^rn17|RN17]]).
- Mensagem: "Informe a quantidade de questões para usar o modo Progressão."
- O botão "Continuar" deve ficar desabilitado (ou emitir a validação ao clicar) enquanto o campo estiver vazio nesse modo.

### 3.6 Erro genérico de rede/servidor
- Mensagem: "Algo deu errado. Tente novamente em alguns instantes."
- Exibido como banner no topo da tela (ver seção 2, exceção), com botão opcional de "Tentar novamente" quando aplicável (ex: falha ao salvar checklist de interesses).

---

## 4. Aplicação por tela

| Tela | Casos aplicáveis |
|---|---|
| [[Spec_Cadastro]] | 3.1, 3.2, 3.3, 3.4, 3.6 |
| Spec_Login (ainda não recebida) | 3.1, 3.6 (+ erro de credenciais inválidas: "E-mail ou senha incorretos.") |
| [[Spec_Filtro_de_Questoes]] | 3.5, 3.6 |
| [[Spec_Onboarding_Checklist]] | 3.6 (falha ao salvar) |

---

## 5. Fora de escopo neste guia

- Estados de erro de páginas inteiras (404, 500) — não definidos ainda, não bloqueiam o MVP.
- Erros de upload de arquivo — não se aplica ao MVP atual (sem upload de arquivos pelo aluno).
