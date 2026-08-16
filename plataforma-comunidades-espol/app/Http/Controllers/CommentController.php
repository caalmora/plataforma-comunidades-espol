<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Membership;
use App\Models\Notification;
use App\Models\Publication;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index($publicationId)
    {
        $publication = Publication::find($publicationId);

        if (!$publication) {
            return response()->json([
                'mensaje' => 'Publicación no encontrada'
            ], 404);
        }

        $comments = Comment::with(['user', 'replies.user'])
            ->where('publication_id', $publicationId)
            ->whereNull('parent_id')
            ->oldest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, $publicationId)
    {
        $publication = Publication::with('community')->find($publicationId);

        if (!$publication) {
            return response()->json([
                'mensaje' => 'Publicación no encontrada'
            ], 404);
        }

        $community = $publication->community;
        $user = $request->user();

        $isMember = Membership::where('community_id', $community->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$isMember && $community->created_by !== $user->id) {
            return response()->json([
                'mensaje' => 'Debes ser miembro de la comunidad para comentar'
            ], 403);
        }

        $request->validate([
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $parent = null;

        if ($request->parent_id) {
            $parent = Comment::find($request->parent_id);

            if (!$parent || $parent->publication_id !== $publication->id) {
                return response()->json([
                    'mensaje' => 'El comentario al que respondes no pertenece a esta publicación'
                ], 422);
            }
        }

        $comment = Comment::create([
            'publication_id' => $publication->id,
            'user_id' => $user->id,
            'parent_id' => $parent?->id,
            'content' => $request->content,
        ]);

        if ($parent && $parent->user_id !== $user->id) {
            Notification::create([
                'user_id' => $parent->user_id,
                'type' => 'comment_reply',
                'message' => $user->name . ' respondió a tu comentario en "' . $publication->title . '".',
                'data' => [
                    'community_id' => $community->id,
                    'publication_id' => $publication->id,
                    'comment_id' => $comment->id,
                ],
            ]);
        }

        $comment->load('user');

        return response()->json([
            'mensaje' => 'Comentario publicado correctamente',
            'comentario' => $comment,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json([
                'mensaje' => 'Comentario no encontrado'
            ], 404);
        }

        if ($comment->user_id !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para modificar este comentario'
            ], 403);
        }

        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $comment->update([
            'content' => $request->content,
        ]);

        return response()->json([
            'mensaje' => 'Comentario actualizado correctamente',
            'comentario' => $comment,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json([
                'mensaje' => 'Comentario no encontrado'
            ], 404);
        }

        if ($comment->user_id !== $request->user()->id) {
            return response()->json([
                'mensaje' => 'No tienes permiso para eliminar este comentario'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'mensaje' => 'Comentario eliminado correctamente'
        ]);
    }
}
