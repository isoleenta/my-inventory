<?php

namespace App\Repositories;

use App\DTOs\RegisterData;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

final class UserRepository
{
    public function findById(int $id): ?User
    {
        return User::query()->find($id);
    }

    public function create(RegisterData $data): User
    {
        return User::query()->create($data->getFillable());
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User|Authenticatable $user, array $data): User
    {
        $model = $user instanceof User ? $user : $this->findById($user->getAuthIdentifier());
        if ($model === null) {
            abort(404);
        }

        $fillable = array_intersect_key($data, array_fill_keys((new User)->getFillable(), null));
        $model->update($fillable);

        return $model->fresh();
    }

    public function delete(User|Authenticatable $user): void
    {
        $model = $user instanceof User ? $user : $this->findById($user->getAuthIdentifier());
        if ($model !== null) {
            $model->delete();
        }
    }
}
