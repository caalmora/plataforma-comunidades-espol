@extends('layouts.app')

@section('title', 'Crear comunidad')

@section('content')

<div class="form-container">

    <div class="card">

        <h1>Crear comunidad</h1>

        <div id="mensaje"></div>

        <form id="communityForm">

            <div class="form-group">

                <label>Nombre</label>

                <input
                    type="text"
                    id="name"
                    required
                >

            </div>

            <div class="form-group">

                <label>Descripción</label>

                <textarea
                    id="description"
                    required
                ></textarea>

            </div>

            <div class="form-group">

                <label>Categoría</label>

                <input
                    type="text"
                    id="category"
                    required
                >

            </div>

            <div class="form-group">

                <label>Logo</label>

                <input
                    type="text"
                    id="logo"
                    placeholder="programacion.png"
                >

            </div>

            <button type="submit">
                Crear comunidad
            </button>

        </form>

    </div>

</div>

@endsection

@section('scripts')

<script>

requireAuth();

document
    .getElementById('communityForm')
    .addEventListener('submit', async function(event) {

        event.preventDefault();

        const response = await fetch('/api/comunidades', {

            method: 'POST',

            headers: authHeaders(),

            body: JSON.stringify({

                name:
                    document.getElementById('name').value,

                description:
                    document.getElementById('description').value,

                category:
                    document.getElementById('category').value,

                logo:
                    document.getElementById('logo').value || null

            })

        });

        const data = await response.json();

        const mensaje =
            document.getElementById('mensaje');

        if (response.ok) {

            mensaje.innerHTML = `
                <div class="alert alert-success">
                    Comunidad creada correctamente.
                </div>
            `;

            setTimeout(() => {

                window.location.href =
                    '/comunidades';

            }, 1000);

        } else {

            mensaje.innerHTML = `
                <div class="alert alert-error">
                    ${data.mensaje || 'Error al crear comunidad'}
                </div>
            `;

        }

    });

</script>

@endsection