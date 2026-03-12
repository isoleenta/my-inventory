---
name: making-tests
description: Write and structure automated tests for Laravel (PHPUnit). Use when creating tests, adding test coverage, writing feature/unit tests, or when the user asks how to test something.
---

# Making Tests

Apply this skill when writing or updating tests so they match project conventions and stay practical and maintainable. Prefer **Laravel Boost** `search-docs` for version-specific testing docs (e.g. `queries: ['testing', 'HTTP test', 'database testing']`, `packages: ['laravel/framework']`).

## Test types

| Type | Use for | Location | Laravel app booted |
|------|--------|----------|--------------------|
| **Unit** | Pure logic, single methods, no DB/framework | `tests/Unit/` | No |
| **Feature** | HTTP, DB, flows, auth, APIs | `tests/Feature/` | Yes |

**Prefer feature tests** when in doubt — they give more confidence that the system works. Unit tests live in `tests/Unit` and do **not** boot the application (no DB, no facades unless you bootstrap them).

## Creating tests

Use Artisan (run inside Docker):

```bash
# Feature test (default)
docker compose exec api php artisan make:test UserTest

# Unit test
docker compose exec api php artisan make:test UserServiceTest --unit
```

- One test class per file; filename must end with `Test.php`.
- Group by domain when useful: `tests/Feature/Auth/LoginTest.php`, `tests/Unit/Services/UserServiceTest.php`.
- Feature tests extend `Tests\TestCase`; unit tests extend `PHPUnit\Framework\TestCase` (no Laravel app).

## Naming

Use descriptive test method names (snake_case, `test_` prefix or `/** @test */`):

```php
public function test_user_can_be_invited_via_email(): void
public function test_slug_is_generated_from_title(): void
public function test_returns_422_when_validation_fails(): void
```

## Principles

- **One behavior per test**: One main assertion or one clear scenario.
- **Fast and isolated**: Use factories; reset DB only where needed.
- **Success and failure**: Cover both where it matters (e.g. auth, validation).
- **Laravel helpers first**: Use `actingAs`, `withoutExceptionHandling`, `$this->get()`/`postJson()`, etc. Mock facades only when necessary.

## Data and database

- **Use factories** for test data: `User::factory()->create()`, `Team::factory()->hasUsers(3)->create()`. Avoid raw `Model::create([...])` unless required.
- **Feature tests that touch the DB** must use `RefreshDatabase`:

  ```php
  use Illuminate\Foundation\Testing\RefreshDatabase;

  class ExampleTest extends TestCase
  {
      use RefreshDatabase;
  }
  ```

- `RefreshDatabase` runs migrations if needed, then uses a transaction per test (no full reset by default). For a full reset use `DatabaseMigrations` or `DatabaseTruncation` (slower).
- Optional: run seeders with `$this->seed()`, `$this->seed(OrderStatusSeeder::class)`, or set `protected $seed = true` (or `$seeder`) on the base `TestCase`.
- **Unit tests** must not use DB or Laravel boot; use plain PHPUnit `TestCase` and no `RefreshDatabase`.

## HTTP and API testing

- Request helpers: `$this->get()`, `$this->postJson()`, `$this->put()`, `$this->delete()`, etc.
- **Authentication**: `$this->actingAs($user)` or `$this->actingAs($user, 'web')`; unauthenticated: `$this->actingAsGuest()`. For Sanctum API: `Sanctum::actingAs($user, ['*'])` or specific abilities.
- **Session**: `$this->withSession(['key' => 'value'])`.
- **Exception handling**: `$this->withoutExceptionHandling()->get('/')` to see real exceptions; or use `Exceptions::fake()` and `Exceptions::assertReported()`.
- **Response assertions**: `$response->assertStatus(200)`, `assertOk()`, `assertCreated()`, `assertNotFound()`, `assertForbidden()`, `assertUnprocessable()`, `assertRedirect()`, etc.
- **JSON**: `$response->assertJson([...])`, `assertExactJson([...])`, or fluent `assertJson(fn (AssertableJson $json) => $json->where(...)->etc())`; `assertJsonValidationErrors(['field'])`, `assertJsonMissingValidationErrors(['field'])`.

## Database assertions

Use in feature tests (with `RefreshDatabase`):

- `$this->assertDatabaseHas('users', ['email' => 'sally@example.com']);`
- `$this->assertDatabaseMissing(...);`
- `$this->assertDatabaseCount('users', 5);`

## Fakes (events, exceptions, storage)

- **Events**: `Event::fake();` then `Event::assertDispatched(OrderShipped::class);` / `assertNotDispatched` / `assertNothingDispatched`. Call `Event::fake()` **after** creating models if factories rely on model events.
- **Exceptions**: `Exceptions::fake();` then `Exceptions::assertReported(InvalidOrderException::class);` / `assertNotReported` / `assertNothingReported`.
- **Storage**: `Storage::fake('disk');` then `Storage::disk('disk')->assertExists('path');` / `assertMissing`; use `UploadedFile::fake()->image('photo.jpg')` for uploads.

## Running tests

All commands run inside the API container:

```bash
# Full suite
docker compose exec api php artisan test

# Or PHPUnit directly
docker compose exec api ./vendor/bin/phpunit

# Single test or filter
docker compose exec api php artisan test --filter=InviteUserTest

# Coverage (needs Xdebug or PCOV)
docker compose exec api php artisan test --coverage

# Minimum coverage threshold (e.g. fail if below 80%)
docker compose exec api php artisan test --coverage --min=80

# Parallel
docker compose exec api php artisan test --parallel

# Recreate test DBs when using parallel
docker compose exec api php artisan test --parallel --recreate-databases
```

Optional: use `.env.testing` in project root; it is used when running PHPUnit/Pest or `artisan --env=testing`.

## setUp / tearDown

If you override `setUp` or `tearDown`, call the parent implementation:

```php
protected function setUp(): void
{
    parent::setUp();
    // ...
}
```

## When not to test

- Trivial getters/setters.
- Framework behavior (e.g. Laravel’s own validation rules).
- Logic already covered by another test layer.

## Quick checklist

When adding or changing tests:

- [ ] File named `*Test.php` in `tests/Feature/` or `tests/Unit/`
- [ ] Feature test extends `Tests\TestCase`; unit test extends `PHPUnit\Framework\TestCase`
- [ ] `RefreshDatabase` on feature tests that use the DB
- [ ] Data from factories where possible
- [ ] Method names like `test_<who>_<can_do_what>` or `test_<what_behavior>`
- [ ] Success and failure paths covered where relevant
- [ ] Run `docker compose exec api ./vendor/bin/php-cs-fixer fix` and test suite after changes
