<?php

namespace App\Http\Requests;

class PreviewAliExpressImportRequest extends AliExpressImportRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return $this->sourceRules();
    }
}
