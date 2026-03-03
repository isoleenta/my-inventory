<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaceRequest;
use App\Http\Requests\UpdatePlaceRequest;
use App\Models\Place;
use App\Services\PlaceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaceController extends Controller
{
    public function __construct(
        private readonly PlaceService $placeService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user('web_user');
        $places = $this->placeService->listForUserWithItemCount($user);

        return Inertia::render('Places/Index', [
            'places' => $places,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Places/Create');
    }

    public function store(StorePlaceRequest $request): RedirectResponse
    {
        $user = $request->user('web_user');
        $this->placeService->create($user, $request->toDTO());

        return redirect()->route('places.index')->with('success', __('Place created.'));
    }

    public function edit(Request $request, Place $place): Response
    {
        return Inertia::render('Places/Edit', [
            'place' => $place,
        ]);
    }

    public function update(UpdatePlaceRequest $request, Place $place): RedirectResponse
    {
        $this->placeService->update($place, $request->toDTO());

        return redirect()->route('places.index')->with('success', __('Place updated.'));
    }

    public function destroy(Place $place): RedirectResponse
    {
        $this->placeService->delete($place);

        return redirect()->route('places.index')->with('success', __('Place deleted.'));
    }
}
