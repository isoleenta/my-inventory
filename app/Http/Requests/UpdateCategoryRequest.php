<?php

namespace App\Http\Requests;

use App\DTOs\CategoryData;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $user = $this->user('web_user');
        $category = $this->route('category');
        $descendantAndSelfIds = $category instanceof Category
            ? $category->getDescendantAndSelfIds()
            : [];

        return [
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => [
                'nullable',
                'integer',
                'min:1',
                Rule::exists('categories', 'id')->where('user_id', $user->id),
                Rule::notIn($descendantAndSelfIds),
            ],
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
        $parentId = $this->validated('parent_id');
        $parentId = $parentId !== null && $parentId !== '' && (int) $parentId > 0 ? (int) $parentId : null;

        return new CategoryData(
            name: $this->validated('name'),
            fields: $normalized,
            parentId: $parentId
        );
    }
}
