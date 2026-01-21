<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255','unique:projects,slug'],
            'excerpt' => ['nullable','string','max:280'],
            'content' => ['nullable','string'],

            'demo_url' => ['nullable','url','max:255'],
            'repo_url' => ['nullable','url','max:255'],

            'is_featured' => ['nullable','boolean'],
            'sort_order' => ['nullable','integer','min:0'],

            'status' => ['required','in:draft,published'],
            'published_at' => ['nullable','date'],

            'seo_title' => ['nullable','string','max:255'],
            'seo_description' => ['nullable','string','max:300'],

            'tag_ids' => ['nullable','array'],
            'tag_ids.*' => ['integer','exists:tags,id'],

            'thumbnail' => ['nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
        ];
    }
}
