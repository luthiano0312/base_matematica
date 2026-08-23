<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'topic_id',
        'content_id',
        'video_url',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    // Sem relação `content()`: a coluna `content` (HTML do artigo) sombrearia
    // o accessor da relação no Eloquent — `$material->content` retornaria o
    // atributo, nunca o model Content carregado. O nome do conteúdo é
    // resolvido no cliente, contra o catálogo (`GET /api/contents`).
}
