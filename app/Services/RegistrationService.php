<?php

namespace App\Services;

use App\DTOs\RegisterData;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Auth\StatefulGuard;

final class RegistrationService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly StatefulGuard $guard
    ) {}

    public function register(RegisterData $data): User
    {
        $user = $this->userRepository->create($data);

        event(new Registered($user));

        $this->guard->login($user);

        return $user;
    }
}
