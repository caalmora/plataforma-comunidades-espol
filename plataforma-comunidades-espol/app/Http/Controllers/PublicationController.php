<?php

namespace App\Http\Controllers;

use App\Models\Community;
use App\Models\Membership;
use App\Models\Notification;
use App\Models\Publication;
use Illuminate\Http\Request;

class PublicationController extends Controller
{
    public function index($communityId)
    {
        $community = Community::find($communityId);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }


        $publications = Publication::with('user')
            ->where('community_id', $communityId)
            ->latest()
            ->get();

        return response()->json($publications);
    }

    public function store(Request $request, $communityId)
    {
        $community = Community::find($communityId);

        if (!$community) {
            return response()->json([
                'mensaje' => 'Comunidad no encontrada'
            ], 404);
        }

        if ($community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para publicar en esta comunidad'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $publication = Publication::create([
            'community_id' => $communityId,
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'published_at' => now(),
        ]);

        $memberIds = Membership::where('community_id', $community->id)
            ->where('user_id', '!=', $request->user()->id)
            ->pluck('user_id');

        if ($memberIds->isNotEmpty()) {
            $now = now();

            Notification::insert($memberIds->map(fn ($userId) => [
                'user_id' => $userId,
                'type' => 'new_publication',
                'message' => 'Nueva publicación en "' . $community->name . '": "' . $publication->title . '".',
                'data' => json_encode([
                    'community_id' => $community->id,
                    'publication_id' => $publication->id,
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ])->all());
        }

        return response()->json([
            'mensaje' => 'Publicación creada correctamente',
            'publicacion' => $publication,
        ], 201);
    }

    public function show($id)
    {
        $publication = Publication::with([
            'user',
            'community'
        ])->find($id);

        if (!$publication) {
            return response()->json([
                'mensaje' => 'Publicación no encontrada'
            ], 404);
        }

        return response()->json($publication);
    }

    public function update(Request $request, $id)
    {
        $publication = Publication::find($id);

        if (!$publication) {
            return response()->json([
                'mensaje' => 'Publicación no encontrada'
            ], 404);
        }

        if ($publication->community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para modificar esta publicación'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
        ]);

        $publication->update($request->only([
            'title',
            'content',
        ]));

        return response()->json([
            'mensaje' => 'Publicación actualizada correctamente',
            'publicacion' => $publication,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $publication = Publication::find($id);

        if (!$publication) {
            return response()->json([
                'mensaje' => 'Publicación no encontrada'
            ], 404);
        }

        if ($publication->community->created_by !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para eliminar esta publicación'
            ], 403);
        }

        $publication->delete();

        return response()->json([
            'mensaje' => 'Publicación eliminada correctamente'
        ]);
    }
}