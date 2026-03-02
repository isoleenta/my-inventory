<?php

namespace App\DTOs;

/**
 * @phpstan-type FillableArray array{name: string, email: string, password: string}
 */
final class RegisterData
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password
    ) {}

    /**
     * @return FillableArray
     */
    public function getFillable(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
        ];
    }
}
