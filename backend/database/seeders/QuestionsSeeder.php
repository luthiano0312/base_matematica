<?php

namespace Database\Seeders;

use App\Models\AnsweredQuestion;
use App\Models\Content;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seed de desenvolvimento com questões de exemplo vinculadas aos
 * conteúdos/tópicos do ContentsTopicsSeeder (que roda antes). Algumas têm
 * respostas em answered_questions para exercitar o bloqueio de exclusão
 * (RN11 — Spec_Modal_Confirmacao_Exclusao#3).
 * Idempotente: firstOrCreate por enunciado/resposta; não duplica registros.
 */
class QuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'aluno.teste@basematematica.com.br'],
            [
                'name' => 'Aluno de Teste',
                'password' => 'password',
                'onboarding_completed_at' => now(),
            ],
        );

        foreach ($this->definitions() as $definition) {
            $question = Question::firstOrCreate(
                ['statement' => $definition['statement']],
                [
                    'type' => $definition['type'],
                    'difficulty' => $definition['difficulty'],
                    'correct_answer' => $definition['correct_answer'] ?? null,
                    'text_resolution' => $definition['text_resolution'] ?? null,
                    'video_resolution_url' => $definition['video_resolution_url'] ?? null,
                ],
            );

            if ($question->wasRecentlyCreated) {
                $content = Content::where('name', $definition['content'])->firstOrFail();
                $question->contents()->sync([$content->id]);

                if (isset($definition['topic'])) {
                    $topic = Topic::where('name', $definition['topic'])
                        ->where('content_id', $content->id)
                        ->firstOrFail();
                    $question->topics()->sync([$topic->id]);
                }

                foreach ($definition['options'] ?? [] as $index => $option) {
                    $question->options()->create([
                        'text' => $option['text'],
                        'is_correct' => $option['is_correct'],
                        'order' => $index,
                    ]);
                }
            }

            if (isset($definition['answered'])) {
                AnsweredQuestion::firstOrCreate(
                    ['user_id' => $user->id, 'question_id' => $question->id],
                    [
                        'is_correct' => $definition['answered']['is_correct'],
                        'points_earned' => $definition['answered']['points_earned'],
                        'answered_at' => $definition['answered']['answered_at'] ?? now(),
                    ],
                );
            }
        }
    }

    private function definitions(): array
    {
        return [
            // Com span data-latex — exercita o statement_plain da listagem.
            [
                'statement' => '<p>Quanto é <span data-latex="\frac{1}{2} + \frac{1}{4}">\frac{1}{2} + \frac{1}{4}</span>?</p>',
                'type' => 'multiple_choice',
                'difficulty' => 'easy',
                'content' => 'Frações',
                'topic' => 'Operações com frações',
                'text_resolution' => 'MMC de 2 e 4 é 4: 1/2 = 2/4, então 2/4 + 1/4 = 3/4.',
                'options' => [
                    ['text' => '1/4', 'is_correct' => false],
                    ['text' => '1/2', 'is_correct' => false],
                    ['text' => '3/4', 'is_correct' => true],
                    ['text' => '1', 'is_correct' => false],
                ],
                'answered' => ['is_correct' => true, 'points_earned' => 10],
            ],
            [
                'statement' => '<p>Um produto custa R$ 200,00 e recebe um desconto de 15%. Qual é o valor final?</p>',
                'type' => 'multiple_choice',
                'difficulty' => 'medium',
                'content' => 'Porcentagem',
                'topic' => 'Aumento e desconto',
                'text_resolution' => '15% de 200 = 0,15 × 200 = 30. Valor final: 200 − 30 = R$ 170,00.',
                'options' => [
                    ['text' => 'R$ 170,00', 'is_correct' => true],
                    ['text' => 'R$ 180,00', 'is_correct' => false],
                    ['text' => 'R$ 185,00', 'is_correct' => false],
                    ['text' => 'R$ 175,00', 'is_correct' => false],
                ],
                'answered' => ['is_correct' => false, 'points_earned' => 0],
            ],
            [
                'statement' => '<p>Quais são as raízes da equação <span data-latex="x^2 - 5x + 6 = 0">x^2 - 5x + 6 = 0</span>?</p>',
                'type' => 'multiple_choice',
                'difficulty' => 'hard',
                'content' => 'Equações de 2º grau',
                'topic' => 'Fórmula de Bhaskara',
                'text_resolution' => 'Δ = (−5)² − 4·1·6 = 25 − 24 = 1. x = (5 ± 1)/2, logo x = 2 ou x = 3.',
                'options' => [
                    ['text' => '1 e 6', 'is_correct' => false],
                    ['text' => '2 e 3', 'is_correct' => true],
                    ['text' => '-2 e -3', 'is_correct' => false],
                    ['text' => '5 e 6', 'is_correct' => false],
                ],
            ],
            [
                'statement' => '<p>Em um triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.</p>',
                'type' => 'true_false',
                'difficulty' => 'easy',
                'correct_answer' => 'certo',
                'content' => 'Geometria plana',
                'topic' => 'Teorema de Pitágoras',
                'text_resolution' => 'É o próprio enunciado do Teorema de Pitágoras: a² = b² + c².',
                'answered' => ['is_correct' => true, 'points_earned' => 10],
            ],
            [
                'statement' => '<p>A mediana de um conjunto de dados é sempre igual à média aritmética.</p>',
                'type' => 'true_false',
                'difficulty' => 'medium',
                'correct_answer' => 'errado',
                'content' => 'Estatística',
                'topic' => 'Média, moda e mediana',
                'text_resolution' => 'Falso: em {1, 2, 2, 9}, a média é 3,5 e a mediana é 2. São medidas diferentes.',
            ],
            [
                'statement' => '<p>Explique por que o gráfico de uma função afim é sempre uma reta.</p>',
                'type' => 'essay',
                'difficulty' => 'medium',
                'text_resolution' => 'Uma função afim tem a forma f(x) = ax + b: a taxa de variação é constante (a), então pontos igualmente espaçados em x variam sempre a mesma quantidade em y, o que gera uma reta.',
                'content' => 'Funções',
                'topic' => 'Função afim',
            ],
            [
                'statement' => '<p>Usando as relações fundamentais da trigonometria, mostre que <span data-latex="\sin^2(x) + \cos^2(x) = 1">sen²(x) + cos²(x) = 1</span> a partir do círculo trigonométrico.</p>',
                'type' => 'essay',
                'difficulty' => 'hard',
                'text_resolution' => 'No círculo trigonométrico de raio 1, todo ponto é (cos x, sen x). Pelo Teorema de Pitágoras no triângulo formado com o eixo x: cos²(x) + sen²(x) = 1.',
                'content' => 'Trigonometria',
                'topic' => 'Círculo trigonométrico',
            ],
            [
                'statement' => '<p>Se 3 cadernos custam R$ 36,00, quanto custam 5 cadernos?</p>',
                'type' => 'multiple_choice',
                'difficulty' => 'easy',
                'content' => 'Razão e proporção',
                'topic' => 'Regra de três',
                'text_resolution' => 'Cada caderno custa 36 ÷ 3 = R$ 12,00; 5 cadernos custam 5 × 12 = R$ 60,00.',
                'options' => [
                    ['text' => 'R$ 48,00', 'is_correct' => false],
                    ['text' => 'R$ 54,00', 'is_correct' => false],
                    ['text' => 'R$ 60,00', 'is_correct' => true],
                    ['text' => 'R$ 72,00', 'is_correct' => false],
                ],
            ],
        ];
    }
}
