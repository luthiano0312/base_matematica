# Modal de Confirmação de Exclusão (Admin) — Especificação de Componente
**Projeto:** Ceará Científico (Base Matemática)
**Tipo de documento:** Spec de Componente (modal compartilhado)
**Última atualização:** 17/08/2026

> Componente único reaproveitado em [[Spec_Admin_Questoes_Listagem]] (exclusão de Questão) e [[Spec_Admin_Conteudos_Topicos]] (exclusão de Conteúdo ou de Tópico). Tokens em [[Spec_Admin_Design_Tokens_e_Sidebar]].

## Fluxo do componente

```
Clique no ícone de excluir (🗑) em qualquer entidade (Questão / Conteúdo / Tópico)
   ↓
Backend verifica dependências da entidade (síncrono, antes de abrir o modal — ver seção 3)
   ↓
Modal abre em um dos dois estados:
   ├── Estado "permitido" ────→ confirma → DELETE → toast de sucesso → modal fecha → lista atualiza (remove a linha/card sem reload completo)
   └── Estado "bloqueado" ────→ botão de excluir desabilitado → só resta "Cancelar"/fechar
```

**Decisão fechada em grill-me com o time:** um modal único com dois estados, não dois componentes diferentes — o clique no ícone de excluir sempre abre a mesma janela, previsível independente do resultado.

---

## Layout e estrutura

- **Overlay:** `background: rgba(6, 29, 68, 0.45)` (usa o próprio azul escuro da marca com opacidade, em vez de preto puro — mantém a identidade mesmo no overlay), cobre a tela inteira, `display: flex; align-items: center; justify-content: center`.
- **Container do modal:** `background: #FFFFFF`, `border-radius: 16px`, `width: 420px` (fixo, não responsivo a menos que a viewport seja menor — nesse caso `width: calc(100vw - 32px)`), `padding: 24px`.
- **Fechamento:** clique no overlay fora do modal, tecla `Esc`, ou botão "Cancelar" — todos com o mesmo efeito (fecha sem excluir).

### Cabeçalho do modal
- Ícone circular no topo, `48px`, centralizado horizontalmente ou alinhado à esquerda junto ao título (recomenda-se alinhado à esquerda do título para modais de confirmação, mais compacto que centralizado):
  - Estado permitido: ícone `trash`, fundo `#FCEBEB`, ícone `#A32D2D`.
  - Estado bloqueado: ícone `lock` ou `alert-triangle`, fundo `#FAEEDA`, ícone `#854F0B`.
- Título (Bold 700, 17px, `#061D44`):
  - Permitido: `Excluir "{nome da entidade}"?`
  - Bloqueado: `Não é possível excluir "{nome da entidade}"`

### Corpo do modal

**Estado permitido:**
- Texto: "Essa ação não pode ser desfeita." (14px, `#5A6478`).

**Estado bloqueado:**
- Texto dinâmico conforme a entidade e a dependência encontrada (ver tabela na seção 3). Exemplo: "Este tópico tem 5 questões vinculadas." (14px, `#5A6478`).
- Não há ação de "forçar exclusão" em nenhum caso — o bloqueio é definitivo nesta tela; o admin precisa desfazer a dependência primeiro (ex: reatribuir/excluir as questões) antes de poder excluir a entidade pai.

### Rodapé do modal (botões)
- `display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px`.

**Estado permitido:**
| Botão | Estilo |
| --- | --- |
| Cancelar | secundário — `background: transparent`, `border: 0.5px solid #DCDBE8`, texto `#061D44`, 14px Bold 700, `padding: 10px 16px`, `border-radius: 10px` |
| Excluir | destrutivo — `background: #A32D2D`, texto branco, mesmas medidas do Cancelar |

**Estado bloqueado:**
| Botão | Estilo |
| --- | --- |
| Entendi | único botão, estilo secundário (mesmo do "Cancelar" acima) — fecha o modal |
| ~~Excluir~~ | **não renderizado** neste estado (não é um botão desabilitado visível — simplesmente não existe, para não sugerir que forçar é uma opção futura) |

---

## 3. Regras de bloqueio por entidade

Decisão fechada em grill-me: **bloquear com mensagem clara em vez de cascata automática ou soft-delete**, para uma equipe de 7 produtores de conteúdo trabalhando em paralelo não apagar dados uns dos outros sem perceber.

| Entidade | Verificação de dependência | Mensagem no estado bloqueado |
| --- | --- | --- |
| **Questão** | Existe ao menos 1 registro em `answered_questions` para essa `question_id`? | "Esta questão já tem respostas de alunos registradas. Excluir apagaria parte do histórico de pontuação deles." |
| **Tópico** | Existe ao menos 1 registro em `question_topic` para essa `topic_id`? | "Este tópico tem {N} questão(ões) vinculada(s)." |
| **Conteúdo** | Existe ao menos 1 `topics.content_id` **ou** ao menos 1 `question_content` para esse `content_id`? (dois motivos possíveis de bloqueio) | Se só há tópicos: "Este conteúdo tem {N} tópico(s) vinculado(s)." Se só há questões diretamente vinculadas: "Este conteúdo tem {N} questão(ões) vinculada(s)." Se ambos: "Este conteúdo tem {N} tópico(s) e {M} questão(ões) vinculada(s)." |

- **Momento da verificação:** o backend deve responder essa verificação **antes** do modal renderizar o estado final — ou seja, o clique no ícone de excluir dispara uma chamada síncrona (ex: `GET /admin/questions/:id/can-delete`) que já retorna `{ can_delete: boolean, reason: string|null, counts: {...} }`, e só então o modal é montado no estado correto. Evita o anti-padrão de abrir sempre no estado "permitido" e só descobrir o bloqueio depois de clicar em "Excluir".
- **Enquanto a verificação carrega:** o modal pode abrir imediatamente num estado de loading (spinner centralizado no lugar do corpo, botões desabilitados) para dar feedback instantâneo ao clique, e só resolver para "permitido"/"bloqueado" quando a resposta chegar. Isso evita a sensação de UI travada em conexões mais lentas.

---

## Comportamento em casos especiais

- **Erro na verificação de dependência (falha de rede/servidor):** modal fecha automaticamente e um toast de erro aparece: "Não foi possível verificar se é seguro excluir. Tente novamente." — não assume nem "permitido" nem "bloqueado" por padrão (fail-safe).
- **Erro ao efetivamente excluir (estado permitido, mas o `DELETE` falha):** modal permanece aberto, botão "Excluir" volta ao estado normal (sai do loading), e uma mensagem de erro aparece dentro do próprio modal, abaixo do texto principal: "Não foi possível excluir. Tente novamente." (13px, `#A32D2D`).
- **Exclusão bem-sucedida:** toast de sucesso no canto da tela: `"{tipo de entidade}" excluído.` (ex: "Questão excluída.") — sem "com sucesso" (ver convenção de copy). Modal fecha e a lista/card correspondente é removido da tela sem recarregar a página inteira.
- **Dupla submissão:** botão "Excluir" entra em estado de loading (spinner + texto "Excluindo…") e fica desabilitado assim que clicado, prevenindo cliques duplos.

---

## Acessibilidade

- Modal é um `<div role="alertdialog" aria-modal="true" aria-labelledby="[id do título]" aria-describedby="[id do texto do corpo]">`.
- Foco move para o botão "Cancelar"/"Entendi" ao abrir (não para "Excluir", que é a ação destrutiva — evita exclusão acidental por Enter reflexo).
- `Esc` fecha o modal em ambos os estados.
- Foco retorna ao ícone de excluir que originou a abertura, ao fechar (por qualquer meio).
- Trap de foco: Tab dentro do modal cicla apenas entre os elementos focáveis do modal (Cancelar/Entendi, Excluir se presente), não escapa para o conteúdo por trás do overlay.
