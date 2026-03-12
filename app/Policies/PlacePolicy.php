<?php

namespace App\Policies;

use App\Models\Place;
use App\Models\User;

class PlacePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Place $place): bool
    {
        return $place->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Place $place): bool
    {
        return $place->user_id === $user->id;
    }

    public function delete(User $user, Place $place): bool
    {
        return $place->user_id === $user->id;
    }
}
