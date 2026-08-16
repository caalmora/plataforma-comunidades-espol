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

- **Patrón:** MVC (backend) + SPA desacoplada (frontend)
- **Backend:** PHP 8.4 + Laravel 13, Eloquent ORM, Laravel Sanctum (autenticación por tokens)
- **Base de datos:** MySQL (SQLite soportado para desarrollo local)
- **Frontend:** React 18 + Vite + Tailwind CSS, consumiendo la API mediante `fetch`
- **API:** REST interna en formato JSON

## Estructura del repositorio

```
plataforma-comunidades-espol/                     # Backend Laravel
├── app/Http/Controllers/   # AuthController, CommunityController, PublicationController, JoinRequestController, MembershipController
├── app/Models/              # User, Community, Publication, JoinRequest, Membership
├── database/migrations/     # Esquema de la base de datos
├── routes/api.php           # Rutas de la API REST
└── routes/web.php           # Ruta raíz (responde JSON de estado)

plataforma-comunidades-espol-frontend/frontend_js/ # Frontend React
├── src/app/App.jsx          # Componentes y vistas de la aplicación
├── src/app/api.js           # Cliente fetch hacia la API de Laravel
├── src/styles/               # Tailwind + tokens de tema (theme.css)
└── vite.config.js
```

## Instalación y ejecución local

Se necesitan **dos servidores corriendo en paralelo** (backend y frontend), cada uno en su propia terminal.

### 1. Backend (Laravel API)

```bash
cd plataforma-comunidades-espol

# Instalar dependencias de PHP
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Base de datos
# Opción rápida con SQLite (valor por defecto en .env.example):
touch database/database.sqlite
php artisan migrate

# Opción MySQL: edita DB_CONNECTION, DB_HOST, DB_DATABASE, DB_USERNAME
# y DB_PASSWORD en .env, y luego ejecuta:
# php artisan migrate

# (Opcional) Datos de prueba
php artisan db:seed

# Levantar el servidor
php artisan serve
```

El backend queda disponible en `http://127.0.0.1:8000` (la API vive bajo `http://127.0.0.1:8000/api`).

### 2. Frontend (React + Vite)

En otra terminal:

```bash
cd plataforma-comunidades-espol-frontend/frontend_js

# Instalar dependencias de Node
npm install

# Configurar la URL de la API (por defecto apunta al backend local)
cp .env.example .env

# Levantar el servidor de desarrollo
npm run dev
```

El frontend queda disponible en `http://127.0.0.1:5173` — es ahí donde se navega la aplicación (login, comunidades, publicaciones, etc.). Requiere que el backend esté corriendo simultáneamente.

**Requisitos:** PHP 8.4 con extensión `xml` habilitada, Composer, Node.js (con npm), y MySQL si no se usa SQLite.

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
