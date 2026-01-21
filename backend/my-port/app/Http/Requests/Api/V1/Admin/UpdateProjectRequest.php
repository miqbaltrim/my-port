<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $projectId = $this->route('project')?->id ?? null;

        return [
            'title' => ['sometimes','required','string','max:255'],
            'slug' => ['sometimes','nullable','string','max:255',"unique:projects,slug,{$projectId}"],
            'excerpt' => ['sometimes','nullable','string','max:280'],
            'content' => ['sometimes','nullable','string'],

            'demo_url' => ['sometimes','nullable','url','max:255'],
            'repo_url' => ['sometimes','nullable','url','max:255'],

            'is_featured' => ['sometimes','nullable','boolean'],
            'sort_order' => ['sometimes','nullable','integer','min:0'],

            'status' => ['sometimes','required','in:draft,published'],
            'published_at' => ['sometimes','nullable','date'],

            'seo_title' => ['sometimes','nullable','string','max:255'],
            'seo_description' => ['sometimes','nullable','string','max:300'],

            'tag_ids' => ['sometimes','nullable','array'],
            'tag_ids.*' => ['integer','exists:tags,id'],

            'thumbnail' => ['sometimes','nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
        ];
    }
}
