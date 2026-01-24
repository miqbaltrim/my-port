<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');

        $tags = Tag::query()
            ->withCount('projects') // ✅ sesuai relasi model kamu
            ->when($q, function ($qq) use ($q) {
                $qq->where('name', 'ilike', "%{$q}%")
                   ->orWhere('slug', 'ilike', "%{$q}%");
            })
            ->orderBy('name')
            ->paginate(100);

        return TagResource::collection($tags);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140', 'unique:tags,slug'],
        ]);

        $slug = trim($data['slug'] ?? '');
        $slug = $slug !== '' ? Str::slug($slug) : Str::slug($data['name']);

        // kalau slug hasil slugify ternyata sudah kepakai, bikin unik otomatis
        $slug = $this->uniqueSlug($slug);

        $tag = Tag::create([
            'name' => $data['name'],
            'slug' => $slug,
        ]);

        $tag->loadCount('projects');

        return (new TagResource($tag))->response()->setStatusCode(201);
    }

    public function show(Tag $tag)
    {
        $tag->loadCount('projects');
        return new TagResource($tag);
    }

    public function update(Request $request, Tag $tag)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:140',
                Rule::unique('tags', 'slug')->ignore($tag->id),
            ],
        ]);

        // slug kalau dikirim, rapikan + pastikan unik
        if (array_key_exists('slug', $data)) {
            $slug = trim($data['slug'] ?? '');
            $slug = $slug !== '' ? Str::slug($slug) : Str::slug($data['name'] ?? $tag->name);
            $data['slug'] = $this->uniqueSlug($slug, $tag->id);
        }

        $tag->update($data);
        $tag->loadCount('projects');

        return new TagResource($tag);
    }

    public function destroy(Tag $tag)
    {
        // Optional: kalau kamu mau “aman”, detach dulu biar pivot bersih
        $tag->projects()->detach();

        $tag->delete();

        return response()->json(['ok' => true]);
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = $slug;
        $i = 2;

        while (
            Tag::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $i;
            $i++;
        }

        return $slug;
    }
}
