<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ItemControllerTest extends TestCase
{
    use RefreshDatabase;

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
            'details' => ['_purchased_on' => '2026-02-22'],
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
        $this->assertSame('2026-02-22', $item->details['_purchased_on'] ?? null);
    }
}
