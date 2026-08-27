# Plano de Implementação — Permitir exclusão de questão já respondida (mudança da RN11)

**Projeto:** Ceará Científico (Base Matemática)
**Objetivo:** Hoje, uma questão que já tem respostas de alunos (`answered_questions`) não pode ser excluída — o backend bloqueia com 409. Esta mudança deve permitir a exclusão da questão em qualquer caso, **preservando a pontuação e o histórico agregado do aluno** (pontos, streak, contadores de acerto/erro). O que se perde é apenas o vínculo direto com a questão excluída (e, como efeito colateral aceito, a atribuição por tópico daquela resposta específica).

Este documento é para ser executado por um agente de codificação, passo a passo, na ordem apresentada. Cada etapa lista os arquivos afetados, o que mudar, e como validar antes de seguir para a próxima.

---

## Contexto técnico (por que a trava existe hoje)

Há duas camadas de bloqueio:

1. **Aplicação:** `backend/app/Http/Controllers/Api/QuestionController.php`
   - `destroy()` retorna `409` com a mensagem `BLOCK_REASON` se `$question->answers()->exists()`.
   - `canDelete()` retorna `can_delete: false` pelo mesmo motivo.
2. **Banco de dados:** `backend/database/migrations/2026_08_01_000001_create_answered_questions_table.php`
   - `question_id` é `foreignId(...)->constrained()->noActionOnDelete()` — mesmo se a aplicação permitisse, o Postgres rejeitaria o `DELETE` por violação de FK.

Como `answered_questions.points_earned`, `is_correct` e `answered_at` já são gravados por linha (não recalculados a partir da tabela `questions`), a pontuação do aluno sobrevive naturalmente à exclusão da questão — só precisamos parar de impedir isso.

---

## Etapa 1 — Migration: tornar `answered_questions.question_id` nullable com `nullOnDelete()`

Criar uma nova migration (não editar a antiga) em `backend/database/migrations/`, com timestamp posterior ao mais recente existente (ex.: `2026_08_26_000001_make_question_id_nullable_on_answered_questions.php`):

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mudança de RN11: excluir uma questão não deve mais ser bloqueado por ter
 * respostas registradas. A pontuação e o histórico agregado do aluno em
 * answered_questions são preservados; apenas a referência à questão
 * excluída passa a ser nula.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('answered_questions', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreignId('question_id')->nullable()->change();
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreign('question_id')
                ->references('id')->on('questions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('answered_questions', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreignId('question_id')->nullable(false)->change();
        });

        Schema::table('answered_questions', function (Blueprint $table) {
            $table->foreign('question_id')
                ->references('id')->on('questions')
                ->noActionOnDelete();
        });
    }
};
```

> **Atenção:** alterar uma coluna `foreignId` de not-null para nullable em Postgres via `doctrine/dbal` (usado pelo `->change()`) exige que o pacote `doctrine/dbal` esteja disponível (Laravel geralmente já traz suporte nativo a partir da v11 sem depender dele para tipos simples — confirmar rodando a migration em ambiente de teste antes). Se `->change()` falhar, usar `DB::statement('ALTER TABLE answered_questions ALTER COLUMN question_id DROP NOT NULL')` como alternativa dentro do `up()`.

**Rodar e validar:**
```bash
cd backend
php artisan migrate
```
Confirmar no banco de teste (`base_matematica_test`) que `question_id` aceita `NULL` e que a FK está `ON DELETE SET NULL`.

---

## Etapa 2 — `AnsweredQuestion` (model)

Arquivo: `backend/app/Models/AnsweredQuestion.php`

Nenhuma mudança estrutural obrigatória (Eloquent já lida bem com FK nullable). Adicionar apenas um comentário de documentação acima da propriedade/relação `question()` (se existir) ou no topo da classe, avisando que `question_id` pode ser `null` após a exclusão da questão original. Se o código do projeto não tiver relação `question()` no model, não precisa criar uma nova.

---

## Etapa 3 — `QuestionController::destroy()`

Arquivo: `backend/app/Http/Controllers/Api/QuestionController.php`

Remover o bloqueio por respostas existentes. Trecho atual:

```php
public function destroy(Question $question)
{
    // RN11 — answered_questions preserva o histórico de pontuação dos alunos;
    // bloqueia exclusão em vez de apagar (o modal avisa antes; aqui é defesa).
    if ($question->answers()->exists()) {
        return response()->json(['message' => self::BLOCK_REASON], 409);
    }

    // options/question_content/question_topic caem em cascata (FK cascadeOnDelete).
    $question->delete();

    return response()->noContent();
}
```

Trocar por:

```php
public function destroy(Question $question)
{
    // RN11 (revisada): a exclusão da questão é sempre permitida. As respostas
    // já registradas em answered_questions são preservadas (question_id vira
    // null via nullOnDelete), mantendo pontuação, streak e contadores do aluno.
    // options/question_content/question_topic caem em cascata (FK cascadeOnDelete).
    $question->delete();

    return response()->noContent();
}
```

---

## Etapa 4 — `QuestionController::canDelete()`

Mesmo arquivo. Trecho atual:

```php
public function canDelete(Question $question): JsonResponse
{
    $answersCount = $question->answers()->count();

    return response()->json([
        'can_delete' => $answersCount === 0,
        'reason' => $answersCount > 0 ? self::BLOCK_REASON : null,
        'counts' => [
            'answers' => $answersCount,
        ],
    ]);
}
```

Trocar por (mantém `can_delete: true` sempre, mas devolve uma `reason` **informativa**, não bloqueante, quando há respostas — isso permite ao frontend, se quiser, mostrar um aviso no modal sem impedir a ação):

```php
public function canDelete(Question $question): JsonResponse
{
    $answersCount = $question->answers()->count();

    return response()->json([
        'can_delete' => true,
        'reason' => $answersCount > 0
            ? "Esta questão tem {$answersCount} resposta(s) de alunos registradas. O histórico de pontuação será mantido mesmo após a exclusão."
            : null,
        'counts' => [
            'answers' => $answersCount,
        ],
    ]);
}
```

Também remover ou atualizar a constante `BLOCK_REASON` no topo da classe — como ela deixa de bloquear, renomear para `INFO_REASON` (ou similar) e ajustar a mensagem, ou usar a string inline como acima e apagar a constante. Escolher a opção mais simples dado o restante do arquivo; documentar a escolha no PR/commit.

---

## Etapa 5 — Frontend: `ConfirmDeleteModal`

Arquivo: `frontend/src/features/admin/components/ConfirmDeleteModal.tsx`

Hoje o componente só exibe a `reason` quando `checkState.status === 'blocked'`. Como agora toda questão é `allowed`, mas pode vir com uma `reason` informativa, ajustar o JSX do corpo do modal:

Trecho atual:
```tsx
{checkState.status === 'allowed' && <p>Essa ação não pode ser desfeita.</p>}

{isBlocked && <p>{checkState.reason}</p>}
```

Trocar por (mostrar a `reason` informativa também no estado `allowed`, quando presente — é necessário ajustar o tipo `CheckState` para permitir `reason` opcional no estado `allowed`, ou adaptar via um campo extra):

```tsx
{checkState.status === 'allowed' && (
  <>
    <p>Essa ação não pode ser desfeita.</p>
    {checkState.reason && <p className="confirm-delete-info">{checkState.reason}</p>}
  </>
)}

{isBlocked && <p>{checkState.reason}</p>}
```

Ajustar o tipo local `CheckState`:
```ts
type CheckState =
  | { status: 'checking' }
  | { status: 'allowed'; reason?: string | null }
  | { status: 'blocked'; reason: string };
```

E o `useEffect` que popula o estado:
```ts
setCheckState(
  result.can_delete
    ? { status: 'allowed', reason: result.reason }
    : { status: 'blocked', reason: result.reason ?? '' },
);
```

Adicionar uma classe CSS simples `.confirm-delete-info` em `ConfirmDeleteModal.css` (texto discreto, não vermelho — é aviso informativo, não erro):
```css
.confirm-delete-info {
  margin-top: 8px;
  font-size: 13px;
  color: var(--admin-text-secundario);
}
```

> Esse passo do frontend é opcional para o funcionamento (o `can_delete: true` já libera o botão "Excluir" automaticamente pelo componente existente), mas melhora a UX ao avisar o admin do que vai acontecer. Se preferir simplicidade máxima, pode pular a Etapa 5 inteira sem quebrar nada.

Nenhuma mudança necessária em `QuestoesListagemPage.tsx`, `adminService.ts` ou `questionService.ts`.

---

## Etapa 6 — Testes de backend

Arquivo: `backend/tests/Feature/AdminQuestionsTest.php`

### Remover ou reescrever:
- `test_can_delete_bloqueado_com_respostas_de_alunos`
- `test_destroy_retorna_409_quando_ha_respostas`

### Adicionar novos testes:

```php
public function test_can_delete_permitido_mesmo_com_respostas_registradas(): void
{
    $this->admin();
    $question = Question::factory()->create();
    AnsweredQuestion::factory()->create(['question_id' => $question->id]);

    $this->getJson("/api/admin/questions/{$question->id}/can-delete")
        ->assertOk()
        ->assertJson([
            'can_delete' => true,
            'counts' => ['answers' => 1],
        ])
        ->assertJsonPath('reason', fn ($reason) => $reason !== null);
}

public function test_destroy_remove_questao_mesmo_com_respostas_registradas(): void
{
    $this->admin();
    $question = Question::factory()->create();
    $answer = AnsweredQuestion::factory()->create([
        'question_id' => $question->id,
        'points_earned' => 10,
    ]);

    $this->deleteJson("/api/admin/questions/{$question->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('questions', ['id' => $question->id]);

    // A resposta continua existindo, com question_id nulo e pontuação intacta.
    $this->assertDatabaseHas('answered_questions', [
        'id' => $answer->id,
        'question_id' => null,
        'points_earned' => 10,
    ]);
}

public function test_pontuacao_do_aluno_e_preservada_apos_exclusao_da_questao(): void
{
    $this->admin();
    $user = User::factory()->create();
    $question = Question::factory()->create();
    AnsweredQuestion::factory()->create([
        'user_id' => $user->id,
        'question_id' => $question->id,
        'points_earned' => 15,
        'is_correct' => true,
    ]);

    $pontosAntes = $user->answers()->sum('points_earned');

    $this->deleteJson("/api/admin/questions/{$question->id}")
        ->assertNoContent();

    $pontosDepois = $user->fresh()->answers()->sum('points_earned');

    $this->assertSame($pontosAntes, $pontosDepois);
}
```

Adicionar os `use` necessários no topo do arquivo (`App\Models\AnsweredQuestion`, `App\Models\User`), se ainda não estiverem importados.

### Revisar também:
- `backend/tests/Feature/QuestionFilterTest.php` e `PublicQuestionsTest.php` — não devem ser afetados, mas rodar a suíte inteira para confirmar.
- `DashboardTest.php` — atenção especial ao teste `test_empate_entre_topicos_retorna_o_primeiro_em_ordem_alfabetica` e similares: como `question_topic` cai em cascata na exclusão da questão, uma resposta cuja questão foi excluída deixa de contar no `bestTopic()` (join com `question_topic`). Isso é esperado (ver seção "Efeito colateral aceito" abaixo) — não deve haver testes que dependam de excluir questões nesse arquivo hoje, mas vale conferir.

**Rodar a suíte:**
```bash
cd backend
composer test
```

---

## Etapa 7 — Documentação de produto

Arquivo: `documentação_base_matematica/Analise_do_Sistema.md`

Localizar a linha da tabela de regras de negócio referente a **RN11**:

> `RN11 | Cada resposta do aluno gera um novo registro (nunca atualiza um registro anterior), preservando histórico completo de tentativas | ^rn11`

Esta regra em si (nunca atualizar, sempre criar novo registro) **continua válida** e não deve ser alterada. A regra que muda é a que hoje vive apenas no código (bloqueio de exclusão em `QuestionController`) e é citada informalmente como "RN11" nos comentários do controller e no `AGENTS.md`. Duas opções:

- **Opção A (recomendada):** adicionar uma nova regra explícita, ex. `RN24`, documentando o novo comportamento:

  > `RN24 | Excluir uma questão do painel admin é sempre permitido, mesmo havendo respostas de alunos registradas em answered_questions. A exclusão remove a questão e seus vínculos (question_options, question_content, question_topic, em cascata), mas preserva as linhas de answered_questions já existentes — pontuação, streak e contadores agregados do aluno não são afetados. A coluna question_id dessas linhas passa a ser nula (ON DELETE SET NULL). Efeito colateral aceito: a atribuição de "tópico com mais acertos" no Dashboard deixa de contar aquela resposta específica, pois depende do vínculo question_topic, que é removido em cascata. | ^rn24`

- **Opção B:** editar a redação de RN11 para incorporar a mudança, deixando claro que ela não trata mais de bloqueio de exclusão.

Seguir a Opção A por não reescrever uma regra histórica e manter rastreabilidade de mudança.

Atualizar também a seção **5.7 `answered_questions`** para registrar que `question_id` agora é nullable:

> `question_id | FK (nullable) | Referência a questions. Fica nula se a questão original for excluída (ver RN24) — a resposta em si é preservada.`

Arquivo: `documentação_base_matematica/Pendencias.md`

Adicionar uma entrada em "Baixa prioridade" ou "Resolvidas" (conforme o estado final) registrando a decisão consciente sobre o efeito colateral do Dashboard:

> ### Exclusão de questão respondida quebra o vínculo com tópico no "melhor tópico" do Dashboard
> A partir de RN24, excluir uma questão remove `question_topic` em cascata. Respostas anteriores a essa questão continuam contando em pontos/streak/contadores gerais, mas deixam de contar na agregação por tópico (`DashboardController::bestTopic()`), pois esse cálculo faz `JOIN` com `question_topic`. **Decisão consciente:** aceito no momento da implementação de RN24; se isso se tornar um problema real (ex. tópicos "perdendo" acertos após limpeza de conteúdo desatualizado), a mitigação seria congelar `topic_id`/`difficulty` em `answered_questions` no momento da resposta (colunas de snapshot), o que é uma mudança de escopo maior.

Arquivo: `AGENTS.md`

Não precisa de mudança estrutural, mas se houver menção direta ao comportamento antigo de bloqueio de exclusão por respostas (revisar o texto atual do arquivo antes de editar), atualizar para refletir RN24.

---

## Etapa 8 — Checklist final de validação

- [ ] Migration criada e roda sem erro em ambiente de teste (`base_matematica_test`).
- [ ] `php artisan migrate:rollback` seguido de `php artisan migrate` funciona sem erro (down/up simétricos).
- [ ] `composer test` passa 100% (suíte inteira, não só o arquivo alterado).
- [ ] `DELETE /api/admin/questions/{id}` retorna `204` mesmo para questão com respostas.
- [ ] Após o delete, `SELECT * FROM answered_questions WHERE question_id IS NULL` mostra as respostas antigas com `points_earned`/`is_correct`/`answered_at` intactos.
- [ ] `GET /api/me/dashboard` do aluno afetado continua retornando `points`, `total_answered`, `correct`, `incorrect` corretos após a exclusão (não deve haver erro 500 por `question_id` nulo em nenhum join).
- [ ] `GET /api/admin/questions/{id}/can-delete` retorna `can_delete: true` sempre, com `reason` informativa quando `answers.count() > 0`.
- [ ] Frontend: modal de exclusão de questão não trava mais quando há respostas; se a Etapa 5 foi implementada, o texto informativo aparece.
- [ ] `npm run build` e `npm run lint` no frontend sem erros novos.
- [ ] Documentação de produto atualizada (`Analise_do_Sistema.md`, `Pendencias.md`).

---

## Ordem de execução resumida

1. Migration (`answered_questions.question_id` → nullable + `nullOnDelete`)
2. `QuestionController::destroy()` — remover bloqueio 409
3. `QuestionController::canDelete()` — sempre `true` + reason informativa
4. (Opcional) Frontend `ConfirmDeleteModal` — exibir reason informativa no estado `allowed`
5. Testes de backend (remover 2 antigos, adicionar 3 novos, rodar suíte completa)
6. Documentação (`RN24` novo, seção 5.7, `Pendencias.md`)
7. Checklist de validação manual/automatizada
