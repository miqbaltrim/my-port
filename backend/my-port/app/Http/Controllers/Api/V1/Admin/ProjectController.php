<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreProjectRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProjectRequest;
use App\Http\Resources\V1\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('projects/thumbnails', 'public');
        }

        $project = Project::create($data);

        if (isset($data['tag_ids'])) {
            $project->tags()->sync($data['tag_ids']);
        }

        return (new ProjectResource($project->load(['tags','images'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Project $project)
    {
        return new ProjectResource($project->load(['tags','images']));
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        if (isset($data['title']) && !isset($data['slug'])) {
            // optional: auto-update slug kalau user ganti title tanpa slug
            $data['slug'] = Str::slug($data['title']);
        }

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('projects/thumbnails', 'public');
        }

        $project->update($data);

        if (array_key_exists('tag_ids', $data)) {
            $project->tags()->sync($data['tag_ids'] ?? []);
        }

        return new ProjectResource($project->load(['tags','images']));
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }
}
