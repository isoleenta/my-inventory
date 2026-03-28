<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ItemControllerTest extends TestCase
{
    use RefreshDatabase;

    private function fakeImageUpload(string $filename): UploadedFile
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        $contents = match ($extension) {
            'gif' => base64_decode('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', true),
            default => base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4//8/AwAI/AL+X2VINwAAAABJRU5ErkJggg==', true),
        };

        return UploadedFile::fake()->createWithContent($filename, $contents ?: '');
    }

    private function createUser(): User
    {
        return User::create([
            'name' => 'Test User',
            'email' => 'items@example.com',
            'password' => 'password',
        ]);
    }

    /**
     * @return array{response: string}
     */
    private function ollamaResponse(string $title, ?int $categoryId): array
    {
        return [
            'response' => json_encode([
                'cleaned_title' => $title,
                'category_id' => $categoryId,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];
    }

    public function test_user_can_store_item_with_uah_price_converted_to_usd(): void
    {
        config()->set('services.nbu.fallback_usd_to_uah_rate', 40.0);

        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Electronics', 'fields' => []]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.store'), [
                'title' => 'Monitor',
                'description' => '27 inch',
                'category_id' => $category->id,
                'place_id' => $place->id,
                'price' => '4000',
                'price_currency' => 'UAH',
            ]);

        $response->assertRedirect(route('inventory.show', ['place' => $place->id]));

        $this->assertDatabaseHas('items', [
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $category->id,
            'title' => 'Monitor',
            'price' => '100.00',
        ]);
    }

    public function test_user_can_store_item_with_purchased_on(): void
    {
        Storage::fake('public');

        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.store'), [
                'title' => 'Notebook',
                'place_id' => $place->id,
                'purchased_on' => '2026-03-10',
                'photos' => [
                    $this->fakeImageUpload('first.png'),
                    $this->fakeImageUpload('second.gif'),
                ],
                'photo_order' => ['new:1', 'new:0'],
            ]);

        $response->assertRedirect(route('inventory.show', ['place' => $place->id]));

        $item = Item::query()->where('user_id', $user->id)->where('title', 'Notebook')->firstOrFail();
        $item->load('photos');

        $this->assertSame('2026-03-10', $item->purchased_on?->format('Y-m-d'));
        $this->assertCount(2, $item->photos);
        $this->assertStringEndsWith('.gif', $item->photos[0]->path);
        $this->assertStringEndsWith('.png', $item->photos[1]->path);
    }

    public function test_user_can_regenerate_item_title_and_category_with_ollama(): void
    {
        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);
        $currentCategory = Category::create(['user_id' => $user->id, 'name' => 'Misc', 'fields' => []]);
        $matchedCategory = Category::create(['user_id' => $user->id, 'name' => 'Audio', 'fields' => []]);
        $item = Item::create([
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $currentCategory->id,
            'title' => 'Wireless Earbuds Bluetooth 5.3 Super Bass',
            'description' => 'Imported from marketplace',
            'price' => '12.34',
            'purchased_on' => '2026-02-22',
            'details' => [],
        ]);

        Http::fake([
            rtrim((string) config('services.ollama.base_url'), '/').'/api/generate' => Http::response(
                $this->ollamaResponse('Wireless Bluetooth Earbuds', $matchedCategory->id),
                200
            ),
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.regenerate', $item));

        $response->assertRedirect(route('items.show', $item));
        $response->assertSessionHas('success', 'Title and category regenerated.');

        $item->refresh();

        $this->assertSame('Wireless Bluetooth Earbuds', $item->title);
        $this->assertSame($matchedCategory->id, $item->category_id);
        $this->assertSame($place->id, $item->place_id);
        $this->assertSame('Imported from marketplace', $item->description);
        $this->assertSame('12.34', (string) $item->price);
        $this->assertSame('2026-02-22', $item->purchased_on?->format('Y-m-d'));
    }

    public function test_user_can_update_item_purchased_on_and_photo_order(): void
    {
        Storage::fake('public');

        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Misc', 'fields' => []]);
        $item = Item::create([
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $category->id,
            'title' => 'Camera',
            'description' => 'Old description',
            'price' => '10.00',
            'details' => [],
        ]);

        Storage::disk('public')->put('items/'.$item->id.'/old-a.jpg', 'old-a');
        Storage::disk('public')->put('items/'.$item->id.'/old-b.jpg', 'old-b');

        $firstPhoto = $item->photos()->create([
            'path' => 'items/'.$item->id.'/old-a.jpg',
            'order' => 0,
        ]);
        $secondPhoto = $item->photos()->create([
            'path' => 'items/'.$item->id.'/old-b.jpg',
            'order' => 1,
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.update', $item), [
                '_method' => 'PUT',
                'title' => 'Camera',
                'description' => 'Old description',
                'category_id' => $category->id,
                'place_id' => $place->id,
                'price' => '10.00',
                'price_currency' => 'USD',
                'purchased_on' => '2026-03-11',
                'photos' => [
                    $this->fakeImageUpload('fresh.png'),
                ],
                'photo_order' => ['new:0', 'existing:'.$secondPhoto->id],
                'removed_photo_ids' => [$firstPhoto->id],
            ]);

        $response->assertRedirect(route('inventory.show', ['place' => $place->id]));

        $item->refresh();
        $item->load('photos');

        $this->assertSame('2026-03-11', $item->purchased_on?->format('Y-m-d'));
        $this->assertCount(2, $item->photos);
        $this->assertStringEndsWith('.png', $item->photos[0]->path);
        $this->assertSame($secondPhoto->id, $item->photos[1]->id);
        $this->assertDatabaseMissing('item_photos', ['id' => $firstPhoto->id]);
        Storage::disk('public')->assertMissing('items/'.$item->id.'/old-a.jpg');
    }

    public function test_regenerate_shows_error_when_ollama_returns_error_status(): void
    {
        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Misc', 'fields' => []]);
        $item = Item::create([
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $category->id,
            'title' => 'Original Title',
            'description' => null,
            'price' => null,
            'details' => [],
        ]);

        Http::fake([
            rtrim((string) config('services.ollama.base_url'), '/').'/api/generate' => Http::response('', 503),
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.regenerate', $item));

        $response->assertRedirect(route('items.show', $item));
        $response->assertSessionHas('error');

        $item->refresh();

        $this->assertSame('Original Title', $item->title);
    }

    public function test_regenerate_parses_json_wrapped_in_markdown_fence(): void
    {
        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Misc', 'fields' => []]);
        $matchedCategory = Category::create(['user_id' => $user->id, 'name' => 'Audio', 'fields' => []]);
        $item = Item::create([
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $category->id,
            'title' => 'Wireless Earbuds Bluetooth',
            'description' => null,
            'price' => null,
            'details' => [],
        ]);

        $inner = json_encode([
            'cleaned_title' => 'Wireless Earbuds',
            'category_id' => $matchedCategory->id,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        Http::fake([
            rtrim((string) config('services.ollama.base_url'), '/').'/api/generate' => Http::response(
                ['response' => "```json\n".$inner."\n```"],
                200
            ),
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.regenerate', $item));

        $response->assertRedirect(route('items.show', $item));
        $response->assertSessionHas('success', 'Title and category regenerated.');

        $item->refresh();

        $this->assertSame('Wireless Earbuds', $item->title);
        $this->assertSame($matchedCategory->id, $item->category_id);
    }
}
