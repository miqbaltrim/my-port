<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'full_name',
        'headline',
        'location',
        'about',
        'photo',
        'cv_url',
        'email',
        'phone',
    ];
}
