<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContentRequest;
use App\Http\Requests\UpdateContentRequest;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Content::query()->orderBy('id')->get());
    }

    public function store(StoreContentRequest $request): JsonResponse
    {
        $content = Content::create($request->validated());

        return response()->json($content, 201);
    }

    public function show(Content $content): JsonResponse
    {
        return response()->json($content);
    }

    public function update(UpdateContentRequest $request, Content $content): JsonResponse
    {
        $content->update($request->validated());

        return response()->json($content);
    }

    public function destroy(Content $content): JsonResponse
    {
        $content->delete();

        return response()->json(null, 204);
    }
}
