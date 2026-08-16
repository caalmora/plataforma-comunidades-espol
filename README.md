# Plataforma Web para la Gestión de Comunidades ESPOL

Aplicación web para centralizar la información de las comunidades estudiantiles de ESPOL: consultar comunidades, ver sus publicaciones, unirse a ellas y administrar todo desde un solo lugar.

Proyecto de la asignatura **Lenguajes de Programación**.

## Integrantes

- Camila Alejandra Morán Chipantiza
- Josué Adrián Guerrero Murillo

## Problemática

Las comunidades estudiantiles de ESPOL usan medios dispersos (WhatsApp, Instagram, Facebook, correo) para comunicar sus actividades, lo que dificulta que los estudiantes conozcan las comunidades existentes y sus publicaciones. Esta plataforma centraliza esa información en una sola aplicación web.

## Funcionalidades

- Registro, inicio de sesión y cierre de sesión de usuarios (Laravel Sanctum).
- Registro, edición, eliminación y consulta de comunidades.
- Publicación y consulta de anuncios dentro de cada comunidad.
- Solicitudes de ingreso a una comunidad, con aprobación o rechazo por parte del creador.
- Creación automática de membresía al aprobar una solicitud.
- Consulta de los integrantes de una comunidad.
- Consulta de las comunidades a las que pertenece el usuario autenticado.

## Arquitectura y tecnologías

- **Patrón:** MVC
- **Backend:** PHP 8.3 + Laravel 13, Eloquent ORM, Laravel Sanctum (autenticación por tokens)
- **Base de datos:** MySQL (SQLite soportado para desarrollo local)
- **Frontend:** Blade + HTML + CSS + JavaScript (fetch a la API interna)
- **API:** REST interna en formato JSON

## Estructura del repositorio

El código de la aplicación Laravel se encuentra en la carpeta [`plataforma-comunidades-espol/`](plataforma-comunidades-espol/).

```
plataforma-comunidades-espol/
├── app/Http/Controllers/   # AuthController, CommunityController, PublicationController, JoinRequestController, MembershipController
├── app/Models/              # User, Community, Publication, JoinRequest, Membership
├── database/migrations/     # Esquema de la base de datos
├── resources/views/         # Vistas Blade (login, registro, dashboard, comunidades, etc.)
├── routes/api.php           # Rutas de la API REST
└── routes/web.php           # Rutas de las vistas
```

## Instalación y ejecución local

```bash
cd plataforma-comunidades-espol

# 1. Instalar dependencias de PHP
composer install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Base de datos
# Opción rápida con SQLite (valor por defecto en .env.example):
touch database/database.sqlite
php artisan migrate

# Opción MySQL: edita DB_CONNECTION, DB_HOST, DB_DATABASE, DB_USERNAME
# y DB_PASSWORD en .env, y luego ejecuta:
# php artisan migrate

# 4. (Opcional) Datos de prueba
php artisan db:seed

# 5. Levantar el servidor
php artisan serve
```

La aplicación quedará disponible en `http://127.0.0.1:8000`.

## Endpoints principales de la API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/registro` | Registrar usuario |
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/usuario` | Consultar usuario autenticado |
| GET | `/api/comunidades` | Listar comunidades |
| POST | `/api/comunidades` | Crear comunidad |
| GET | `/api/comunidades/{id}` | Consultar comunidad |
| PATCH | `/api/comunidades/{id}` | Actualizar comunidad |
| DELETE | `/api/comunidades/{id}` | Eliminar comunidad |
| GET | `/api/comunidades/{id}/publicaciones` | Listar publicaciones |
| POST | `/api/comunidades/{id}/publicaciones` | Crear publicación |
| GET | `/api/publicaciones/{id}` | Consultar publicación |
| PATCH | `/api/publicaciones/{id}` | Actualizar publicación |
| DELETE | `/api/publicaciones/{id}` | Eliminar publicación |
| POST | `/api/comunidades/{id}/solicitudes` | Solicitar ingreso |
| GET | `/api/comunidades/{id}/solicitudes` | Consultar solicitudes |
| PATCH | `/api/solicitudes/{id}/aprobar` | Aprobar solicitud |
| PATCH | `/api/solicitudes/{id}/rechazar` | Rechazar solicitud |
| GET | `/api/comunidades/{id}/miembros` | Consultar miembros |
| GET | `/api/mis-comunidades` | Consultar comunidades del usuario |

## Pruebas

Las funcionalidades del backend se probaron manualmente con Postman, cubriendo registro, login, CRUD de comunidades y publicaciones, solicitudes de ingreso (incluyendo validación de duplicados) y aprobación/rechazo con creación de membresía.
