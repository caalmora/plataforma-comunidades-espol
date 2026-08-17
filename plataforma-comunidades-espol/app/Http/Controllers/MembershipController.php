<?php

namespace App\Http\Controllers;

use App\Models\Community;
use App\Models\Membership;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function index($communityId)
    {
        $community = Community::find($communityId);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        $members = Membership::with('user')
            ->where('community_id', $communityId)
            ->get();

        return response()->json($members);
    }

    public function myCommunities(Request $request)
    {
        $memberships = Membership::with('community')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($memberships);
    }

    public function leave(Request $request, $communityId)
    {
        $community = Community::find($communityId);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        if ($community->created_by === $request->user()->id) {
            return response()->json([
                'mensaje' => 'El creador no puede abandonar su propia comunidad'
            ], 403);
        }

        $membership = Membership::where('user_id', $request->user()->id)
            ->where('community_id', $communityId)
            ->first();

        if (!$membership) {
            return response()->json([
                'mensaje' => 'No eres miembro de esta comunidad'
            ], 409);
        }

        $membership->delete();

        return response()->json([
            'mensaje' => 'Has salido de la comunidad correctamente'
        ]);
    }
}