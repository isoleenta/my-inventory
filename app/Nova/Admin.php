<?php

namespace App\Nova;

use App\Models;
use Illuminate\Validation\Rules;
use Laravel\Nova\Auth\PasswordValidationRules;
use Laravel\Nova\Fields;
use Laravel\Nova\Http\Requests\NovaRequest;

class Admin extends Resource
{
    use PasswordValidationRules;

    public static $model = Models\Admin::class;

    public static $title = 'name';

    public static $search = [
        'id', 'name', 'email',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, \Laravel\Nova\Fields\Field|\Laravel\Nova\Panel|\Laravel\Nova\ResourceTool|\Illuminate\Http\Resources\MergeValue>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Fields\ID::make()->sortable(),

            Fields\Text::make(__('Name'), 'name')
                ->sortable()
                ->rules('required', 'max:255'),

            Fields\Text::make(__('Email'), 'email')
                ->sortable()
                ->rules('required', 'email', 'max:254')
                ->creationRules('unique:admins,email')
                ->updateRules('unique:admins,email,{{resourceId}}'),

            Fields\Password::make('Password')
                ->onlyOnForms()
                ->creationRules($this->passwordRules())
                ->updateRules($this->optionalPasswordRules()),

            ...$this->getTimestampsFields(),
        ];
    }
}
