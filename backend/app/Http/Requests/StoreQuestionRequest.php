<?php

namespace App\Http\Requests;

use App\Models\Topic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'statement' => ['required', 'string'],
            'type' => ['required', 'in:multiple_choice,true_false,essay'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            // RF05: obrigatória só para dissertativa (gabarito da autoavaliação).
            'text_resolution' => ['nullable', 'string', 'required_if:type,essay'],
            'video_resolution_url' => ['nullable', 'url'],

            // Obrigatório só para 'true_false' (valores 'certo'/'errado').
            'correct_answer' => ['nullable', 'string', 'required_if:type,true_false', 'in:certo,errado'],

            // Obrigatório só para 'multiple_choice'.
            'options' => ['required_if:type,multiple_choice', 'array', 'min:2'],
            'options.*.text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],

            // RN: toda questão precisa de ao menos 1 conteúdo vinculado.
            'content_ids' => ['required', 'array', 'min:1'],
            'content_ids.*' => ['integer', 'exists:contents,id'],

            // Opcional (RN16 validada abaixo).
            'topic_ids' => ['nullable', 'array'],
            'topic_ids.*' => ['integer', 'exists:topics,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $this->validateExactlyOneCorrectOption($validator);
            $this->validateRn16($validator);
        });
    }

    /**
     * Para múltipla escolha, exatamente 1 opção deve ser marcada como correta.
     */
    protected function validateExactlyOneCorrectOption(Validator $validator): void
    {
        if ($this->input('type') !== 'multiple_choice') {
            return;
        }

        $options = collect($this->input('options', []));
        $correctCount = $options->where('is_correct', true)->count();

        if ($correctCount !== 1) {
            $validator->errors()->add(
                'options',
                'Múltipla escolha precisa ter exatamente 1 alternativa marcada como correta.'
            );
        }
    }

    /**
     * RN16: todo tópico vinculado à questão deve pertencer a um dos
     * conteúdos já vinculados à mesma questão.
     */
    protected function validateRn16(Validator $validator): void
    {
        $topicIds = $this->input('topic_ids', []);
        $contentIds = $this->input('content_ids', []);

        if (empty($topicIds)) {
            return;
        }

        $invalidTopics = Topic::whereIn('id', $topicIds)
            ->whereNotIn('content_id', $contentIds)
            ->pluck('id');

        if ($invalidTopics->isNotEmpty()) {
            $validator->errors()->add(
                'topic_ids',
                'RN16: os tópicos '.$invalidTopics->join(', ').
                ' pertencem a um conteúdo que não foi vinculado a esta questão.'
            );
        }
    }
}
