@extends('layouts.app')

@section('title', 'Iniciar sesión')

@section('content')

<div class="form-container">

    <div class="card">

        <h1>Iniciar sesión</h1>

        <div id="mensaje"></div>

        <form id="loginForm">

            <div class="form-group">

                <label>Correo electrónico</label>

                <input
                    type="email"
                    id="email"
                    required
                >

            </div>

            <div class="form-group">

                <label>Contraseña</label>

                <input
                    type="password"
                    id="password"
                    required
                >

            </div>

            <button type="submit">
                Iniciar sesión
            </button>

        </form>

        <p>
            ¿No tienes cuenta?
            <a href="/registro">Registrarse</a>
        </p>

    </div>

</div>

@endsection

@section('scripts')

<script>

document
    .getElementById('loginForm')
    .addEventListener('submit', async function(event) {

        event.preventDefault();

        const mensaje = document.getElementById('mensaje');

        const response = await fetch('/api/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify({

                email: document.getElementById('email').value,

                password: document.getElementById('password').value

            })

        });

        const data = await response.json();

        if (response.ok) {

            saveSession(data);

            window.location.href = '/dashboard';

        } else {

            mensaje.innerHTML = `
                <div class="alert alert-error">
                    ${data.mensaje || 'Datos incorrectos'}
                </div>
            `;

        }

    });

</script>

@endsection