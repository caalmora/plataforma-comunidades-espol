<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registro(Request $request)
    {
        $datos = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $usuario = User::create([
            'name' => $datos['name'],
            'email' => $datos['email'],
            'password' => Hash::make($datos['password']),
            'role' => 'estudiante',
        ]);

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Usuario registrado correctamente',
            'usuario' => $usuario,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $datos = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = User::where('email', $datos['email'])->first();

        if (!$usuario || !Hash::check($datos['password'], $usuario->password)) {
            return response()->json([
                'mensaje' => 'Credenciales incorrectas'
            ], 401);
        }

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Inicio de sesión exitoso',
            'usuario' => $usuario,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente'
        ]);
    }

    public function usuario(Request $request)
    {
        return response()->json([
            'usuario' => $request->user()
        ]);
    }

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

        public function destroyAccount(Request $request)
    {
        $user = $request->user();

        $user->delete();

        return response()->json([
            'mensaje' => 'Cuenta eliminada correctamente'
        ]);
    }

}