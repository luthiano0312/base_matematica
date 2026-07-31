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
}