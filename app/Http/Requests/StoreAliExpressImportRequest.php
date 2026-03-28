<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreAliExpressImportRequest extends AliExpressImportRequest
{
    /**
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\Exists>>
     */
    public function rules(): array
    {
        return [
            ...$this->sourceRules(),
            'place_id' => [
                'required',
                'integer',
                Rule::exists('places', 'id')->where('user_id', $this->user('web_user')->id),
            ],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user('web_user')->id),
            ],
        ];
    }

    public function placeId(): int
    {
        return (int) $this->validated('place_id');
    }

    public function categoryId(): ?int
    {
        $categoryId = $this->validated('category_id');

        return $categoryId !== null ? (int) $categoryId : null;
    }
}
