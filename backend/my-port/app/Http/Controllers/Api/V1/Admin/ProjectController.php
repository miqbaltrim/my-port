<?php

namespace App\Http\Controllers\Api\V1\Admin;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Project;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreProjectRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProjectRequest;
use App\Http\Resources\V1\ProjectResource;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::query()
            ->with(['tags','images'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return ProjectResource::collection($projects);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $data = $request->validate([
            'title' => ['required','string','max:190'],
            'excerpt' => ['nullable','string','max:255'],
            'content' => ['nullable','string'],
            'thumbnail' => ['nullable','string','max:190'],
            'demo_url' => ['nullable','string','max:190'],
            'repo_url' => ['nullable','string','max:190'],
            'seo_title' => ['nullable','string','max:190'],
            'seo_description' => ['nullable','string','max:255'],
            'status' => ['required','in:draft,published'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer'],

            // relation
            'tags' => ['array'],
            'tags.*' => ['integer','exists:tags,id'],

            'images' => ['array'],
            'images.*.image_path' => ['required','string','max:190'],
            'images.*.caption' => ['nullable','string','max:190'],
            'images.*.sort_order' => ['nullable','integer'],
        ]);

        return DB::transaction(function () use ($data) {
            $projectData = $data;
            unset($projectData['tags'], $projectData['images']);

            // slug otomatis
            $projectData['slug'] = Str::slug($projectData['title']);
            // published_at otomatis jika published
            if (($projectData['status'] ?? 'draft') === 'published') {
                $projectData['published_at'] = now();
            } else {
                $projectData['published_at'] = null;
            }

            $project = Project::create($projectData);

            // pivot tags
            if (!empty($data['tags'])) {
                $project->tags()->sync($data['tags']);
            }

            // images
            if (!empty($data['images'])) {
                $imgs = array_map(function ($img, $i) {
                    return [
                        'image_path' => $img['image_path'],
                        'caption' => $img['caption'] ?? null,
                        'sort_order' => $img['sort_order'] ?? $i,
                    ];
                }, $data['images'], array_keys($data['images']));

                $project->images()->createMany($imgs);
            }

            return response()->json([
                'data' => $project->load(['tags','images']),
            ], 201);
        });
    }

    public function show(Project $project)
    {
        return new ProjectResource($project->load(['tags','images']));
    }

    public function update(\Illuminate\Http\Request $request, Project $project)
    {
        $data = $request->validate([
            'title' => ['sometimes','required','string','max:190'],
            'excerpt' => ['nullable','string','max:255'],
            'content' => ['nullable','string'],
            'thumbnail' => ['nullable','string','max:190'],
            'demo_url' => ['nullable','string','max:190'],
            'repo_url' => ['nullable','string','max:190'],
            'seo_title' => ['nullable','string','max:190'],
            'seo_description' => ['nullable','string','max:255'],
            'status' => ['sometimes','required','in:draft,published'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer'],

            'tags' => ['array'],
            'tags.*' => ['integer','exists:tags,id'],

            'images' => ['array'],
            'images.*.image_path' => ['required','string','max:190'],
            'images.*.caption' => ['nullable','string','max:190'],
            'images.*.sort_order' => ['nullable','integer'],
        ]);

        return DB::transaction(function () use ($data, $project) {
            $projectData = $data;
            $hasTags = array_key_exists('tags', $data);
            $hasImages = array_key_exists('images', $data);

            unset($projectData['tags'], $projectData['images']);

            if (isset($projectData['title'])) {
                $projectData['slug'] = Str::slug($projectData['title']);
            }

            if (isset($projectData['status'])) {
                $projectData['published_at'] = $projectData['status'] === 'published' ? now() : null;
            }

            $project->update($projectData);

            if ($hasTags) {
                $project->tags()->sync($data['tags'] ?? []);
            }

            // cara simpel & aman: replace images
            if ($hasImages) {
                $project->images()->delete();

                $imgs = array_map(function ($img, $i) {
                    return [
                        'image_path' => $img['image_path'],
                        'caption' => $img['caption'] ?? null,
                        'sort_order' => $img['sort_order'] ?? $i,
                    ];
                }, $data['images'] ?? [], array_keys($data['images'] ?? []));

                if ($imgs) $project->images()->createMany($imgs);
            }

            return response()->json([
                'data' => $project->fresh()->load(['tags','images']),
            ]);
        });
    }
}
