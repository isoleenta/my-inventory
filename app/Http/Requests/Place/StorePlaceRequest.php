<?php

namespace App\Http\Requests\Place;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Place::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $user = $this->user();

        return [
            'name' => ['required', 'string', 'max:255'],
            'value' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('places', 'value')->where('user_id', $user->id),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'value.regex' => 'The value may only contain lowercase letters, numbers and underscores.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $value = $this->input('value');
        if (is_string($value)) {
            $this->merge(['value' => strtolower($value)]);
        }
    }
}
