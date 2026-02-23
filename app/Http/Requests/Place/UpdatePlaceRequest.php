<?php

namespace App\Http\Requests\Place;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('place'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var \App\Models\Place $place */
        $place = $this->route('place');

        return [
            'name' => ['required', 'string', 'max:255'],
            'value' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('places', 'value')
                    ->where('user_id', $place->user_id)
                    ->ignore($place->id),
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
