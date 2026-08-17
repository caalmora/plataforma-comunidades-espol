<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\JoinRequestController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::post('/registro', [AuthController::class, 'registro']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/usuario', [AuthController::class, 'usuario'])
    ->middleware('auth:sanctum');

Route::patch('/usuario', [AuthController::class, 'updateProfile'])
    ->middleware('auth:sanctum');

Route::patch('/usuario/password', [AuthController::class, 'changePassword'])
    ->middleware('auth:sanctum');

Route::delete('/usuario', [AuthController::class, 'destroyAccount'])
    ->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/comunidades', [CommunityController::class, 'index']);

    Route::post('/comunidades', [CommunityController::class, 'store']);

    Route::get('/comunidades/{id}', [CommunityController::class, 'show']);

    Route::patch('/comunidades/{id}', [CommunityController::class, 'update']);

    Route::delete('/comunidades/{id}', [CommunityController::class, 'destroy']);


    Route::get(
        '/comunidades/{communityId}/publicaciones',
        [PublicationController::class, 'index']
    );

    Route::post(
        '/comunidades/{communityId}/publicaciones',
        [PublicationController::class, 'store']
    );

    Route::get(
        '/publicaciones/{id}',
        [PublicationController::class, 'show']
    );

    Route::patch(
        '/publicaciones/{id}',
        [PublicationController::class, 'update']
    );

    Route::delete(
        '/publicaciones/{id}',
        [PublicationController::class, 'destroy']
    );

    Route::post(
    '/comunidades/{communityId}/solicitudes',
    [JoinRequestController::class, 'store']
    );

    Route::get(
        '/comunidades/{communityId}/solicitudes',
        [JoinRequestController::class, 'index']
    );

    Route::patch(
        '/solicitudes/{id}/aprobar',
        [JoinRequestController::class, 'approve']
    );

    Route::patch(
        '/solicitudes/{id}/rechazar',
        [JoinRequestController::class, 'reject']
    );

    Route::get(
    '/comunidades/{communityId}/miembros',
    [MembershipController::class, 'index']
    );

    Route::get(
        '/mis-comunidades',
        [MembershipController::class, 'myCommunities']
    );

    Route::delete(
        '/comunidades/{communityId}/salir',
        [MembershipController::class, 'leave']
    );

    Route::get(
        '/publicaciones/{publicationId}/comentarios',
        [CommentController::class, 'index']
    );

    Route::post(
        '/publicaciones/{publicationId}/comentarios',
        [CommentController::class, 'store']
    );

    Route::patch(
        '/comentarios/{id}',
        [CommentController::class, 'update']
    );

    Route::delete(
        '/comentarios/{id}',
        [CommentController::class, 'destroy']
    );

    Route::get(
        '/notificaciones',
        [NotificationController::class, 'index']
    );

    Route::get(
        '/notificaciones/conteo',
        [NotificationController::class, 'unreadCount']
    );

    Route::patch(
        '/notificaciones/{id}/leer',
        [NotificationController::class, 'markRead']
    );

    Route::patch(
        '/notificaciones/leer-todas',
        [NotificationController::class, 'markAllRead']
    );
});