<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // List all conversations for the current user (one row per contact)
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderByDesc('created_at')
            ->get()
            ->groupBy(fn ($m) => $m->sender_id === $userId ? $m->receiver_id : $m->sender_id)
            ->map(function ($messages, $contactId) use ($userId) {
                $last    = $messages->first();
                $contact = $last->sender_id === $userId ? $last->receiver : $last->sender;
                $unread  = $messages->where('receiver_id', $userId)->whereNull('read_at')->count();

                return [
                    'contact_id'   => $contact->id,
                    'contact_name' => $contact->CompleteName,
                    'contact_avatar'=> $contact->avatar,
                    'last_message' => $last->body,
                    'last_at'      => $last->created_at->format('d M Y H:i'),
                    'unread'       => $unread,
                ];
            })
            ->values();

        return response()->json($conversations);
    }

    // Get messages between current user and a specific user
    public function thread(Request $request, User $user): JsonResponse
    {
        $myId = $request->user()->id;

        $messages = Message::where(function ($q) use ($myId, $user) {
                $q->where('sender_id', $myId)->where('receiver_id', $user->id);
            })
            ->orWhere(function ($q) use ($myId, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $myId);
            })
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id'        => $m->id,
                'body'      => $m->body,
                'mine'      => $m->sender_id === $myId,
                'read_at'   => $m->read_at?->format('H:i'),
                'created_at'=> $m->created_at->format('H:i'),
                'date'      => $m->created_at->format('d M Y'),
            ]);

        // Mark as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $myId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    public function send(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['body' => 'required|string|max:2000']);

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $user->id,
            'body'        => $data['body'],
        ]);

        return response()->json([
            'id'         => $message->id,
            'body'       => $message->body,
            'mine'       => true,
            'read_at'    => null,
            'created_at' => $message->created_at->format('H:i'),
            'date'       => $message->created_at->format('d M Y'),
        ], 201);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread' => $count]);
    }
}
