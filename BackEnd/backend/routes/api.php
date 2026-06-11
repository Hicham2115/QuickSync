<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/signup', [RegisterController::class, 'signup']);
    Route::post('/login',  [LoginController::class,   'login']);
});

// Email verification — public, signed URL, no auth required so browser clicks work
Route::get('/email/verify/{id}/{hash}', function (Request $request, string $id, string $hash) {
    $user = \App\Models\User::findOrFail($id);

    if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
        abort(403, 'Invalid verification link.');
    }

    if (! $request->hasValidSignature()) {
        abort(403, 'Verification link has expired or is invalid.');
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
    return redirect("{$frontendUrl}/dashboard");
})->middleware('signed')->name('verification.verify');

Route::post('/email/resend', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified.']);
    }
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification email resent.']);
})->middleware(['auth:sanctum', 'throttle:6,1']);