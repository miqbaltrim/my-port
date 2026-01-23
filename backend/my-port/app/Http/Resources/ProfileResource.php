<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'full_name' => $this->full_name,
            'headline'  => $this->headline,
            'location'  => $this->location,
            'about'     => $this->about,
            'email'     => $this->email,
            'phone'     => $this->phone,
            'cv_url'    => $this->cv_url,
            'created_at'=> $this->created_at,
            'updated_at'=> $this->updated_at,
        ];
    }
}
