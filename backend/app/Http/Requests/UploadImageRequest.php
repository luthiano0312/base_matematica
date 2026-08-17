<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 5MB, jpg/png/webp (decisão registrada no plano).
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Selecione um arquivo de imagem.',
            'file.image' => 'O arquivo enviado não é uma imagem válida.',
            'file.mimes' => 'Formato de imagem não suportado. Use JPG, PNG ou WEBP.',
            'file.max' => 'A imagem excede o tamanho máximo de 5 MB.',
        ];
    }
}
