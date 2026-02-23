<?php

namespace App\Http\Controllers;

use App\Http\Requests\Place\StorePlaceRequest;
use App\Http\Requests\Place\UpdatePlaceRequest;
use App\Models\Place;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Place::class);

        $places = Place::query()
            ->forUser($request->user())
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Place $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'value' => $p->value,
                'sort_order' => $p->sort_order,
            ]);

        return Inertia::render('Places/Index', [
            'places' => $places,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Place::class);

        return Inertia::render('Places/Create');
    }

    public function store(StorePlaceRequest $request): RedirectResponse
    {
        Place::query()->create([
            'user_id' => $request->user()->id,
            'name' => $request->validated('name'),
            'value' => $request->validated('value'),
            'sort_order' => 0,
        ]);

        return redirect()
            ->route('places.index')
            ->with('success', __('Place created successfully.'));
    }

    public function edit(Place $place): Response
    {
        $this->authorize('update', $place);

        return Inertia::render('Places/Edit', [
            'place' => [
                'id' => $place->id,
                'name' => $place->name,
                'value' => $place->value,
                'sort_order' => $place->sort_order,
            ],
        ]);
    }

    public function update(UpdatePlaceRequest $request, Place $place): RedirectResponse
    {
        $place->update($request->only(['name', 'value']));

        return redirect()
            ->route('places.index')
            ->with('success', __('Place updated successfully.'));
    }

    public function destroy(Place $place): RedirectResponse
    {
        $this->authorize('delete', $place);

        $place->delete();

        return redirect()
            ->route('places.index')
            ->with('success', __('Place deleted successfully.'));
    }
}
