<?php

namespace App\Http\Requests;

use App\DTOs\ItemData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
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
            'price_currency' => ['nullable', 'string', Rule::in(['USD', 'UAH'])],
            'purchased_on' => ['nullable', 'date'],
            'photos' => ['nullable', 'array', 'max:10'],
            'photos.*' => ['image', 'max:5120'],
            'photo_order' => ['nullable', 'array'],
            'photo_order.*' => ['string', 'regex:/^(existing|new):\d+$/'],
            'removed_photo_ids' => ['nullable', 'array'],
            'removed_photo_ids.*' => ['integer'],
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
            price_currency: isset($v['price_currency']) ? (string) $v['price_currency'] : 'USD',
            purchased_on: $v['purchased_on'] ?? null,
            details: $v['details'] ?? [],
            photo_order: $v['photo_order'] ?? [],
            removed_photo_ids: array_map('intval', $v['removed_photo_ids'] ?? []),
        );
    }
}
