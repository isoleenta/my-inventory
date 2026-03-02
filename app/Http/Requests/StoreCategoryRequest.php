<?php

namespace App\Http\Requests;

use App\DTOs\CategoryData;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'fields' => ['nullable', 'array', 'max:50'],
            'fields.*.key' => ['required', 'string', 'max:100', 'regex:/^[a-z][a-z0-9_]*$/'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', 'in:text,number'],
        ];
    }

    public function toDTO(): CategoryData
    {
        $fields = $this->validated('fields', []);
        $normalized = array_values(array_map(static function (array $f): array {
            return [
                'key' => $f['key'],
                'label' => $f['label'],
                'type' => $f['type'],
            ];
        }, $fields));

        return new CategoryData(
            name: $this->validated('name'),
            fields: $normalized
        );
    }
}
