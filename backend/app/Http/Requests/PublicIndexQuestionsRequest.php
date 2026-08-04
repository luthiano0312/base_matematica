<?php

namespace App\Http\Requests;

use App\Models\Topic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PublicIndexQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_id' => ['nullable', 'integer', 'exists:contents,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'type' => ['nullable', Rule::in(['multiple_choice', 'true_false', 'essay'])],
            'types' => ['nullable', 'array'],
            'types.*' => ['required', Rule::in(['multiple_choice', 'true_false', 'essay'])],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $contentId = $this->input('content_id');
            $topicId = $this->input('topic_id');

            if ($contentId && $topicId) {
                $topic = Topic::find($topicId);

                if ($topic && (int) $topic->content_id !== (int) $contentId) {
                    $validator->errors()->add(
                        'topic_id',
                        'O tópico informado não pertence ao conteúdo informado.'
                    );
                }
            }
        });
    }
}
