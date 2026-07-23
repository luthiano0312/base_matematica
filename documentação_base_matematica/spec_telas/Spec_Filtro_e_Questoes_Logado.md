# Filtro e Questões (Usuário Logado) — Especificação de Tela
**Projeto:** Ceará Científico
**Tipo de documento:** Spec de Tela
**Última atualização:** 22/07/2026

> Identidade visual (cores, tipografia, tom) é definida em [[Identidade_Visual]] e não é repetida aqui. Este documento cobre apenas o que cada tela deve conter e as regras de comportamento.
>
> Esta spec cobre o fluxo do **aluno logado**. A versão para visitante (acesso sem login) reaproveita o mesmo front-end, com restrições aplicadas via lógica condicional — ver [[Analise_do_Sistema#^rn04|RN04]] e [[Spec_Filtro_de_Questoes]].

## Fluxo da tela

```
Filtro
   ↓
Lista de questões
   ↓
Página da questão
   ↓
Responder
```

---

## Campos / Componentes

### Tela: Filtro

#### Conteúdo
- **Tipo:** seleção
- **Obrigatório?** Não
- **Depende de outro campo?** Não
- **Comportamento:** seleção do conteúdo desejado.

#### Tópico
- **Tipo:** seleção
- **Obrigatório?** Não
- **Depende de outro campo?** Sim — depende de **Conteúdo** (filtro em cascata). Só exibe/libera opções de tópico depois que um conteúdo for escolhido, já que todo tópico pertence a exatamente 1 conteúdo (ver [[Analise_do_Sistema#^rn06|RN06]]).
- **Comportamento:** lista apenas os tópicos pertencentes ao conteúdo selecionado.

#### Dificuldade
- **Tipo:** dropdown com 5 opções — Qualquer, Fácil, Médio, Difícil, **Progressão**
- **Obrigatório?** Não
- **Depende de outro campo?** Não diretamente, mas afeta a obrigatoriedade de "Quantidade de questões".
- **Comportamento:** ao selecionar **Progressão**, as questões retornadas são divididas segundo a fórmula de [[Analise_do_Sistema#^rn17|RN17]]: base = quantidade ÷ 3 (arredondado para baixo) em cada nível, resto distribuído na ordem fácil → médio → difícil (ex.: N=4 → 2 fácil, 1 médio, 1 difícil; N=5 → 2 fácil, 2 médio, 1 difícil).

#### Quantidade de questões
- **Tipo:** campo numérico
- **Obrigatório?** Apenas quando "Progressão" é selecionada em Dificuldade. Opcional nas demais dificuldades.
- **Depende de outro campo?** Sim — obrigatoriedade depende de Dificuldade = Progressão.
- **Comportamento:** disponível independentemente da dificuldade escolhida (ver [[Analise_do_Sistema#^rf06|RF06]]).

#### Tipo de questão
- **Tipo:** seleção — Certo ou Errado, Múltipla escolha, Dissertativa
- **Obrigatório?** Não
- **Depende de outro campo?** Não
- **Comportamento:** filtra as questões pelo tipo selecionado.

#### Aplicar filtro
- Não é obrigatório preencher nenhum filtro para ver questões — ver comportamento padrão abaixo.

---

## Comportamento em casos especiais

### Filtros vazios (comportamento padrão)

Se todos os filtros estiverem vazios, o sistema retorna automaticamente **9 questões** (3 fáceis, 3 médias, 3 difíceis), seguindo esta ordem de prioridade (ver [[Analise_do_Sistema#^rf12|RF12]] — todos os critérios abaixo estão fechados):

1. **Conteúdo marcado como interesse no onboarding** (`user_interests`). Se houver mais de um interesse marcado, o sistema **sorteia aleatoriamente entre os marcados a cada sessão**.
2. **Se o aluno não marcou nenhum interesse** (ver [[Analise_do_Sistema#^rn13|RN13]]): cai para o **conteúdo em que o aluno tem mais acertos** (critério de desempenho).
3. **Se nenhum dos dois critérios for aplicável** (aluno novo, sem respostas e sem interesses): o sistema exibe **conteúdo aleatório entre todos os cadastrados**.

### Regra de fallback por insuficiência de questões

Se o filtro aplicado (com ou sem os critérios de RF12 acima) não retornar questões suficientes em algum nível de dificuldade, o sistema entrega apenas as questões existentes, sem completar a diferença — mesma regra aplicada à versão do visitante (ver [[Analise_do_Sistema#^rn04|RN04]]).

### Modo Progressão sem quantidade divisível por 3 — decisão fechada

Base = quantidade ÷ 3 (arredondado para baixo) por nível; o resto é distribuído na ordem fácil → médio → difícil. Ver [[Analise_do_Sistema#^rn17|RN17]].

---

## Informações exibidas

### Tela: Lista de questões

Layout: uma questão abaixo da outra (estilo plataformas de concursos). Cada item da lista exibe:
- Enunciado (resumido)
- Tags: dificuldade, conteúdo, tipo de questão

### Tela: Página da questão — antes de responder

- Enunciado da questão
- Pontuação (da questão)
- Quantidade de questões (da sessão/filtro atual)
- Quantidade de acertos (da sessão/filtro atual)
- Quantidade de erros (da sessão/filtro atual)
- Conteúdo da questão
- Tópico
- Dificuldade

> **Decisão fechada:** os contadores de quantidade de questões/acertos/erros refletem a **sessão atual**, com base no filtro aplicado (ex: "questão 3 de 6" dentro do filtro escolhido) — não o total histórico do aluno na plataforma. A tela deve exibir o rótulo explícito **"sessão atual"** junto a esses contadores para evitar que o aluno confunda com o card de desempenho do Dashboard (que é histórico total — ver [[Spec_Dashboard]]). Ver detalhamento completo de estados desta tela em [[Spec_Questao]].

### Tela: Página da questão — depois de responder

- Resposta correta
- Explicação em texto
- Vídeo de resolução (quando disponível)
- Pontuação obtida naquela tentativa, registrada conforme a regra de redenção (ver [[Analise_do_Sistema#^rn08|RN08]]–[[Analise_do_Sistema#^rn10|RN10]])

> Ver especificação completa dos estados de feedback, tipos de questão (múltipla escolha, certo/errado, dissertativa) e encerramento do conjunto em [[Spec_Questao]].

---

## Regras de negócio relacionadas (referência)

| ID | Regra |
|---|---|
| [[Analise_do_Sistema#^rn05\|RN05]] | Toda questão deve ter nível de dificuldade obrigatório |
| [[Analise_do_Sistema#^rn06\|RN06]] | Questão vinculada a 1+ Conteúdos e opcionalmente a 0+ Tópicos |
| [[Analise_do_Sistema#^rn16\|RN16]] | Tópico vinculado a uma questão deve pertencer a um dos Conteúdos já vinculados à mesma questão |
| [[Analise_do_Sistema#^rn17\|RN17]] | Modo Progressão: divisão por dificuldade (base ÷ 3, resto fácil → médio → difícil) |
| [[Analise_do_Sistema#^rf06\|RF06]] | Sistema deve permitir filtro/busca de questões por Conteúdo e Tópico, incluindo campo Quantidade de questões |
| [[Analise_do_Sistema#^rf12\|RF12]] | Priorização de questões/conteúdo recomendado com base em interesses (sorteio aleatório entre marcados), com fallback por desempenho e, por fim, conteúdo aleatório |
| [[Analise_do_Sistema#^rn08\|RN08]]–[[Analise_do_Sistema#^rn10\|RN10]] | Regras de pontuação por dificuldade e redenção em tentativas repetidas |
