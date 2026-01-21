<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Profile;
use App\Models\Tag;
use App\Models\Skill;
use App\Models\Project;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        Profile::query()->delete();

        Profile::create([
            'full_name' => 'Iqbal',
            'headline' => 'Fullstack Developer (Laravel + React)',
            'location' => 'Indonesia',
            'about' => 'Saya membangun aplikasi web modern menggunakan Laravel, React, dan PostgreSQL.',
            'email' => 'admin@myport.com',
        ]);

        $tags = collect(['Laravel', 'React', 'PostgreSQL', 'Tailwind'])->map(function ($name) {
            return Tag::firstOrCreate([
                'slug' => \Illuminate\Support\Str::slug($name)
            ], [
                'name' => $name,
            ]);
        });

        Skill::query()->delete();
        Skill::insert([
            ['name' => 'Laravel', 'category' => 'Backend', 'proficiency' => 85, 'sort_order' => 1, 'created_at'=>now(),'updated_at'=>now()],
            ['name' => 'React', 'category' => 'Frontend', 'proficiency' => 80, 'sort_order' => 2, 'created_at'=>now(),'updated_at'=>now()],
            ['name' => 'PostgreSQL', 'category' => 'Database', 'proficiency' => 75, 'sort_order' => 3, 'created_at'=>now(),'updated_at'=>now()],
        ]);

        Project::query()->delete();

        $p = Project::create([
            'title' => 'Portfolio Website',
            'slug' => 'portfolio-website',
            'excerpt' => 'Portfolio modern dengan Laravel API + React.',
            'content' => 'Project contoh: API Laravel, React frontend, dan PostgreSQL.',
            'status' => 'published',
            'is_featured' => true,
            'published_at' => now(),
            'seo_title' => 'Portfolio Website',
            'seo_description' => 'Contoh portfolio modern menggunakan Laravel + React + PostgreSQL.',
        ]);

        $p->tags()->sync($tags->take(3)->pluck('id')->all());
    }
}
