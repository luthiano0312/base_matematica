<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'statement' => $this->statement,
            // Texto puro do enunciado para a coluna "Enunciado" da listagem admin.
            'statement_plain' => self::extractPlainText($this->statement),
            'type' => $this->type,
            'correct_answer' => $this->correct_answer,
            'difficulty' => $this->difficulty,
            'text_resolution' => $this->text_resolution,
            'video_resolution_url' => $this->video_resolution_url,
            'options' => $this->whenLoaded('options', fn () => $this->options->map(fn ($o) => [
                'id' => $o->id,
                'text' => $o->text,
                'is_correct' => $o->is_correct,
                'order' => $o->order,
            ])),
            'contents' => $this->whenLoaded('contents', fn () => $this->contents->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
            ])),
            'topics' => $this->whenLoaded('topics', fn () => $this->topics->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Extrai texto puro do enunciado em HTML: spans `data-latex` gerados pelo
     * editor (MathInlineNode) viram o LaTeX puro; depois strip_tags, decode de
     * entidades e whitespace colapsado. Null quando não sobra texto.
     */
    public static function extractPlainText(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $text = preg_replace(
            '/<span\b[^>]*\bdata-latex="([^"]*)"[^>]*>.*?<\/span>/is',
            '$1',
            $html,
        );

        $text = html_entity_decode(strip_tags($text ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');

        return $text === '' ? null : $text;
    }
}
