<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('dashboard');
});


Route::get('/login', function () {
    return view('auth.login');
});


Route::get('/registro', function () {
    return view('auth.registro');
});


Route::get('/dashboard', function () {
    return view('dashboard');
});


Route::get('/comunidades', function () {
    return view('communities.index');
});


Route::get('/comunidades/crear', function () {
    return view('communities.create');
});


Route::get('/comunidades/{id}', function ($id) {
    return view('communities.show');
});


Route::get('/mis-comunidades', function () {
    return view('my-communities');
});


Route::get('/perfil', function () {
    return view('profile.index');
});