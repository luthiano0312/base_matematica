<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInterestsRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterestController extends Controller
{
    public function onboarding(UpdateInterestsRequest $request): JsonResponse
    {
        return $this->save($request->user(), $request->input('content_ids', []));
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->interestsOf($request->user()));
    }

    public function update(UpdateInterestsRequest $request): JsonResponse
    {
        return $this->save($request->user(), $request->input('content_ids', []));
    }

    private function save(User $user, array $contentIds): JsonResponse
    {
        $user->interests()->sync(array_values(array_unique(array_map('intval', $contentIds))));

        return response()->json($this->interestsOf($user));
    }

    private function interestsOf(User $user)
    {
        return $user->interests()->orderBy('id')->get();
    }
}
