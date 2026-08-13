@extends('layouts.app')

@section('title', 'Mi perfil')

@section('content')

<div class="card">

    <h1>Mi perfil</h1>

    <div id="profile">
        Cargando...
    </div>

</div>

@endsection

@section('scripts')

<script>

requireAuth();

const user = getUser();

if (user) {

    document.getElementById('profile').innerHTML = `

        <p>
            <strong>Nombre:</strong>
            ${user.name}
        </p>

        <p>
            <strong>Correo:</strong>
            ${user.email}
        </p>

        <p>
            <strong>Rol:</strong>
            ${user.role}
        </p>

    `;

}

</script>

@endsection