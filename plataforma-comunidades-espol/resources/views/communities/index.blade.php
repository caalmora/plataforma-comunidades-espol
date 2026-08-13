@extends('layouts.app')

@section('title', 'Comunidades')

@section('content')

<div class="card">

    <h1>Comunidades ESPOL</h1>

    <a href="/comunidades/crear" class="btn">
        Crear comunidad
    </a>

</div>

<div id="mensaje"></div>

<div id="communities" class="grid">

    <p>Cargando comunidades...</p>

</div>

@endsection

@section('scripts')

<script>

requireAuth();

async function cargarComunidades() {

    const response = await fetch('/api/comunidades', {
        headers: authHeaders()
    });

    const data = await response.json();

    const container =
        document.getElementById('communities');

    if (!response.ok) {

        container.innerHTML = `
            <div class="alert alert-error">
                No se pudieron cargar las comunidades.
            </div>
        `;

        return;
    }

    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No existen comunidades todavía.
            </div>
        `;

        return;
    }

    container.innerHTML = '';

    data.forEach(community => {

        container.innerHTML += `

            <div class="card">

                <h2 class="community-title">
                    ${community.name}
                </h2>

                <p>
                    ${community.description}
                </p>

                <p>
                    <strong>Categoría:</strong>
                    ${community.category}
                </p>

                <a
                    href="/comunidades/${community.id}"
                    class="btn"
                >
                    Ver comunidad
                </a>

            </div>

        `;

    });

}

cargarComunidades();

</script>

@endsection