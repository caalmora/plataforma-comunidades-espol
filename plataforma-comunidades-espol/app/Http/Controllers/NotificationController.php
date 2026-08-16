<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'mensaje' => 'Notificación no encontrada'
            ], 404);
        }

        if ($notification->user_id !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para modificar esta notificación'
            ], 403);
        }

        if (!$notification->read_at) {
            $notification->update([
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'mensaje' => 'Notificación marcada como leída',
            'notificacion' => $notification,
        ]);
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'mensaje' => 'Todas las notificaciones fueron marcadas como leídas'
        ]);
    }
}
