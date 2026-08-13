<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>@yield('title', 'Comunidades ESPOL')</title>

    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>

<body>

<header class="navbar">

    <div class="navbar-container">

        <a href="/" class="logo">
            Comunidades ESPOL
        </a>

        <nav>

            <a href="/dashboard">Inicio</a>

            <a href="/comunidades">
                Comunidades
            </a>

            <a href="/mis-comunidades">
                Mis comunidades
            </a>

            <a href="/perfil">
                Mi perfil
            </a>

            <button onclick="logout()" class="btn-logout">
                Cerrar sesión
            </button>

        </nav>

    </div>

</header>

<main class="container">

    @yield('content')

</main>

<script src="{{ asset('js/app.js') }}"></script>

@yield('scripts')

</body>
</html>