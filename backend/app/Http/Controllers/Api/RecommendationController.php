<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuestionResource;
use App\Models\Content;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $content = $this->recommendedContent($request->user());

        if (! $content) {
            return QuestionResource::collection(collect());
        }

        $questions = $content->questions()
            ->with(['options', 'contents', 'topics'])
            ->orderBy('id')
            ->get();

        return QuestionResource::collection($questions);
    }

    protected function recommendedContent(User $user): ?Content
    {
        $interests = $user->interests()->get();

        if ($interests->isNotEmpty()) {
            return $interests->random();
        }

        $bestId = DB::table('contents')
            ->join('question_content', 'question_content.content_id', '=', 'contents.id')
            ->join('answered_questions', 'answered_questions.question_id', '=', 'question_content.question_id')
            ->where('answered_questions.user_id', $user->id)
            ->where('answered_questions.is_correct', true)
            ->groupBy('contents.id')
            ->orderByRaw('count(*) desc')
            ->value('contents.id');

        if ($bestId) {
            return Content::find($bestId);
        }

        return Content::query()->inRandomOrder()->first();
    }
}
