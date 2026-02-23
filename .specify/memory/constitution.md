# Department PHP & Laravel Constitution

Unified coding style for all PHP projects in our department. Based on PSR-12, Laravel conventions, and team experience.

---

## 1. General Principles

- Follow [**PSR-12**](https://www.php-fig.org/psr/psr-12/) as the base standard.
- Adhere to [**Laravel conventions**](https://github.com/alexeymezenin/laravel-best-practices?tab=readme-ov-file#contents) where applicable.
- Prioritize **readability over cleverness**.
- Maintain one class per file, with one responsibility per class.
- Avoid unnecessary abstraction or overengineering.

---

## 2. Project Structure

- **Use Laravel defaults** unless there's a compelling reason not to.
- Group features by domain when possible (`app/Services/User`, `app/Http/Controllers/Auth`).
- Use the **Controller → Service → Repository** layering for data flows.
- Utilize `Http/Requests`, `Http/Resources`, `Services`, `Repositories`, `Jobs`, `Enums`, `DTOs`, `Traits` as needed.

---

## 3. Laravel-Specific Practices

- Follow the **Controller → Service → Repository** pattern:
  - Controllers handle HTTP: validate input, call services, return responses.
  - Services contain business logic and orchestrate repositories.
  - Repositories are the **only** place for Eloquent or raw SQL queries.
- **Never** write Eloquent or SQL queries in controllers, services, jobs, or views — always go through a repository.
- Use **Form Requests** for validation (`StoreUserRequest`, `UpdateUserRequest`).
- Use **Spatie DTO** to transfer data from requests to services. Add a `toDTO()` method on the request to parse validated data into a DTO. Skip creating a DTO when the request has only one parameter — pass that value directly.
- Add a `getFillable()` method on DTOs (or create/update data objects) that returns the array of attributes used for create/update operations in repositories. Repositories should call `getFillable()` when performing `create()` or `update()`.
- Implement **Resources** for response transformation.
- Keep controllers lean — move logic to **Services**, **Jobs**, or **Actions**.
- Use Eloquent accessors / mutators instead of raw logic in views or controllers.
- Prefer dependency injection over facades in services.
- Implement authorization through policies, not inline checks like `if ($user->id === ...)`.

---

## 4. Formatting

- Use **single quotes** unless string interpolation is needed.
- Always **declare visibility** on methods (`public`, `private`, `protected`).
- Add a blank line:
  - After namespace declarations
  - After class property declarations
  - Between methods
- Avoid trailing commas in method parameters (but they are allowed in arrays and multiline declarations).

---

## 5. Function & Method Rules

- Keep methods **short and single-purpose**.
- Use **type hints** everywhere: parameters, return types, and properties (PHP 7.4+ or 8+).
- Apply `final` to classes and methods when appropriate (especially in services).
- Handle `null` cases defensively where needed.

---

## 6. Naming Conventions

| Element   | Convention        | Example                 |
| --------- | ----------------- | ----------------------- |
| Classes   | PascalCase        | `UserController`, `AuthService` |
| Methods   | camelCase         | `handleRequest()`, `createUser()` |
| Variables | camelCase         | `$userId`, `$authToken` |
| Constants | UPPER_SNAKE_CASE  | `MAX_ATTEMPTS`          |
| Migration names | snake_case + action | `create_users_table` |

---

## 7. Testing

- Name files consistently: `UserServiceTest.php`, `AuthControllerTest.php`.
- Use **Feature** tests for endpoints, **Unit** tests for isolated logic.
- Structure tests using the **Given-When-Then** pattern where appropriate.
- Use factories, seeders, faker, laravel best practices for test data instead of manual model creation.

---

## 8. Tooling & Linters

Run code through:

- **PHP-CS-Fixer** (config available)
- **PHPStan** or **Larastan** for static analysis
- Optional: **Pint** (Laravel's opinionated formatter)

Install Pint:

```bash
docker compose exec api composer require laravel/pint --dev
```

Run Pint:

```bash
docker compose exec api ./vendor/bin/pint
```

---

## 9. Avoid

- Eloquent or SQL queries outside repositories (controllers, services, jobs, views).
- `dd()` / `dump()` in production code
- Unused imports and dead code
- Excessive use of static methods (except for helpers)
- Complex logic in Blade views (simple conditions are acceptable)
- Using `Request::all()` — validate inputs explicitly
- Using `Model::all()` when querying data — always filter or paginate results
- Writing logic inside controllers, inline in routes

---

## 10. Single Responsibility Principle

A class should have only one responsibility.

**Bad:**

```php
public function update(Request $request): string
{
    $validated = $request->validate([
        'title' => 'required|max:255',
        'events' => 'required|array:date,type'
    ]);

    foreach ($request->events as $event) {
        $date = $this->carbon->parse($event['date'])->toString();
        $this->logger->log('Update event ' . $date . ' :: ' . $event['type']);
    }

    $this->event->updateGeneralEvent($request->validated());

    return back();
}
```

**Good:**

```php
public function update(UpdateRequest $request): string
{
    $this->logService->logEvents($request->events);

    $this->event->updateGeneralEvent($request->validated());

    return back();
}
```

---

## 11. Methods Should Do Just One Thing

A function should do just one thing and do it well.

**Bad:**

```php
public function getFullNameAttribute(): string
{
    if (auth()->user() && auth()->user()->hasRole('client') && auth()->user()->isVerified()) {
        return 'Mr. ' . $this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name;
    } else {
        return $this->first_name[0] . '. ' . $this->last_name;
    }
}
```

**Good:**

```php
public function getFullNameAttribute(): string
{
    return $this->isVerifiedClient() ? $this->getFullNameLong() : $this->getFullNameShort();
}

public function isVerifiedClient(): bool
{
    return auth()->user() && auth()->user()->hasRole('client') && auth()->user()->isVerified();
}

public function getFullNameLong(): string
{
    return 'Mr. ' . $this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name;
}

public function getFullNameShort(): string
{
    return $this->first_name[0] . '. ' . $this->last_name;
}
```

---

## 12. Fat Models, Skinny Controllers

Put all DB related logic into Eloquent models.

**Bad:**

```php
public function index()
{
    $clients = Client::verified()
        ->with(['orders' => function ($q) {
            $q->where('created_at', '>', Carbon::today()->subWeek());
        }])
        ->get();

    return view('index', ['clients' => $clients]);
}
```

**Good:**

```php
public function index()
{
    return view('index', ['clients' => $this->client->getWithNewOrders()]);
}

class Client extends Model
{
    public function getWithNewOrders(): Collection
    {
        return $this->verified()
            ->with(['orders' => function ($q) {
                $q->where('created_at', '>', Carbon::today()->subWeek());
            }])
            ->get();
    }
}
```

---

## 13. Validation

Move validation from controllers to Request classes.

**Bad:**

```php
public function store(Request $request)
{
    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
        'publish_at' => 'nullable|date',
    ]);

    ...
}
```

**Good:**

```php
public function store(PostRequest $request)
{
    ...
}

class PostRequest extends Request
{
    public function rules(): array
    {
        return [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
            'publish_at' => 'nullable|date',
        ];
    }
}
```

---

## 14. Business Logic in Service Class

A controller must have only one responsibility; move business logic to service classes.

**Bad:**

```php
public function store(Request $request)
{
    if ($request->hasFile('image')) {
        $request->file('image')->move(public_path('images') . 'temp');
    }

    ...
}
```

**Good:**

```php
public function store(Request $request)
{
    $this->articleService->handleUploadedImage($request->file('image'));

    ...
}

class ArticleService
{
    public function handleUploadedImage($image): void
    {
        if (!is_null($image)) {
            $image->move(public_path('images') . 'temp');
        }
    }
}
```

---

## 15. Don't Repeat Yourself (DRY)

Reuse code when you can. SRP helps avoid duplication. Reuse Blade templates, use Eloquent scopes, etc.

**Bad:**

```php
public function getActive()
{
    return $this->where('verified', 1)->whereNotNull('deleted_at')->get();
}

public function getArticles()
{
    return $this->whereHas('user', function ($q) {
            $q->where('verified', 1)->whereNotNull('deleted_at');
        })->get();
}
```

**Good:**

```php
public function scopeActive($q)
{
    return $q->where('verified', true)->whereNotNull('deleted_at');
}

public function getActive(): Collection
{
    return $this->active()->get();
}

public function getArticles(): Collection
{
    return $this->whereHas('user', function ($q) {
            $q->active();
        })->get();
}
```

---

## 16. Prefer Eloquent and Collections

Use Eloquent over Query Builder and raw SQL; prefer collections over arrays. Eloquent provides readable code, soft deletes, events, scopes, etc.

**Bad:** Raw SQL with nested EXISTS.

**Good:**

```php
Article::has('user.profile')->verified()->latest()->get();
```

---

## 17. Mass Assignment

**Bad:**

```php
$article = new Article;
$article->title = $request->title;
$article->content = $request->content;
$article->verified = $request->verified;
$article->category_id = $category->id;
$article->save();
```

**Good:**

```php
$category->article()->create($request->validated());
```

---

## 18. Eager Loading (N + 1 Problem)

Do not run queries in Blade templates; use eager loading.

**Bad** (e.g. 100 users → 101 queries):

```blade
@foreach (User::all() as $user)
    {{ $user->profile->name }}
@endforeach
```

**Good** (e.g. 100 users → 2 queries):

```php
$users = User::with('profile')->get();
```

```blade
@foreach ($users as $user)
    {{ $user->profile->name }}
@endforeach
```

---

## 19. Chunk Data for Data-Heavy Tasks

**Bad:**

```php
$users = $this->get();
foreach ($users as $user) {
    ...
}
```

**Good:**

```php
$this->chunk(500, function ($users) {
    foreach ($users as $user) {
        ...
    }
});
```

---

## 20. Descriptive Names Over Comments

Prefer descriptive method and variable names over comments.

**Bad:**

```php
// Determine if there are any joins
if (count((array) $builder->getQuery()->joins) > 0)
```

**Good:**

```php
if ($this->hasJoins())
```

---

## 21. No JS/CSS in Blade, No HTML in PHP

Do not put JS and CSS in Blade templates or HTML in PHP classes. Prefer `@json()` and `data-*` attributes or a dedicated PHP-to-JS package.

**Bad:**

```blade
let article = `{{ json_encode($article) }}`;
```

**Better:**

```blade
<input id="article" type="hidden" value='@json($article)'>
<button class="js-fav-article" data-article='@json($article)'>{{ $article->name }}</button>
```

---

## 22. Config and Language Files

Use config and language files and constants instead of literal text in code.

**Bad:**

```php
return $article->type === 'normal';
return back()->with('message', 'Your article has been added!');
```

**Good:**

```php
return $article->type === Article::TYPE_NORMAL;
return back()->with('message', __('app.article_added'));
```

---

## 23. Standard Laravel Tools

Prefer built-in Laravel functionality and community-accepted packages over third-party tools.

| Task | Standard tools | 3rd party tools |
|------|----------------|-----------------|
| Authorization | Policies | Entrust, Sentinel and other packages |
| Compiling assets | Laravel Mix, Vite | Grunt, Gulp, 3rd party packages |
| Development Environment | Laravel Sail, Homestead | Docker |
| Deployment | Laravel Forge | Deployer and other solutions |
| Unit testing | PHPUnit, Mockery | Phpspec, Pest |
| Browser testing | Laravel Dusk | Codeception |
| DB | Eloquent | SQL, Doctrine |
| Templates | Blade | Twig |
| Working with data | Laravel collections | Arrays |
| Form validation | Request classes | 3rd party packages, validation in controller |
| Authentication | Built-in | 3rd party packages, your own solution |
| API authentication | Laravel Passport, Laravel Sanctum | 3rd party JWT and OAuth packages |
| Creating API | Built-in | Dingo API and similar packages |
| Working with DB structure | Migrations | Working with DB structure directly |
| Localization | Built-in | 3rd party packages |
| Realtime user interfaces | Laravel Echo, Pusher | 3rd party packages and WebSockets directly |
| Generating testing data | Seeder classes, Model Factories, Faker | Creating testing data manually |
| Task scheduling | Laravel Task Scheduler | Scripts and 3rd party packages |
| DB | MySQL, PostgreSQL, SQLite, SQL Server | MongoDB |

---

## 24. Laravel Naming Conventions (Detailed)

Follow PSR and Laravel naming conventions:

| What | How | Good | Bad |
|------|-----|------|-----|
| Controller | singular | ArticleController | ArticlesController |
| Route | plural | articles/1 | article/1 |
| Route name | snake_case with dot notation | users.show_active | users.show-active, show-active-users |
| Model | singular | User | Users |
| hasOne or belongsTo | singular | articleComment | articleComments, article_comment |
| Other relationships | plural | articleComments | articleComment, article_comments |
| Table | plural | article_comments | article_comment, articleComments |
| Pivot table | singular model names, alphabetical | article_user | user_article, articles_users |
| Table column | snake_case without model name | meta_title | MetaTitle; article_meta_title |
| Model property | snake_case | $model->created_at | $model->createdAt |
| Foreign key | singular model + _id | article_id | ArticleId, id_article, articles_id |
| Primary key | - | id | custom_id |
| Migration | - | 2017_01_01_000000_create_articles_table | 2017_01_01_000000_articles |
| Method | camelCase | getAll | get_all |
| Resource controller method | table | store | saveArticle |
| Test method | camelCase | testGuestCannotSeeArticle | test_guest_cannot_see_article |
| Variable | camelCase | $articlesWithAuthor | $articles_with_author |
| Collection | descriptive, plural | $activeUsers = User::active()->get() | $active, $data |
| Object | descriptive, singular | $activeUser = User::active()->first() | $users, $obj |
| Config/lang index | snake_case | articles_enabled | ArticlesEnabled; articles-enabled |
| View | kebab-case | show-filtered.blade.php | showFiltered.blade.php, show_filtered.blade.php |
| Config file | snake_case | google_calendar.php | googleCalendar.php, google-calendar.php |
| Contract (interface) | adjective or noun | AuthenticationInterface | Authenticatable, IAuthentication |
| Trait | adjective | Notifiable | NotificationTrait |
| Enum | singular | UserType | UserTypes, UserTypeEnum |
| FormRequest | singular | UpdateUserRequest | UpdateUserFormRequest, UserFormRequest, UserRequest |
| Seeder | singular | UserSeeder | UsersSeeder |

---

## 25. Convention Over Configuration

Follow Laravel conventions so you rarely need extra configuration.

**Bad:** Explicit table name, primary key, timestamps, pivot table names when they match conventions.

**Good:** Rely on defaults (e.g. table `customers`, primary key `id`, `belongsToMany(Role::class)`).

---

## 26. Shorter Readable Syntax

Prefer shorter Laravel helpers and syntax where possible.

| Common syntax | Shorter |
|---------------|---------|
| $request->session()->get('cart'), $request->input('name') | session('cart'), $request->name |
| return Redirect::back() | return back() |
| is_null($object->relation) ? null : $object->relation->id | optional($object->relation)->id or $object->relation?->id |
| return view('index')->with('title', $title)->with('client', $client) | return view('index', compact('title', 'client')) |
| Carbon::now(), Carbon::today() | now(), today() |
| App::make('Class') | app('Class') |
| ->where('column', '=', 1) | ->where('column', 1) |
| ->orderBy('created_at', 'desc') | ->latest() |
| ->orderBy('created_at', 'asc') | ->oldest() |
| ->first()->name | ->value('name') |

---

## 27. IoC / Service Container

Use the container or constructor injection instead of `new Class` to avoid tight coupling and simplify testing.

**Bad:**

```php
$user = new User;
$user->create($request->validated());
```

**Good:**

```php
public function __construct(protected User $user) {}
...
$this->user->create($request->validated());
```

---

## 28. Do Not Read .env Directly

Use config files and the `config()` helper instead of `env()` in application code.

**Bad:** `$apiKey = env('API_KEY');`

**Good:** Define `'key' => env('API_KEY')` in `config/api.php`, then use `config('api.key')`.

---

## 29. Store Dates in Standard Format

Store and pass dates as Carbon instances; use `$casts` for datetime columns. Format only in the display layer (e.g. Blade).

**Bad:** Formatting or parsing date strings in controllers/helpers.

**Good:** `protected $casts = ['ordered_at' => 'datetime'];` in the model, then `{{ $object->ordered_at->format('m-d') }}` in the view.

---

## 30. Do Not Use DocBlocks

Prefer descriptive method names and type hints over DocBlocks.

**Bad:** Long `@param` / `@return` DocBlock for a simple method.

**Good:** `public function isValidAsciiString(string $string): bool`

---

## 31. Other Good Practices

- Avoid patterns and tools that are alien to Laravel (e.g. RoR, Django). Prefer Laravel or use Symfony/Spring if that style fits better.
- **Never** put logic in route files.
- Minimize vanilla PHP in Blade templates.
- Use in-memory DB for testing.
- Do not override core framework behavior unnecessarily (complicates upgrades).
- Use modern PHP syntax while keeping readability.
- Avoid View Composers and similar unless necessary; prefer simpler solutions.

---

## 32. Infrastructure

**All commands must be run inside the Docker container:**

```bash
docker compose exec api <command>
```

Examples: `composer`, `artisan`, `php`, `pint`, `phpunit`, etc.

---
