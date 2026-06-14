<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\EmployeeController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user',      fn (Request $request) => $request->user());
    Route::get('/employees',          [EmployeeController::class, 'index']);
    Route::post('/employees',         [EmployeeController::class, 'store']);
    Route::put('/employees/{employee}',    [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);
});

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/signup',          [RegisterController::class, 'signup']);
    Route::post('/login',           [LoginController::class,   'login']);
    Route::post('/forgot-password', [LoginController::class,   'forgotPassword']);
    Route::post('/reset-password',  [LoginController::class,   'resetPassword']);
    Route::post('/logout',          [LoginController::class,   'logout'])->middleware('auth:sanctum');
});

// Public — no auth middleware so browser clicks work without a Bearer token
Route::get('/email/verify/{id}/{hash}', function (string $id, string $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
        abort(403, 'Invalid verification link.');
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
    return redirect("{$frontendUrl}/dashboard");
})->middleware('signed')->name('verification.verify');
