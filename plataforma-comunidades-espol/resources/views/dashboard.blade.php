@extends('layouts.app')

@section('title', 'Inicio')

@section('content')

<div class="card">

    <h1>Bienvenido a Comunidades ESPOL</h1>

    <p id="welcome"></p>

</div>

<div class="grid">

    <div class="card">

        <h2>Comunidades</h2>

        <p>
            Explora las comunidades disponibles en ESPOL.
        </p>

        <a href="/comunidades" class="btn">
            Ver comunidades
        </a>

    </div>

    <div class="card">

        <h2>Mis comunidades</h2>

        <p>
            Consulta las comunidades a las que perteneces.
        </p>

        <a href="/mis-comunidades" class="btn">
            Mis comunidades
        </a>

    </div>

    <div class="card">

        <h2>Mi perfil</h2>

        <p>
            Consulta tu información.
        </p>

        <a href="/perfil" class="btn">
            Ver perfil
        </a>

    </div>

</div>

@endsection

@section('scripts')

<script>

requireAuth();

const user = getUser();

if (user) {

    document.getElementById('welcome').innerHTML =
        'Hola, <strong>' + user.name + '</strong>.';

}

</script>

@endsection