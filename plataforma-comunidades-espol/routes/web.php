<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'mensaje' => 'API de Plataforma de Comunidades ESPOL',
    ]);
});
