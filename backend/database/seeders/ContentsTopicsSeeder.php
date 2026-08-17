<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\Topic;
use Illuminate\Database\Seeder;

/**
 * Seed de desenvolvimento com os conteúdos/tópicos usados como referência
 * no mockup do cadastro de questões (mesma lista do checklist de onboarding).
 * Idempotente: não duplica nem sobrescreve registros existentes.
 */
class ContentsTopicsSeeder extends Seeder
{
    /**
     * conteúdo => tópicos
     */
    private const CONTENTS = [
        'Frações' => ['Operações com frações', 'Frações equivalentes', 'Números mistos'],
        'Porcentagem' => ['Cálculo de porcentagem', 'Aumento e desconto'],
        'Equações de 1º grau' => ['Isolamento de variável', 'Problemas com equações de 1º grau'],
        'Equações de 2º grau' => ['Fórmula de Bhaskara', 'Soma e produto das raízes', 'Função quadrática'],
        'Funções' => ['Função afim', 'Função quadrática', 'Domínio e imagem'],
        'Geometria plana' => ['Áreas de figuras planas', 'Perímetro', 'Teorema de Pitágoras'],
        'Trigonometria' => ['Seno, cosseno e tangente', 'Círculo trigonométrico'],
        'Estatística' => ['Média, moda e mediana', 'Leitura de gráficos'],
        'Probabilidade' => ['Probabilidade simples', 'Eventos independentes'],
        'Razão e proporção' => ['Regra de três', 'Grandezas proporcionais'],
    ];

    public function run(): void
    {
        foreach (self::CONTENTS as $contentName => $topicNames) {
            $content = Content::firstOrCreate(['name' => $contentName]);

            foreach ($topicNames as $topicName) {
                Topic::firstOrCreate([
                    'name' => $topicName,
                    'content_id' => $content->id,
                ]);
            }
        }
    }
}
