<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnsweredQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'question_id',
        'is_correct',
        'points_earned',
        'answered_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'integer',
        'answered_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // question_id pode ser null: ao excluir a questão original, a linha de
    // answered_questions é preservada e apenas a referência vira null
    // (ON DELETE SET NULL — ver RN24).
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
