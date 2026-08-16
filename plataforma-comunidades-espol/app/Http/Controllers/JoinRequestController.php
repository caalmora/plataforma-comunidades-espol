<?php

namespace App\Http\Controllers;

use App\Models\Community;
use App\Models\JoinRequest;
use App\Models\Membership;
use Illuminate\Http\Request;

class JoinRequestController extends Controller
{
    public function store(Request $request, $communityId)
    {
        $community = Community::find($communityId);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        $user = $request->user();

        // Verificar si ya es miembro
        $member = Membership::where('user_id', $user->id)
            ->where('community_id', $communityId)
            ->exists();

        if ($member) {
            return response()->json([
                'mensaje' => 'Ya eres miembro de esta comunidad'
            ], 409);
        }

        // Verificar si ya tiene una solicitud pendiente
        $pendingRequest = JoinRequest::where('user_id', $user->id)
            ->where('community_id', $communityId)
            ->where('status', 'pending')
            ->exists();

        if ($pendingRequest) {
            return response()->json([
                'mensaje' => 'Ya tienes una solicitud pendiente'
            ], 409);
        }

        $joinRequest = JoinRequest::create([
            'user_id' => $user->id,
            'community_id' => $communityId,
            'status' => 'pending',
        ]);

        return response()->json([
            'mensaje' => 'Solicitud de ingreso enviada correctamente',
            'solicitud' => $joinRequest
        ], 201);
    }


    public function index(Request $request, $communityId)
    {
        $community = Community::find($communityId);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

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
    }


    public function approve(Request $request, $id)
    {
        $joinRequest = JoinRequest::find($id);

        if (!$joinRequest) {
            return response()->json([
                'mensaje' => 'Solicitud no encontrada'
            ], 404);
        }

        $community = Community::find($joinRequest->community_id);

        // Solo el creador puede aprobar
        if ($community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para aprobar esta solicitud'
            ], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json([
                'mensaje' => 'La solicitud ya fue procesada'
            ], 409);
        }

        $joinRequest->update([
            'status' => 'approved'
        ]);

        Membership::create([
            'user_id' => $joinRequest->user_id,
            'community_id' => $joinRequest->community_id,
            'joined_at' => now(),
        ]);

        return response()->json([
            'mensaje' => 'Solicitud aprobada correctamente',
            'solicitud' => $joinRequest
        ]);
    }


    public function reject(Request $request, $id)
    {
        $joinRequest = JoinRequest::find($id);

        if (!$joinRequest) {
            return response()->json([
                'mensaje' => 'Solicitud no encontrada'
            ], 404);
        }

        $community = Community::find($joinRequest->community_id);

        // Solo el creador puede rechazar
        if ($community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para rechazar esta solicitud'
            ], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json([
                'mensaje' => 'La solicitud ya fue procesada'
            ], 409);
        }

        $joinRequest->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'mensaje' => 'Solicitud rechazada correctamente',
            'solicitud' => $joinRequest
        ]);
    }
}