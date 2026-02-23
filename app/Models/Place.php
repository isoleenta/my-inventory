<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Place extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'value',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Options for dropdowns: [{ value, label }], ordered by sort_order then name.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function optionsForUser(User $user): array
    {
        return static::query()
            ->forUser($user)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Place $p) => ['value' => $p->value, 'label' => $p->name])
            ->values()
            ->all();
    }
}
