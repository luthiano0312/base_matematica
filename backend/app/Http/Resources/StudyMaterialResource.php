<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudyMaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            // HTML do artigo — o aluno recebe via pipeline DOMPurify + KaTeX
            // (RN21/RN22), nunca renderizado cru.
            'content' => $this->content,
            'video_url' => $this->video_url,
            'content_id' => $this->content_id,
            'topic_id' => $this->topic_id,
            // Texto puro para resumo na listagem admin.
            'content_plain' => QuestionResource::extractPlainText($this->content),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
