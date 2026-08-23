<?php

namespace App\Http\Requests;

/**
 * Update é "full-replace" (PUT): o corpo da requisição deve conter o
 * estado completo desejado do material (title, content, content_id,
 * topic_id, video_url), não um patch parcial. Por isso reaproveita as
 * mesmas regras do Store.
 */
class UpdateStudyMaterialRequest extends StoreStudyMaterialRequest
{
    //
}
