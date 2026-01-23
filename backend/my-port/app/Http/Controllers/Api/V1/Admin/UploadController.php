<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class UploadController extends Controller
{
    /**
     * POST /api/v1/admin/uploads/project-image
     * form-data: file=<image>
     */
    public function projectImage(Request $request)
    {
        // Validasi ketat: image only
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120', // KB => 5MB
            ],
        ]);

        $file = $validated['file'];

        // Aman: folder fixed (hindari user input)
        $dir = 'projects';

        // Nama file aman + unik
        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = Str::uuid()->toString() . '.' . $ext;

        // Simpan di disk public
        $path = $file->storeAs($dir, $filename, 'public'); // projects/uuid.png

        // URL dari storage (lebih konsisten)
        $absoluteUrl = asset('storage/' . $path);

        return response()->json([
        'path' => $path,
        'url'  => $absoluteUrl,
        'mime' => $file->getMimeType(),
        'size' => $file->getSize(),
        ], 201);

    }
}
