<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProjectResource;
use App\Http\Resources\V1\SkillResource;
use App\Http\Resources\V1\ProfileResource;

use App\Models\Project;
use App\Models\Skill;
use App\Models\Profile;

class PublicController extends Controller
{
    public function me()
    {
        $profile = Profile::query()->latest('id')->first();
        return new ProfileResource($profile);
    }

    public function projects()
    {
        $projects = Project::query()
            ->where('status', 'published')
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->paginate(9);

        return ProjectResource::collection($projects);
    }

    public function projectShow(string $slug)
    {
        $project = Project::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return new ProjectResource($project);
    }

    public function skills()
    {
        $skills = Skill::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return SkillResource::collection($skills);
    }
}
