<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    private function format(Announcement $a): array
    {
        return [
            'id'          => $a->id,
            'author_name' => $a->author_name,
            'title'       => $a->title,
            'body'        => $a->body,
            'type'        => $a->type,
            'created_at'  => $a->created_at?->format('d M Y H:i') ?? '',
        ];
    }

    public function index(): JsonResponse
    {
        $items = Announcement::orderByDesc('created_at')->get()->map(fn ($a) => $this->format($a));
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Seul un administrateur peut créer des annonces.'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:200',
            'body'  => 'required|string|max:2000',
            'type'  => ['required', Rule::in(['info', 'urgent', 'event'])],
        ]);

        $announcement = Announcement::create([
            'author_id'   => $user->id,
            'author_name' => $user->CompleteName,
            'title'       => $data['title'],
            'body'        => $data['body'],
            'type'        => $data['type'],
        ]);

        // Notify all employees (and rh/admin too)
        User::all()->each(function ($recipient) use ($user, $data, $announcement) {
            if ($recipient->id === $user->id) return; // skip author
            Notification::create([
                'user_id' => $recipient->id,
                'title'   => $data['title'],
                'body'    => $data['body'],
                'type'    => 'announcement_' . $data['type'],
            ]);
        });

        return response()->json($this->format($announcement), 201);
    }

    public function destroy(Request $request, Announcement $announcement): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }
        $announcement->delete();
        return response()->json(['message' => 'Annonce supprimée.']);
    }
}
