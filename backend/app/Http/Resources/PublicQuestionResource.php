<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class PublicQuestionResource extends QuestionResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        unset($data['video_resolution_url']);

        return $data;
    }
}
