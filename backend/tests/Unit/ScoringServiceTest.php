<?php

namespace Tests\Unit;

use App\Models\AnsweredQuestion;
use App\Models\Question;
use App\Models\User;
use App\Services\ScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScoringServiceTest extends TestCase
{
    use RefreshDatabase;

    private ScoringService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ScoringService;
    }

    private function answer(User $user, Question $question, bool $isCorrect): void
    {
        AnsweredQuestion::create([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'is_correct' => $isCorrect,
            'points_earned' => 0,
            'answered_at' => now(),
        ]);
    }

    public function test_primeira_tentativa_questao_facil_acertou_ganha_10_pontos(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->easy()->create();

        $this->assertSame(10, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_primeira_tentativa_questao_media_acertou_ganha_15_pontos(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->medium()->create();

        $this->assertSame(15, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_primeira_tentativa_questao_dificil_acertou_ganha_20_pontos(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->hard()->create();

        $this->assertSame(20, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_primeira_tentativa_errou_nao_ganha_pontos(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->easy()->create();

        $this->assertSame(0, $this->service->pointsForAttempt($user, $question, false));
    }

    public function test_refez_apos_erro_e_acertou_ganha_5_pontos_fixos(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->hard()->create();
        $this->answer($user, $question, false);

        $this->assertSame(5, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_refez_apos_erro_e_errou_de_novo_nao_ganha_pontos(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->easy()->create();
        $this->answer($user, $question, false);

        $this->assertSame(0, $this->service->pointsForAttempt($user, $question, false));
    }

    public function test_refez_apos_acerto_e_acertou_de_novo_nao_ganha_pontos_adicionais(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->easy()->create();
        $this->answer($user, $question, true);

        $this->assertSame(0, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_refez_apos_acerto_e_errou_nao_ganha_pontos_adicionais(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->easy()->create();
        $this->answer($user, $question, true);

        $this->assertSame(0, $this->service->pointsForAttempt($user, $question, false));
    }

    public function test_questao_dissertativa_autoavaliada_aplica_mesmas_regras(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->essay()->hard()->create();

        $this->assertSame(20, $this->service->pointsForAttempt($user, $question, true));

        $this->answer($user, $question, false);
        $this->assertSame(5, $this->service->pointsForAttempt($user, $question, true));

        $this->answer($user, $question, true);
        $this->assertSame(0, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_apos_primeiro_acerto_regra_rn10_trava_permanentemente(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->easy()->create();

        $this->answer($user, $question, false);
        $this->answer($user, $question, true);
        $this->answer($user, $question, false);

        $this->assertSame(0, $this->service->pointsForAttempt($user, $question, true));
    }

    public function test_historico_apenas_de_outra_questao_nao_afeta_a_pontuacao(): void
    {
        $user = User::factory()->create();
        $otherQuestion = Question::factory()->easy()->create();
        $this->answer($user, $otherQuestion, true);

        $question = Question::factory()->easy()->create();

        $this->assertSame(10, $this->service->pointsForAttempt($user, $question, true));
    }
}
