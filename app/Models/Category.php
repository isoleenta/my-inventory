<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'fields',
    ];

    protected function casts(): array
    {
        return [
            'fields' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    /**
     * @return array<int, int>
     */
    public function getDescendantAndSelfIds(): array
    {
        $ids = [$this->id];
        $currentLevelIds = [$this->id];

        do {
            $nextLevelIds = static::query()
                ->whereIn('parent_id', $currentLevelIds)
                ->pluck('id')
                ->all();
            if ($nextLevelIds === []) {
                break;
            }
            $ids = array_merge($ids, $nextLevelIds);
            $currentLevelIds = $nextLevelIds;
        } while (true);

        return array_values(array_unique($ids));
    }

    public function resolveRouteBinding($value, $field = null): ?static
    {
        $user = auth('web_user')->user();

        return $user
            ? static::query()->where('user_id', $user->id)->where($field ?? $this->getRouteKeyName(), $value)->first()
            : null;
    }
}
