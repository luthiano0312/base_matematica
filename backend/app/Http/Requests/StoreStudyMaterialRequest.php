<?php

namespace App\Http\Requests;

use App\Models\Topic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreStudyMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            // Artigo em HTML rico; nullable porque o material pode ser só vídeo.
            'content' => ['nullable', 'string'],
            // Mesmo padrão simples de video_resolution_url em questions.
            'video_url' => ['nullable', 'url'],
            'content_id' => ['required', 'integer', 'exists:contents,id'],

            // Opcional (RN16 validada abaixo).
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $this->validateTopicoPertenceAoConteudo($validator);
            $this->validateAoMenosUmMeio($validator);
        });
    }

    /**
     * RN16: o tópico vinculado deve pertencer ao mesmo conteúdo do material.
     */
    protected function validateTopicoPertenceAoConteudo(Validator $validator): void
    {
        $topicId = $this->integer('topic_id');

        if ($topicId === 0) {
            return;
        }

        $pertence = Topic::whereKey($topicId)
            ->where('content_id', $this->integer('content_id'))
            ->exists();

        if (! $pertence) {
            $validator->errors()->add(
                'topic_id',
                'RN16: o tópico selecionado pertence a outro conteúdo.'
            );
        }
    }

    /**
     * O material precisa de ao menos um meio: artigo ou vídeo. Espelha a
     * semântica do helper `htmlVazio` do frontend — `<img>` e spans
     * `data-latex` são removidos antes do strip_tags (artigo só com imagem
     * ou fórmula conta como vazio para esta regra).
     */
    protected function validateAoMenosUmMeio(Validator $validator): void
    {
        if ($this->filled('video_url')) {
            return;
        }

        $html = (string) $this->input('content', '');
        $semMidia = preg_replace('/<img\b[^>]*>/i', '', $html);
        $semMidia = (string) preg_replace('/<span\b[^>]*\bdata-latex[^>]*>.*?<\/span>/is', '', $semMidia);
        $texto = trim(html_entity_decode(
            (string) preg_replace('/\s+/u', ' ', strip_tags($semMidia)),
            ENT_QUOTES | ENT_HTML5,
            'UTF-8',
        ));

        if ($texto === '') {
            $validator->errors()->add(
                'content',
                'Preencha o artigo ou informe o link do vídeo.'
            );
        }
    }
}
