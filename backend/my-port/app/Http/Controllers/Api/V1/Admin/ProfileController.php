<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show()
    {
        $profile = Profile::query()->first();

        // jika belum ada, buat 1 record default biar front-end aman
        if (!$profile) {
            $profile = Profile::create([
                'full_name' => '',
                'headline' => '',
                'location' => '',
                'about' => '',
                'photo' => null,
                'email' => '',
                'phone' => '',
                'cv_url' => '',
            ]);
        }

        return new ProfileResource($profile);
    }

    public function update(Request $request)
    {
        $profile = Profile::query()->firstOrCreate([]);

        $data = $request->validate([
            'full_name' => ['nullable','string','max:120'],
            'headline'  => ['nullable','string','max:160'],
            'location'  => ['nullable','string','max:120'],
            'about'     => ['nullable','string'],

            'photo'     => ['nullable','string','max:190'],

            'email'     => ['nullable','email','max:190'],
            'phone'     => ['nullable','string','max:50'],
            'cv_url'    => ['nullable','url','max:190'],
        ]);

        $profile->update($data);

        return new ProfileResource($profile->fresh());
    }
}
