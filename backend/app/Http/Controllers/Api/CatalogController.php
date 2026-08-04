<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function contents(): JsonResponse
    {
        return response()->json(Content::query()->orderBy('id')->get());
    }

    public function topics(Request $request): JsonResponse
    {
        return response()->json(
            Topic::query()
                ->when($request->filled('content_id'), fn ($q) => $q->where('content_id', $request->integer('content_id')))
                ->orderBy('id')
                ->get()
        );
    }
}
