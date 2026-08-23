<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudyMaterialRequest;
use App\Http\Requests\UpdateStudyMaterialRequest;
use App\Http\Resources\StudyMaterialResource;
use App\Models\StudyMaterial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudyMaterialController extends Controller
{
    /**
     * Leitura pública (RN01/RF02): a mesma listagem serve o aluno
     * (`GET /api/study-materials`) e o painel admin
     * (`GET /api/admin/study-materials`) — não há dado sensível aqui.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $materials = StudyMaterial::query()
            ->when($request->filled('content_id'), fn ($query) => $query->where('content_id', $request->integer('content_id')))
            ->when($request->filled('topic_id'), fn ($query) => $query->where('topic_id', $request->integer('topic_id')))
            ->latest()
            ->get();

        return StudyMaterialResource::collection($materials);
    }

    public function store(StoreStudyMaterialRequest $request): StudyMaterialResource
    {
        return new StudyMaterialResource(StudyMaterial::create($request->validated()));
    }

    public function show(StudyMaterial $study_material): StudyMaterialResource
    {
        return new StudyMaterialResource($study_material);
    }

    public function update(UpdateStudyMaterialRequest $request, StudyMaterial $study_material): StudyMaterialResource
    {
        $study_material->update($request->validated());

        return new StudyMaterialResource($study_material->fresh());
    }

    // Delete direto: nenhuma FK aponta para study_materials, não há órfãos
    // possíveis (diferente de questions/contents/topics e seus can-delete).
    public function destroy(StudyMaterial $study_material)
    {
        $study_material->delete();

        return response()->noContent();
    }
}
