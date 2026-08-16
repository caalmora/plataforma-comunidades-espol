# Ajustes de compatibilidad con el frontend Figma

El frontend ya usa la API REST actual. Estos ajustes son necesarios para que algunas funciones del diseño sean 100% coherentes con la lógica visual.

## 1. El creador de una comunidad debe quedar registrado como miembro

En `app/Http/Controllers/CommunityController.php` agrega:

```php
use App\Models\Membership;
```

En `store()`, después de crear la comunidad:

```php
$membership = Membership::firstOrCreate(
    [
        'user_id' => $request->user()->id,
        'community_id' => $community->id,
    ],
    [
        'joined_at' => now(),
    ]
);
```

Esto permite que el creador aparezca también como miembro en `/api/mis-comunidades` y `/api/comunidades/{id}/miembros`.

## 2. El administrador de la comunidad debe poder gestionar sus publicaciones

En `app/Http/Controllers/PublicationController.php`, en `store()` después de comprobar que existe la comunidad:

```php
if ($community->created_by !== $request->user()->id) {
    return response()->json([
        'mensaje' => 'No tienes permiso para publicar en esta comunidad'
    ], 403);
}
```

En `update()` y `destroy()` carga la publicación con su comunidad:

```php
$publication = Publication::with('community')->find($id);
```

Y reemplaza la comprobación del autor por:

```php
if ($publication->community->created_by !== $request->user()->id) {
    return response()->json([
        'mensaje' => 'No tienes permiso para modificar esta publicación'
    ], 403);
}
```

Para `destroy()` el mensaje puede ser:

```php
if ($publication->community->created_by !== $request->user()->id) {
    return response()->json([
        'mensaje' => 'No tienes permiso para eliminar esta publicación'
    ], 403);
}
```

## 3. Un estudiante debe poder consultar su propia solicitud pendiente

En `JoinRequestController@index()`, conserva el comportamiento para el creador de la comunidad y agrega un caso para el resto:

```php
if ($community->created_by === $request->user()->id) {
    $requests = JoinRequest::with('user')
        ->where('community_id', $communityId)
        ->latest()
        ->get();
} else {
    $requests = JoinRequest::with('user')
        ->where('community_id', $communityId)
        ->where('user_id', $request->user()->id)
        ->latest()
        ->get();
}

return response()->json($requests);
```

Así el frontend puede mostrar «Solicitud de ingreso pendiente» después de recargar la página.

## 4. Funciones del perfil

El diseño tiene edición de perfil, cambio de contraseña y eliminación de cuenta. Para conectarlas al backend se agregan tres rutas protegidas:

```php
Route::patch('/usuario', [AuthController::class, 'updateProfile'])
    ->middleware('auth:sanctum');

Route::patch('/usuario/password', [AuthController::class, 'changePassword'])
    ->middleware('auth:sanctum');

Route::delete('/usuario', [AuthController::class, 'destroyAccount'])
    ->middleware('auth:sanctum');
```

### 4.1 Campo `position`

Crear una migración nueva:

```bash
php artisan make:migration add_position_to_users_table --table=users
```

Contenido recomendado:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('position')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
```

Luego en `User.php` agrega `position` a `$fillable`.

### 4.2 `updateProfile()`

En `AuthController.php`:

```php
public function updateProfile(Request $request)
{
    $user = $request->user();

    $datos = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'position' => 'nullable|string|max:255',
    ]);

    $user->update($datos);

    return response()->json([
        'mensaje' => 'Información actualizada correctamente',
        'usuario' => $user->fresh(),
    ]);
}
```

### 4.3 `changePassword()`

Agrega:

```php
use Illuminate\Support\Facades\Hash;
```

y el método:

```php
public function changePassword(Request $request)
{
    $datos = $request->validate([
        'current_password' => 'required|string',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = $request->user();

    if (!Hash::check($datos['current_password'], $user->password)) {
        return response()->json([
            'mensaje' => 'La contraseña actual es incorrecta'
        ], 422);
    }

    $user->update([
        'password' => Hash::make($datos['password']),
    ]);

    return response()->json([
        'mensaje' => 'Contraseña actualizada correctamente'
    ]);
}
```

### 4.4 `destroyAccount()`

```php
public function destroyAccount(Request $request)
{
    $user = $request->user();
    $user->delete();

    return response()->json([
        'mensaje' => 'Cuenta eliminada correctamente'
    ]);
}
```

Después:

```bash
php artisan migrate
php artisan optimize:clear
php artisan route:list
```

## Nota sobre roles

No se agrega un `role` global de administrador al usuario porque el diseño Figma trabaja con el concepto de administrador **por comunidad**. En el backend actual, el administrador de una comunidad se identifica mediante `communities.created_by`.
