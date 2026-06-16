<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::select('id', 'CompleteName', 'email', 'role', 'email_verified_at', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($u) => [
                    'id'         => $u->id,
                    'name'       => $u->CompleteName,
                    'email'      => $u->email,
                    'role'       => $u->role ?? 'employee',
                    'verified'   => ! is_null($u->email_verified_at),
                    'created_at' => $u->created_at?->toDateString(),
                ])
        );
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->CompleteName = $data['name'];
        $user->email        = $data['email'];
        $user->save();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->CompleteName,
            'email' => $user->email,
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => 'required|in:rh,employee',
        ]);

        $user->update(['role' => $data['role']]);

        return response()->json(['message' => 'Rôle mis à jour.', 'role' => $user->role]);
    }

    public function destroy(User $user)
    {
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé.']);
    }
}
