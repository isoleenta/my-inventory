<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeleteProfileRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ProfileService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService
    ) {}

    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user('web_user') instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $this->profileService->updateProfile($request->user('web_user'), $request->validated());

        return redirect()->route('profile.edit');
    }

    public function destroy(DeleteProfileRequest $request): RedirectResponse
    {
        $this->profileService->deleteAccount($request->user('web_user'));

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
