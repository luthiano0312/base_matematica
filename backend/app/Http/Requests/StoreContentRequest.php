<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Limite de 100 caracteres definido na Spec_Modal_Conteudo_Topico (campo Nome).
        return [
            'name' => ['required', 'string', 'max:100'],
        ];
    }
}
