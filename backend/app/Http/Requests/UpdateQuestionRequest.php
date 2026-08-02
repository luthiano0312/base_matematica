<?php

namespace App\Http\Requests;

/**
 * Update é "full-replace" (PUT): o corpo da requisição deve conter o
 * estado completo desejado da questão (statement, options, content_ids,
 * topic_ids etc.), não um patch parcial. Por isso reaproveita as mesmas
 * regras do Store.
 */
class UpdateQuestionRequest extends StoreQuestionRequest
{
    //
}
