<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($n) => [
                'id'    => $n->id,
                'title' => $n->title,
                'body'  => $n->body,
                'type'  => $n->type,
                'read'  => ! is_null($n->read_at),
                'time'  => $n->created_at->diffForHumans(),
            ]);

        $unread = Notification::where('user_id', $user->id)->whereNull('read_at')->count();

        return response()->json([
            'notifications' => $notifications,
            'unread'        => $unread,
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifications lues.']);
    }
}
