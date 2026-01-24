<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\Admin\DbInspectorController;


use App\Http\Controllers\Api\V1\Admin\ProjectController;
use App\Http\Controllers\Api\V1\Admin\SkillController;
use App\Http\Controllers\Api\V1\Admin\ProfileController;
use App\Http\Controllers\Api\V1\Admin\TagController;
use App\Http\Controllers\Api\V1\Admin\UploadController;

// health
Route::get('/health', fn () => response()->json(['ok' => true]));

// v1
Route::prefix('v1')->group(function () {

    // PUBLIC
    Route::get('me', [PublicController::class, 'me']);
    Route::get('projects', [PublicController::class, 'projects']);
    Route::get('projects/{slug}', [PublicController::class, 'projectShow']);
    Route::get('skills', [PublicController::class, 'skills']);

    // AUTH
    Route::post('login', [AuthController::class, 'login']);

    // ADMIN (protected)
    Route::middleware(['auth:sanctum', 'throttle:30,1'])->prefix('admin')->group(function () {

        // DB Inspector
        Route::get('db/objects', [DbInspectorController::class, 'objects']);
        Route::post('db/inspect', [DbInspectorController::class, 'inspect']);

        Route::post('logout', [AuthController::class, 'logout']);

        // CRUD resources
        Route::apiResource('projects', ProjectController::class);
        Route::apiResource('skills', SkillController::class);

        // Singleton profile (1 data saja)
        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);

        Route::get('tags', [TagController::class, 'index']);
        Route::apiResource('skills', SkillController::class);
        Route::apiResource('tags', TagController::class);
        
        Route::post('/uploads/project-image', [UploadController::class, 'projectImage']);
        

    });
});
