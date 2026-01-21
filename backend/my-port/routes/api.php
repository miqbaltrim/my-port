<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PublicController;

use App\Http\Controllers\Api\V1\Admin\ProjectController;
use App\Http\Controllers\Api\V1\Admin\SkillController;
use App\Http\Controllers\Api\V1\Admin\ProfileController;

// health
Route::get('/health', fn () => response()->json(['ok' => true]));

// v1
Route::prefix('v1')->group(function () {

    // PUBLIC
    Route::get('/me', [PublicController::class, 'me']);
    Route::get('/projects', [PublicController::class, 'projects']);
    Route::get('/projects/{slug}', [PublicController::class, 'projectShow']);
    Route::get('/skills', [PublicController::class, 'skills']);

    // AUTH
    Route::post('/login', [AuthController::class, 'login']);

    // ADMIN (protected)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::apiResource('/admin/projects', ProjectController::class);
        Route::apiResource('/admin/skills', SkillController::class);

        Route::get('/admin/profile', [ProfileController::class, 'show']);
        Route::put('/admin/profile', [ProfileController::class, 'update']);
    });
});
