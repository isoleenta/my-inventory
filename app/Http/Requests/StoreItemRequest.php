<?php

namespace App\Http\Requests;

use App\DTOs\ItemData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreItemRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user('web_user')->id),
            ],
            'place_id' => [
                'required',
                'integer',
                Rule::exists('places', 'id')->where('user_id', $this->user('web_user')->id),
            ],
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'photos' => ['nullable', 'array', 'max:10'],
            'photos.*' => ['image', 'max:5120'],
            'details' => ['nullable', 'array'],
            'details.*' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function toDTO(): ItemData
    {
        $v = $this->validated();

        return new ItemData(
            title: $v['title'],
            place_id: (int) $v['place_id'],
            description: $v['description'] ?? null,
            category_id: isset($v['category_id']) ? (int) $v['category_id'] : null,
            price: isset($v['price']) ? (string) $v['price'] : null,
            details: $v['details'] ?? []
        );
    }
}
