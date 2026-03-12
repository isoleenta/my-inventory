---
name: making-tests
description: Write and structure automated tests for Laravel (PHPUnit). Use when creating tests, adding test coverage, writing feature/unit tests, or when the user asks how to test something.
---

# Making Tests

Apply this skill when writing or updating tests so they match project conventions and stay practical and maintainable.

## Test Types

| Type | Use for | Location |
|------|--------|----------|
| **Unit** | Pure logic, services, helpers, transformers | `tests/Unit/` (e.g. `Services/UserServiceTest.php`) |
| **Feature** | HTTP requests, DB, end-to-end flows | `tests/Feature/` (e.g. `Auth/LoginTest.php`) |
| **Integration** (optional) | DB + services + external APIs together | as needed |

## Structure

- Tests in `tests/` only.
- End filenames with `Test.php`.
- Group by domain when possible: `tests/Feature/User/`, `tests/Feature/Auth/`, `tests/Unit/Services/`.

## Naming

Use descriptive test method names:

```php
public function test_user_can_be_invited_via_email(): void
public function test_slug_is_generated_from_title(): void
```

## Principles

- **Fast and isolated**: Use factories; refresh or reset DB as needed.
- **One thing per test**: One main assertion or one clear behavior.
- **Success and failure**: Cover both where it matters.
- **Laravel tools**: Prefer `actingAs`, `withoutExceptionHandling`, `artisan`, etc. Avoid mocking facades unless necessary.

## Data

- Use **factories** for test data. Prefer `User::factory()->create()` over manual `Model::create([...])`.
- For relations: `Team::factory()->hasUsers(3)->create()` (or equivalent).

## Database

- Use `RefreshDatabase` in tests that touch the DB:

  ```php
  use Illuminate\Foundation\Testing\RefreshDatabase;
  ```

- Optionally use `DatabaseTransactions` for faster resets when migrations are not required.
- For SQLite: configure `phpunit.xml` with in-memory DB if you want faster runs.

## Running Tests

- Full suite: `docker compose exec api php artisan test` or `docker compose exec api vendor/bin/phpunit`
- Single test/file: `docker compose exec api php artisan test --filter=InviteUserTest`
- Coverage (with Xdebug/PCOV): `docker compose exec api php artisan test --coverage`

## When Not to Test

Skip tests for:

- Trivial setters/getters
- Framework behavior (e.g. Laravel’s own validation)
- Logic already covered in another layer

## Quick Checklist

When adding or changing tests:

- [ ] File named `*Test.php` in `tests/Feature/` or `tests/Unit/`
- [ ] `RefreshDatabase` (or `DatabaseTransactions`) where DB is used
- [ ] Data from factories, not raw `Model::create([...])` unless necessary
- [ ] Method names like `test_<who>_<can_do_what>` or `test_<what_behavior>`
- [ ] Both success and failure paths covered where relevant
