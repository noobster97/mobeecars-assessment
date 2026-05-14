<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncLikesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'likes'              => ['required', 'array', 'min:1', 'max:500'],
            'likes.*.car_id'     => ['required', 'integer', 'exists:cars,id'],
            'likes.*.liked'      => ['required', 'boolean'],
            'likes.*.swiped_at'  => ['required', 'date'],
        ];
    }
}
