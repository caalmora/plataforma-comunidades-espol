<?php

namespace App\Http\Controllers;

use App\Models\Community;
use App\Models\Membership;
use App\Models\Notification;
use Illuminate\Http\Request;


class CommunityController extends Controller
{
    public function index()
    {
        $communities = Community::with('creator')->get();

        return response()->json($communities);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'logo' => 'nullable|string|max:255',
        ]);

        $community = Community::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'logo' => $request->logo,
            'created_by' => $request->user()->id,
        ]);
        
        Membership::firstOrCreate(
        [
            'user_id' => $request->user()->id,
            'community_id' => $community->id,
        ],
        [
            'joined_at' => now(),
        ]
);

        return response()->json([
            'mensaje' => 'Comunidad creada correctamente',
            'comunidad' => $community,
        ], 201);
    }

    public function show($id)
    {
        $community = Community::with([
            'creator',
            'publications',
            'members'
        ])->find($id);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        return response()->json($community);
    }

    public function update(Request $request, $id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        if ($community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para modificar esta comunidad'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|max:255',
            'logo' => 'nullable|string',
        ]);

        $community->update(
            $request->only([
                'name',
                'description',
                'category',
                'logo',
            ])
        );

        $memberIds = Membership::where('community_id', $community->id)
            ->where('user_id', '!=', $request->user()->id)
            ->pluck('user_id');

        if ($memberIds->isNotEmpty()) {
            $now = now();

            Notification::insert(
                $memberIds->map(fn ($userId) => [
                    'user_id' => $userId,
                    'type' => 'community_update',
                    'message' =>
                        'La comunidad "' .
                        $community->name .
                        '" fue actualizada.',
                    'data' => json_encode([
                        'community_id' => $community->id
                    ]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all()
            );
        }

        return response()->json([
            'mensaje' => 'Comunidad actualizada correctamente',
            'comunidad' => $community->fresh('creator'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        if ($community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para eliminar esta comunidad'
            ], 403);
        }

        $community->delete();

        return response()->json([
            'mensaje' => 'Comunidad eliminada correctamente'
        ]);
    }
}