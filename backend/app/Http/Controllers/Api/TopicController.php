<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Topic::query()->orderBy('id')->get());
    }

    public function store(StoreTopicRequest $request): JsonResponse
    {
        $topic = Topic::create($request->validated());

        return response()->json($topic, 201);
    }

    public function show(Topic $topic): JsonResponse
    {
        return response()->json($topic);
    }

    public function update(UpdateTopicRequest $request, Topic $topic): JsonResponse
    {
        $topic->update($request->validated());

        return response()->json($topic);
    }

    public function destroy(Topic $topic): JsonResponse
    {
        $topic->delete();

        return response()->json(null, 204);
    }
}
