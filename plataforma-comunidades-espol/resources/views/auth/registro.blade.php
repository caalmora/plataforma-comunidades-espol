@extends('layouts.app')

@section('title', 'Registro')

@section('content')

<div class="form-container">

    <div class="card">

        <h1>Crear cuenta</h1>

        <div id="mensaje"></div>

        <form id="registroForm">

            <div class="form-group">

                <label>Nombre</label>

                <input
                    type="text"
                    id="name"
                    required
                >

            </div>

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

            <div class="form-group">

                <label>Confirmar contraseña</label>

                <input
                    type="password"
                    id="password_confirmation"
                    required
                >

            </div>

            <button type="submit">
                Registrarse
            </button>

        </form>

        <p>
            ¿Ya tienes cuenta?
            <a href="/login">Iniciar sesión</a>
        </p>

    </div>

</div>

@endsection

@section('scripts')

<script>

document
    .getElementById('registroForm')
    .addEventListener('submit', async function(event) {

        event.preventDefault();

        const mensaje = document.getElementById('mensaje');

        const response = await fetch('/api/registro', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify({

                name: document.getElementById('name').value,

                email: document.getElementById('email').value,

                password: document.getElementById('password').value,

                password_confirmation:
                    document.getElementById('password_confirmation').value

            })

        });

        const data = await response.json();

        if (response.ok) {

            saveSession(data);

            window.location.href = '/dashboard';

        } else {

            let texto = data.mensaje || 'Error al registrarse';

            if (data.errors) {

                texto = Object.values(data.errors)
                    .flat()
                    .join('<br>');

            }

            mensaje.innerHTML = `
                <div class="alert alert-error">
                    ${texto}
                </div>
            `;

        }

    });

</script>

@endsection