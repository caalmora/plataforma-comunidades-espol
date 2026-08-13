@extends('layouts.app')

@section('title', 'Mis comunidades')

@section('content')

<div class="card">

    <h1>Mis comunidades</h1>

</div>

<div id="communities" class="grid">

    Cargando...

</div>

@endsection

@section('scripts')

<script>

requireAuth();

async function cargarMisComunidades() {

    const response = await fetch(
        '/api/mis-comunidades',
        {
            headers: authHeaders()
        }
    );

    const data = await response.json();

    const container =
        document.getElementById('communities');

    if (!response.ok) {

        container.innerHTML = `
            <div class="alert alert-error">
                No se pudieron cargar tus comunidades.
            </div>
        `;

        return;
    }

    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Todavía no perteneces a ninguna comunidad.
            </div>
        `;

        return;
    }

    container.innerHTML = '';

    data.forEach(membership => {

        const community = membership.community;

        container.innerHTML += `

            <div class="card">

                <h2>
                    ${community.name}
                </h2>

                <p>
                    ${community.description}
                </p>

                <a
                    href="/comunidades/${community.id}"
                    class="btn"
                >
                    Entrar
                </a>

            </div>

        `;

    });

}

cargarMisComunidades();

</script>

@endsection