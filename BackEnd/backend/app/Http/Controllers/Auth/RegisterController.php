<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    public function signup(Request $request)
    {
        $validatedData = $request->validate([
            'CompleteName' => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'CompleteName' => $validatedData['CompleteName'],
            'email'        => $validatedData['email'],
            'password'     => $validatedData['password'],
            'role'         => 'admin',
        ]);

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Verification email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Account created. Please check your email to verify your account.',
            'user'    => $user,
        ], 201);
    }

    public function createAccount(Request $request)
    {
        $validatedData = $request->validate([
            'CompleteName' => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:8|confirmed',
            'role'         => 'required|in:rh,employee',
        ]);

        $user = User::create([
            'CompleteName' => $validatedData['CompleteName'],
            'email'        => $validatedData['email'],
            'password'     => $validatedData['password'],
            'role'         => $validatedData['role'],
        ]);

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'user'    => $user,
        ], 201);
    }
}
