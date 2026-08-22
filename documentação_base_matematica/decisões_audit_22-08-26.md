# Decisões sobre o Audit — 22/08/2026

**Contexto da rodada:**
- Sistema já em produção (deploy feito), mas sem usuários reais ainda.
- Próxima etapa é avaliativa (banca), com foco em "isso resolve um problema social real" — não em código, testes ou arquitetura.
- Avaliadores não são técnicos: não vão abrir DevTools, olhar Network tab ou ler código.
- Formato assumido: banca mexendo no sistema **sem supervisão**.
- Orçamento: **7 dias**, ~2h/dia (pode variar), pessoa única no projeto.
- Existe pelo menos mais uma etapa depois desta, e a intenção de longo prazo é ter usuários reais — estimativa informal de ~2 meses até isso acontecer.

**Critério de priorização adotado:** o que é **perceptível** para um avaliador não-técnico (UX, funcionalidades que aparentam resolver o problema, ausência de bugs visíveis) pesa mais do que correção técnica interna (segurança, arquitetura, testes, higiene de código) — que fica para quando houver mais tempo/equipe.

---

## 🔒 Dentro do Escopo — Necessário

| Item | Descrição | Esforço estimado | Justificativa |
|---|---|---|---|
| **A3** | Implementar o fluxo "esqueci minha senha" (backend já pronto; faltam as telas e plugar `authService.sendPasswordResetLink`/`resetPassword`, hoje não chamados) | Médio | O link "Esqueci minha senha" já é visível no Login; hoje leva a um placeholder em branco — alto risco de embaraço se clicado |
| **P1 — Termos de Uso** | Trocar `href="#"` + `alert()` por texto placeholder decente (não precisa ser jurídico real nesta etapa) | Baixo (~20 min) | Custo mínimo, remove um ponto óbvio de "quebrado" |
| **M9** | Sessão de questões não pode se perder silenciosamente com F5 ou botão voltar — hoje redireciona ao filtro sem aviso, perdendo o progresso | Baixo-médio | Quebra a demo na hora se a banca atualizar a página ou usar "voltar" no meio de uma sessão de questões |
| **M12** | Botões mortos no Dashboard (ícone de perfil sem `onClick`; atalho "Materiais de estudo" com `onClick` vazio) | Baixo | Clicar e nada acontecer é o tipo de coisa perceptível e parece descuido |
| **A6** | Não existe rota 404 — URL inválida cai em tela completamente em branco | Baixo | Parece "site fora do ar" para quem não é técnico |

## 🎯 Dentro do Escopo — Faz-se-der-tempo (ordem de prioridade, sujeita a revisão)

1. **M13** — Tela de Perfil / edição de interesses (RN14). Não tem spec nem implementação hoje. Esforço alto (4-6h) para uma feature que a banca não vai sentir falta se não souber que deveria existir. Fica em 1º nesta lista, mas pode ser reavaliada se surgir algo mais urgente.
2. **M6** (baixa prioridade) — Interceptor 401 hoje limpa o token mas não avisa o `AuthContext`; usuário "parece logado" com sessão morta. Risco baixo dado o tempo curto de uso numa demo, mas pode ocorrer se o token expirar no meio da apresentação.
3. **M8** (baixa prioridade) — Code-splitting das rotas `/admin/*` (hoje Tiptap/MathLive/KaTeX são carregados por qualquer visitante da Home). Só relevante se a internet da apresentação for ruim.
4. **B9** (baixa prioridade) — Focus trap / Esc no modal de fim de sessão de questões (hoje é `div role="dialog"` sem essas proteções, apesar de já existir um componente `Modal` reutilizável com isso pronto). Acessibilidade real, mas afeta só quem usa teclado/leitor de tela.

## 🚫 Fora do Escopo desta rodada

*(será rediscutido e re-triado no próximo ciclo, quando houver mais clareza sobre prazo e recursos)*

A2, A4, A5, M1, M2, M3, M4, M5, M7, M10, M11, M14, B1, B2, B3, B4, B5, B6, B7, B8, B10, B11, B12, B13, B14, B15

**Racional geral do corte:** nenhum desses itens aparece numa demo não-supervisionada por avaliador não-técnico, nem afeta diretamente a percepção de "isso resolve um problema social real". São itens de segurança (que exigem conhecimento técnico pra serem notados), higiene de engenharia (README, CI, testes, TypeScript strict) ou refatoração interna (duplicação de código, tokens de CSS) — todos legítimos, mas não urgentes para os próximos 7 dias.

---

## 🔜 Prioridades do Próximo Ciclo

1. **A1 — Gabarito exposto no payload antes da resposta.** Rebaixado de "Necessário" para "próximo ciclo" nesta rodada porque avaliadores não-técnicos não abrem DevTools/Network. **Mas deve ser o primeiro item atacado no próximo ciclo**, antes de qualquer divulgação pública real — com usuários reais (~2 meses de horizonte estimado), deixa de ser risco teórico e vira vulnerabilidade ativa que compromete a pontuação e a credibilidade pedagógica do sistema.
   - Fix mínimo viável (opção mais barata, ~3-4h): remover `correct_answer`/`options[].is_correct` do `QuestionResource` usado em listagens (`GET /questions`, `GET /public/questions`); ajustar `QuestaoPage.tsx` para usar apenas o retorno de `POST /questions/{id}/answers` (que já devolve o gabarito da tentativa) em vez de ler do objeto pré-carregado. Aceita manter o visitante como está por ora (ele não persiste nota/progresso).
   - Fix completo (~6-7h): inclui endpoint público novo (`POST /public/questions/{id}/check-answer`) para o visitante verificar resposta sem receber o gabarito antecipado nem persistir nada.

2. *(demais itens da lista "Fora do Escopo" — a serem re-triados quando houver mais informação sobre prazo, escopo e recursos disponíveis do próximo ciclo)*
