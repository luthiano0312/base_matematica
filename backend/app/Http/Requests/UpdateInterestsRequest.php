<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterestsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_ids' => ['nullable', 'array'],
            'content_ids.*' => ['integer', 'exists:contents,id'],
        ];
    }
}
