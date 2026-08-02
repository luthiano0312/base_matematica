<?php

namespace App\Http\Requests;

use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnswerQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Question $question */
        $question = $this->route('question');

        return match ($question->type) {
            'multiple_choice' => [
                'option_id' => [
                    'required',
                    'integer',
                    Rule::exists('question_options', 'id')->where('question_id', $question->id),
                ],
            ],
            'true_false' => [
                'answer' => ['required', Rule::in(['certo', 'errado'])],
            ],
            'essay' => [
                'answer' => ['required', 'string'],
                'self_corrected' => ['required', 'boolean'],
            ],
            default => [],
        };
    }
}
