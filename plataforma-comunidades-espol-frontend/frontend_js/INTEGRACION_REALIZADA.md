# Integración realizada

## Se mantiene el diseño

Se tomó como base el frontend de `Plataforma Web ESPOL Diseño(6).zip`.

Se conservaron la estructura visual, navegación, tarjetas, formularios, colores, componentes y distribución general.

## Se eliminó

Se eliminó por completo:

**Acceso rápido (demostración)**

También se eliminaron los usuarios y datos de demostración utilizados por esa sección.

## Se conectó con Laravel

Las operaciones principales ahora llaman a la API REST mediante `fetch`:

- Registro y login.
- Logout y usuario autenticado.
- Comunidades.
- Publicaciones.
- Solicitudes.
- Aprobación y rechazo.
- Miembros.
- Mis comunidades.
- Eliminación de comunidades/publicaciones.
- Edición de comunidades/publicaciones.

El token de Sanctum se guarda localmente para las peticiones protegidas.

## Lenguajes del proyecto

- Backend: PHP + Laravel + API REST interna.
- Frontend: JavaScript + React.

No se agregaron frameworks de backend distintos a Laravel.

## URL de la API

Por defecto:

`http://127.0.0.1:8000/api`

Puede cambiarse mediante:

`VITE_API_URL`

## Importante

El archivo `BACKEND_CAMBIOS_REQUERIDOS.md` contiene los pequeños ajustes recomendados al backend para que el comportamiento del frontend coincida completamente con el diseño, especialmente:

- registrar al creador como miembro de su comunidad;
- permitir al administrador de la comunidad gestionar publicaciones;
- permitir consultar la propia solicitud pendiente;
- habilitar edición de perfil, cambio de contraseña y eliminación de cuenta.
