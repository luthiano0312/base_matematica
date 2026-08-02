<?php

namespace Tests\Unit;

use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Models\User;
use App\Services\StreakService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class StreakServiceTest extends TestCase
{
    use RefreshDatabase;

    private StreakService $service;

    private User $user;

    private Question $question;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new StreakService;
        $this->user = User::factory()->create();
        $this->question = Question::factory()->create();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function answerAt(string $datetimeInSaoPaulo): void
    {
        AnsweredQuestion::factory()->create([
            'user_id' => $this->user->id,
            'question_id' => $this->question->id,
            'answered_at' => Carbon::parse($datetimeInSaoPaulo, 'America/Sao_Paulo')->setTimezone('UTC'),
        ]);
    }

    public function test_respondeu_hoje_e_nos_3_dias_anteriores_sem_furo_streak_4(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-29 10:00:00');
        $this->answerAt('2026-07-30 10:00:00');
        $this->answerAt('2026-07-31 10:00:00');
        $this->answerAt('2026-08-01 10:00:00');

        $this->assertSame(4, $this->service->currentStreak($this->user));
    }

    public function test_respondeu_hoje_mas_pulou_um_dia_ha_uma_semana_streak_1(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-25 10:00:00');
        $this->answerAt('2026-08-01 10:00:00');

        $this->assertSame(1, $this->service->currentStreak($this->user));
    }

    public function test_sem_nenhuma_resposta_streak_0(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');

        $this->assertSame(0, $this->service->currentStreak($this->user));
    }

    public function test_respondeu_ontem_e_ainda_nao_hoje_streak_conta_ate_ontem(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-29 10:00:00');
        $this->answerAt('2026-07-30 10:00:00');
        $this->answerAt('2026-07-31 10:00:00');

        $this->assertSame(3, $this->service->currentStreak($this->user));
    }

    public function test_resposta_23h50_e_outra_00h10_do_dia_seguinte_conta_como_2_dias_consecutivos(): void
    {
        Carbon::setTestNow('2026-08-02 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-31 23:50:00');
        $this->answerAt('2026-08-01 00:10:00');

        $this->assertSame(2, $this->service->currentStreak($this->user));
    }

    public function test_um_dia_inteiro_sem_atividade_no_meio_reinicia_a_contagem(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-28 10:00:00');
        $this->answerAt('2026-07-29 10:00:00');
        $this->answerAt('2026-07-31 10:00:00');
        $this->answerAt('2026-08-01 10:00:00');

        $this->assertSame(2, $this->service->currentStreak($this->user));
    }

    public function test_multiplas_respostas_no_mesmo_dia_conta_como_um_dia(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-29 08:00:00');
        $this->answerAt('2026-07-30 08:00:00');
        $this->answerAt('2026-07-30 12:00:00');
        $this->answerAt('2026-07-30 20:00:00');
        $this->answerAt('2026-07-31 10:00:00');
        $this->answerAt('2026-08-01 10:00:00');

        $this->assertSame(4, $this->service->currentStreak($this->user));
    }

    public function test_quebra_de_streak_sem_atividade_recente(): void
    {
        Carbon::setTestNow('2026-08-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-07-28 10:00:00');
        $this->answerAt('2026-07-29 10:00:00');

        $this->assertSame(0, $this->service->currentStreak($this->user));
    }

    public function test_virada_de_mes_23h50_e_00h10_conta_como_2_dias_consecutivos(): void
    {
        Carbon::setTestNow('2026-02-01 12:00:00', 'America/Sao_Paulo');
        $this->answerAt('2026-01-31 23:50:00');
        $this->answerAt('2026-02-01 00:10:00');

        $this->assertSame(2, $this->service->currentStreak($this->user));
    }
}
