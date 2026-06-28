<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\MessageController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user',      fn (Request $request) => $request->user());
    Route::post('/admin/create-account',        [RegisterController::class, 'createAccount']);

    Route::get('/dashboard/stats',   [DashboardController::class, 'stats']);
    Route::get('/reports',           [ReportsController::class, 'index']);
    Route::get('/me/profile',       [MeController::class, 'profile']);
    Route::patch('/me/profile',     [MeController::class, 'updateProfile']);
    Route::post('/me/avatar',       [MeController::class, 'uploadAvatar']);
    Route::get('/me/leaves',        [MeController::class, 'leaves']);
    Route::post('/me/leaves',       [MeController::class, 'storeLeave']);
    Route::get('/me/balance',       [MeController::class, 'balance']);
    Route::get('/me/notifications',          [NotificationController::class, 'index']);
    Route::post('/me/notifications/read-all',[NotificationController::class, 'markAllRead']);
    Route::get('/me/team',          [MeController::class, 'teamCalendar']);
    Route::post('/me/attendance',            [AttendanceController::class, 'checkIn']);
    Route::post('/me/attendance/checkout',   [AttendanceController::class, 'checkOut']);
    Route::post('/me/attendance/break-start',[AttendanceController::class, 'breakStart']);
    Route::post('/me/attendance/break-end',  [AttendanceController::class, 'breakEnd']);
    Route::get('/me/attendance',             [AttendanceController::class, 'myAttendance']);
    Route::get('/attendance',                [AttendanceController::class, 'allAttendance']);
    Route::get('/admin/users',                  [UserController::class, 'index']);
    Route::patch('/admin/users/{user}',         [UserController::class, 'update']);
    Route::patch('/admin/users/{user}/role',    [UserController::class, 'updateRole']);
    Route::delete('/admin/users/{user}',        [UserController::class, 'destroy']);
    Route::get('/employees',               [EmployeeController::class, 'index']);
    Route::post('/employees',              [EmployeeController::class, 'store']);
    Route::get('/employees/{employee}',    [EmployeeController::class, 'show']);
    Route::put('/employees/{employee}',    [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

    // Promotions
    Route::get('/employees/{employee}/promotions',              [PromotionController::class, 'index']);
    Route::post('/employees/{employee}/promotions',             [PromotionController::class, 'store']);
    Route::delete('/employees/{employee}/promotions/{promotion}', [PromotionController::class, 'destroy']);

    // Trainings
    Route::get('/employees/{employee}/trainings',                    [TrainingController::class, 'index']);
    Route::post('/employees/{employee}/trainings',                   [TrainingController::class, 'store']);
    Route::put('/employees/{employee}/trainings/{training}',         [TrainingController::class, 'update']);
    Route::delete('/employees/{employee}/trainings/{training}',      [TrainingController::class, 'destroy']);

    // Messages
    Route::get('/messages/conversations',    [MessageController::class, 'conversations']);
    Route::get('/messages/unread',           [MessageController::class, 'unreadCount']);
    Route::get('/messages/{user}',           [MessageController::class, 'thread']);
    Route::post('/messages/{user}',          [MessageController::class, 'send']);

    Route::get('/departments',             [DepartmentController::class, 'index']);
    Route::post('/departments',            [DepartmentController::class, 'store']);
    Route::put('/departments/{department}',    [DepartmentController::class, 'update']);
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

    // Documents
    Route::get('/me/documents',                        [DocumentController::class, 'myRequests']);
    Route::post('/me/documents',                       [DocumentController::class, 'store']);
    Route::get('/documents',                           [DocumentController::class, 'index']);
    Route::patch('/documents/{document}/status',       [DocumentController::class, 'updateStatus']);
    Route::delete('/documents/{document}',             [DocumentController::class, 'destroy']);

    // Announcements
    Route::get('/announcements',                       [AnnouncementController::class, 'index']);
    Route::post('/announcements',                      [AnnouncementController::class, 'store']);
    Route::delete('/announcements/{announcement}',     [AnnouncementController::class, 'destroy']);

    Route::get('/leaves',             [LeaveController::class, 'index']);
    Route::post('/leaves',            [LeaveController::class, 'store']);
    Route::patch('/leaves/{leave}/status', [LeaveController::class, 'updateStatus']);
    Route::put('/leaves/{leave}',     [LeaveController::class, 'update']);
    Route::delete('/leaves/{leave}',  [LeaveController::class, 'destroy']);
});

Route::get('/health', fn () => response()->json(['status' => 'ok']));

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
