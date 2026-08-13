@extends('layouts.app')

@section('title', 'Comunidad')

@section('content')

<div id="community"></div>

<div id="publications"></div>

<div id="members"></div>

<div id="requests"></div>

@endsection

@section('scripts')

<script>

requireAuth();

const communityId =
    window.location.pathname.split('/').pop();

async function cargarComunidad() {

    const response = await fetch(
        '/api/comunidades/' + communityId,
        {
            headers: authHeaders()
        }
    );

    const community = await response.json();

    if (!response.ok) {

        document.getElementById('community').innerHTML = `
            <div class="alert alert-error">
                ${community.mensaje}
            </div>
        `;

        return;
    }

    document.getElementById('community').innerHTML = `

        <div class="card">

            <h1>${community.name}</h1>

            <p>${community.description}</p>

            <p>
                <strong>Categoría:</strong>
                ${community.category}
            </p>

            <button onclick="solicitarIngreso()">
                Solicitar ingreso
            </button>

        </div>

    `;

}

async function cargarPublicaciones() {

    const response = await fetch(
        '/api/comunidades/' +
        communityId +
        '/publicaciones',
        {
            headers: authHeaders()
        }
    );

    const publications = await response.json();

    let html = `
        <div class="card">
            <h2>Publicaciones</h2>

            <button onclick="mostrarFormulario()">
                Nueva publicación
            </button>

            <div id="formPublication"></div>
    `;

    if (publications.length === 0) {

        html += `
            <p class="empty">
                No hay publicaciones.
            </p>
        `;

    } else {

        publications.forEach(publication => {

            html += `

                <div class="publication">

                    <h3>
                        ${publication.title}
                    </h3>

                    <p>
                        ${publication.content}
                    </p>

                    <small>
                        Publicado por:
                        ${publication.user.name}
                    </small>

                </div>

            `;

        });

    }

    html += `</div>`;

    document.getElementById('publications').innerHTML =
        html;
}

function mostrarFormulario() {

    document.getElementById('formPublication').innerHTML = `

        <div class="card">

            <h3>Nueva publicación</h3>

            <input
                id="publicationTitle"
                placeholder="Título"
            >

            <br><br>

            <textarea
                id="publicationContent"
                placeholder="Contenido"
            ></textarea>

            <br><br>

            <button onclick="crearPublicacion()">
                Publicar
            </button>

        </div>

    `;

}

async function crearPublicacion() {

    const response = await fetch(
        '/api/comunidades/' +
        communityId +
        '/publicaciones',
        {
            method: 'POST',

            headers: authHeaders(),

            body: JSON.stringify({

                title:
                    document.getElementById(
                        'publicationTitle'
                    ).value,

                content:
                    document.getElementById(
                        'publicationContent'
                    ).value

            })
        }
    );

    const data = await response.json();

    if (response.ok) {

        alert(
            'Publicación creada correctamente'
        );

        cargarPublicaciones();

    } else {

        alert(
            data.mensaje ||
            'No se pudo crear la publicación'
        );

    }

}

async function solicitarIngreso() {

    const response = await fetch(
        '/api/comunidades/' +
        communityId +
        '/solicitudes',
        {
            method: 'POST',
            headers: authHeaders()
        }
    );

    const data = await response.json();

    alert(data.mensaje);

}

async function cargarMiembros() {

    const response = await fetch(
        '/api/comunidades/' +
        communityId +
        '/miembros',
        {
            headers: authHeaders()
        }
    );

    const members = await response.json();

    let html = `
        <div class="card">
            <h2>Miembros</h2>
    `;

    if (members.length === 0) {

        html += `
            <p class="empty">
                No hay miembros.
            </p>
        `;

    } else {

        members.forEach(member => {

            html += `
                <div class="member">
                    ${member.user.name}
                </div>
            `;

        });

    }

    html += `</div>`;

    document.getElementById('members').innerHTML =
        html;

}

cargarComunidad();
cargarPublicaciones();
cargarMiembros();

</script>

@endsection