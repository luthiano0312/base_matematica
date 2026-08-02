<?php

namespace App\Services;

use App\Models\AnsweredQuestion;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class StreakService
{
    private const TIMEZONE = 'America/Sao_Paulo';

    public function currentStreak(User $user): int
    {
        $days = $this->distinctAnswerDays($user);

        if ($days->isEmpty()) {
            return 0;
        }

        $today = $this->todayInSaoPaulo();
        $cursor = $days->contains(fn (Carbon $day) => $day->eq($today))
            ? $today
            : $today->copy()->subDay();

        if (! $days->contains(fn (Carbon $day) => $day->eq($cursor))) {
            return 0;
        }

        $streak = 0;

        while ($days->contains(fn (Carbon $day) => $day->eq($cursor))) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    /**
     * Dias distintos (na data de Brasília) com ao menos uma resposta.
     *
     * @return Collection<int, Carbon>
     */
    private function distinctAnswerDays(User $user): Collection
    {
        return AnsweredQuestion::query()
            ->where('user_id', $user->id)
            ->get(['answered_at'])
            ->pluck('answered_at')
            ->map(fn (Carbon $answeredAt) => $this->asSaoPauloDay($answeredAt))
            ->unique(fn (Carbon $day) => $day->toDateString())
            ->values();
    }

    private function asSaoPauloDay(Carbon $answeredAt): Carbon
    {
        return $answeredAt->copy()->setTimezone(self::TIMEZONE)->startOfDay();
    }

    private function todayInSaoPaulo(): Carbon
    {
        return Carbon::now(self::TIMEZONE)->startOfDay();
    }
}
