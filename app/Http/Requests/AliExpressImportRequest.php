<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class AliExpressImportRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('html')) {
            $html = trim((string) $this->input('html'));
            $this->merge([
                'html' => $html !== '' ? $html : null,
            ]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    protected function sourceRules(): array
    {
        return [
            'html' => ['nullable', 'string', 'max:2000000', 'required_without:html_file'],
            'html_file' => ['nullable', 'file', 'mimes:html,htm,txt', 'max:10240', 'required_without:html'],
        ];
    }

    public function htmlContent(): string
    {
        $file = $this->file('html_file');

        if ($file !== null) {
            return (string) $file->get();
        }

        return (string) $this->string('html')->trim();
    }
}
