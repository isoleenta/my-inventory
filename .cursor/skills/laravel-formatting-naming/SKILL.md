---
name: laravel-formatting-naming
description: Apply PSR-12 formatting and Laravel naming conventions to PHP/Laravel code. Use at the end of tasks to check and fix formatting and naming for all changed files, or when the user asks about code style, PHP-CS-Fixer, naming, or PSR-12.
---

# Laravel Formatting & Naming

Apply this skill when completing tasks: **check formatting and naming conventions for all changed files** and fix them using the project tooling below. Use it whenever code style or naming is in scope.

## When to Run

- **End of every task** that touches PHP/Blade files: run the checks in "End-of-task checklist" for all changed files.
- When the user asks to fix style, run PHP-CS-Fixer, or align with naming conventions.
- When creating new classes, routes, migrations, or tests — follow the naming tables so new code is consistent.

## Formatting (PSR-12 + project)

- **Imports:** Use `use` at the top; never use fully qualified class names in the body (`\App\Models\User`, `Illuminate\Support\Facades\Route`, etc.).
- **Quotes:** Single quotes unless string interpolation is needed.
- **Visibility:** Always declare `public`, `private`, or `protected` on methods and properties.
- **Blank lines:** After namespace; after class property block; between methods.
- **Trailing commas:** Avoid in method parameters; allowed in arrays and multiline declarations.

## Naming (summary)

| Element          | Convention           | Example                    |
| ---------------- | -------------------- | -------------------------- |
| Classes          | PascalCase           | `UserController`, `AuthService` |
| Methods          | camelCase            | `handleRequest()`, `createUser()` |
| Variables        | camelCase            | `$userId`, `$authToken`    |
| Constants        | UPPER_SNAKE_CASE     | `MAX_ATTEMPTS`             |
| Migration names  | snake_case + action  | `create_users_table`       |

## Laravel naming (detailed)

| What                    | How                            | Good                          | Bad                                    |
| ----------------------- | ------------------------------ | ----------------------------- | -------------------------------------- |
| Controller              | singular                       | ArticleController             | ArticlesController                     |
| Route                   | plural                         | articles/1                    | article/1                             |
| Route name              | kebab-case, dot notation       | users.show-active             | users.show_active, show_active_users   |
| Model                   | singular                       | User                          | Users                                  |
| hasOne / belongsTo      | singular                       | articleComment                | articleComments, article_comment       |
| Other relationships     | plural                         | articleComments               | articleComment, article_comments       |
| Table                   | plural                         | article_comments              | article_comment, articleComments       |
| Pivot table             | singular model names, alpha    | article_user                  | user_article, articles_users           |
| Table column            | snake_case, no model name      | meta_title                    | MetaTitle; article_meta_title         |
| Model property          | snake_case                     | $model->created_at            | $model->createdAt                      |
| Foreign key             | singular model + _id           | article_id                    | ArticleId, id_article, articles_id     |
| Primary key             | -                              | id                            | custom_id                              |
| Migration               | -                              | 2017_01_01_000000_create_articles_table | 2017_01_01_000000_articles |
| Method                  | camelCase                      | getAll                        | get_all                                |
| Resource controller     | standard names                 | store                         | saveArticle                            |
| Test method             | camelCase                      | testGuestCannotSeeArticle     | test_guest_cannot_see_article          |
| Variable                | camelCase                      | $articlesWithAuthor           | $articles_with_author                  |
| Collection variable     | descriptive, plural            | $activeUsers = User::active()->get() | $active, $data                |
| Object variable         | descriptive, singular          | $activeUser = User::active()->first() | $users, $obj                 |
| Config/lang index       | snake_case                     | articles_enabled              | ArticlesEnabled; articles-enabled      |
| View                    | kebab-case                     | show-filtered.blade.php       | showFiltered.blade.php, show_filtered  |
| Config file             | snake_case                     | google_calendar.php           | googleCalendar.php, google-calendar.php |
| Contract (interface)    | adjective or noun              | AuthenticationInterface       | Authenticatable, IAuthentication       |
| Trait                   | adjective                      | Notifiable                    | NotificationTrait                      |
| Enum                    | singular                       | UserType                      | UserTypes, UserTypeEnum                |
| FormRequest             | singular                       | UpdateUserRequest             | UpdateUserFormRequest, UserRequest     |
| Seeder                  | singular                       | UserSeeder                    | UsersSeeder                            |

## Class docblocks (IDE & static analysis)

Add PHPDoc to classes that use magic properties or dynamic methods so IDEs and PHPStan understand them. **At minimum, annotate Eloquent models** when creating or editing them.

- **`@property Type $name`** — database columns and regular attributes. Use exact types (e.g. `int`, `string`, `Carbon`).
- **`@property-read Type $name`** — accessors (`getXxxAttribute`) and relationships; mark as read-only.
- **`@method static \Illuminate\Database\Eloquent\Builder scopeName(...)`** — custom query scopes so autocomplete and static analysis see them.
- **Nullable:** use `Type|null` (e.g. `Carbon|null`, `Role|null`).
- **Collections of models:** use `Collection|Model[]` (e.g. `Collection|Role[]`).

Example (model with columns, accessor, relationships, scope):

```php
/**
 * @property int $id
 * @property string $email
 * @property Carbon $created_at
 * @property Carbon|null $last_activity_at
 * @property-read string $fullName
 * @property-read Role|null $currentRole
 * @property-read Collection|Role[] $assignedRoles
 *
 * @method static \Illuminate\Database\Eloquent\Builder withClientsCount()
 */
#[ObservedBy(AdminObserver::class)]
class Admin extends Authenticatable
```

When adding or changing model columns, accessors, relationships, or scopes, update the class docblock accordingly.

## Tooling (run in Docker)

All commands run inside the API container:

```bash
# Format code (use at end of task; GrumPHP runs php-cs-fixer on commit)
docker compose exec api ./vendor/bin/php-cs-fixer fix

# Static analysis (optional but recommended after changes)
docker compose exec api ./vendor/bin/phpstan analyse
```

- **PHP-CS-Fixer:** Fixes formatting to match project style (config: `.php-cs-fixer.dist.php`). GrumPHP runs it on commit; for manual run use `php-cs-fixer fix`.
- **PHPStan/Larastan:** Catches type and convention issues; fix any new issues before considering the task done.

## End-of-task checklist

For every task that changes PHP or Blade files:

1. **Run PHP-CS-Fixer** on changed files: `docker compose exec api ./vendor/bin/php-cs-fixer fix`.
2. **Run PHPStan** (if the project uses it): `docker compose exec api ./vendor/bin/phpstan analyse` and fix reported issues.
3. **Review naming** of any new or renamed symbols (classes, methods, routes, tables, variables) against the tables above and adjust if they don’t match.

4. **Models:** ensure class docblocks have `@property` / `@property-read` / `@method` for columns, accessors, relationships, and scopes (see "Class docblocks" above).

Only consider the task complete after formatting and naming have been checked (and fixed) for all changed files.
