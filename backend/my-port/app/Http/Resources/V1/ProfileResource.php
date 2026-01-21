<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if (!$this->resource) return [];

        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'headline' => $this->headline,
            'location' => $this->location,
            'about' => $this->about,
            'photo' => $this->photo ? url('storage/'.$this->photo) : null,
            'cv_url' => $this->cv_url,
            'email' => $this->email,
            'phone' => $this->phone,
        ];
    }
}
