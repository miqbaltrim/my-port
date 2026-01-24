<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index()
    {
        $q = request('q');

        $skills = Skill::query()
            ->when($q, fn($qq) => $qq->where('name', 'ilike', "%{$q}%"))
            ->orderBy('sort_order')
            ->orderByDesc('proficiency')
            ->paginate(50);

        return SkillResource::collection($skills);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:80'],
            'proficiency' => ['required', 'integer', 'min:0', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $skill = Skill::create([
            'name' => $data['name'],
            'category' => $data['category'] ?? null,
            'proficiency' => (int) $data['proficiency'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ]);

        return (new SkillResource($skill))->response()->setStatusCode(201);
    }

    public function show(Skill $skill)
    {
        return new SkillResource($skill);
    }

    public function update(Request $request, Skill $skill)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'category' => ['sometimes', 'nullable', 'string', 'max:80'],
            'proficiency' => ['sometimes', 'required', 'integer', 'min:0', 'max:100'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ]);

        $skill->update($data);

        return new SkillResource($skill);
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();

        return response()->json(['ok' => true]);
    }
}
