<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\StatefulGuard;

final class ProfileService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly StatefulGuard $guard
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateProfile(Authenticatable $user, array $data): void
    {
        $model = $this->resolveUser($user);
        if ($model === null) {
            return;
        }

        if (isset($data['email']) && $data['email'] !== $model->email) {
            $data['email_verified_at'] = null;
        }

        $this->userRepository->update($model, $data);
    }

    public function deleteAccount(Authenticatable $user): void
    {
        $this->guard->logout();
        $this->userRepository->delete($user);
    }

    private function resolveUser(Authenticatable $user): ?User
    {
        return $user instanceof User ? $user : $this->userRepository->findById($user->getAuthIdentifier());
    }
}
