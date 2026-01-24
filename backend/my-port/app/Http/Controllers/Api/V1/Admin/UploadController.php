<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function projectImage(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required','image','mimes:jpg,jpeg,png,webp,gif','max:5120'],
        ]);

        $file = $validated['file'];

        $dir = 'projects';
        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = (string) Str::uuid() . '.' . $ext;

        // simpan ke storage/app/public/projects/xxx.jpg
        $path = $file->storeAs($dir, $filename, 'public'); // projects/xxx.jpg

        // ✅ ini biasanya tidak merah di IDE (jelas)
        $url = asset('storage/' . $path); // http://127.0.0.1:8000/storage/projects/xxx.jpg

        return response()->json([
            'path' => $path,
            'url'  => $url,
        ], 201);
    }
}
