<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MeController extends Controller
{
    private function formatLeave(Leave $l): array
    {
        return [
            'id'          => $l->id,
            'employee'    => $l->employee_name ?? '',
            'dept'        => $l->dept ?? '',
            'type'        => $l->type,
            'from'        => $l->from_date->format('d M Y'),
            'to'          => $l->to_date->format('d M Y'),
            'days'        => $l->days,
            'status'      => $l->status,
            'reason'      => $l->reason ?? '',
            'attachment'  => $l->attachment ?? null,
            'created_at'  => $l->created_at?->format('d M Y') ?? '',
            'updated_at'  => $l->updated_at?->diffForHumans(),
        ];
    }

    public function profile(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = Employee::where('email', $user->email)->first();

        $avatarUrl = $user->avatar
            ? asset('storage/' . $user->avatar)
            : null;

        return response()->json([
            'id'     => $user->id,
            'name'   => $user->CompleteName,
            'email'  => $user->email,
            'role'   => $user->role ?? 'employee',
            'dept'   => $employee?->dept ?? '',
            'title'  => $employee?->title ?? '',
            'hired'  => $employee?->hired?->format('d M Y') ?? '',
            'status' => $employee?->status ?? 'Actif',
            'phone'  => $employee?->phone ?? '',
            'bio'    => $employee?->bio ?? '',
            'avatar' => $avatarUrl,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'bio'   => 'nullable|string|max:500',
        ]);

        $user->CompleteName = $data['name'];
        $user->save();

        $employee = Employee::where('email', $user->email)->first();
        if ($employee) {
            $employee->update([
                'name'  => $data['name'],
                'phone' => $data['phone'] ?? null,
                'bio'   => $data['bio'] ?? null,
            ]);
        }

        return response()->json(['message' => 'Profil mis à jour.']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar = $path;
        $user->save();

        return response()->json([
            'avatar' => asset('storage/' . $path),
        ]);
    }

    public function leaves(Request $request): JsonResponse
    {
        $user = $request->user();

        $leaves = Leave::where('employee_name', $user->CompleteName)
            ->orderByDesc('from_date')
            ->get()
            ->map(fn ($l) => $this->formatLeave($l));

        return response()->json($leaves);
    }

    public function storeLeave(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = Employee::where('email', $user->email)->first();

        $data = $request->validate([
            'type'       => ['required', Rule::in(['Annuel', 'Maladie', 'Sans solde', 'Maternité', 'Paternité', 'Autre'])],
            'from'       => 'required|date',
            'to'         => 'required|date|after_or_equal:from',
            'days'       => 'required|integer|min:1',
            'reason'     => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave-attachments', 'public');
        }

        $leave = Leave::create([
            'employee_name' => $user->CompleteName,
            'dept'          => $employee?->dept ?? '',
            'type'          => $data['type'],
            'from_date'     => $data['from'],
            'to_date'       => $data['to'],
            'days'          => $data['days'],
            'status'        => 'en_attente',
            'reason'        => $data['reason'],
            'attachment'    => $attachmentPath,
        ]);

        // Notify all RH and admin users
        User::whereIn('role', ['rh', 'admin'])->each(function ($recipient) use ($user, $data) {
            Notification::create([
                'user_id' => $recipient->id,
                'title'   => 'Nouvelle demande de congé',
                'body'    => "{$user->CompleteName} a soumis une demande de {$data['type']} ({$data['days']} j).",
                'type'    => 'leave_request',
            ]);
        });

        return response()->json($this->formatLeave($leave), 201);
    }

    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        $year = now()->year;

        $approved = Leave::where('employee_name', $user->CompleteName)
            ->where('status', 'approuve')
            ->whereYear('from_date', $year)
            ->get();

        $annualUsed = $approved->where('type', 'Annuel')->sum('days');
        $sickUsed   = $approved->where('type', 'Maladie')->sum('days');
        $otherUsed  = $approved->whereNotIn('type', ['Annuel', 'Maladie'])->sum('days');

        $pending = Leave::where('employee_name', $user->CompleteName)
            ->where('status', 'en_attente')
            ->count();

        return response()->json([
            'annual'  => ['total' => 30, 'used' => $annualUsed,  'remaining' => max(0, 30 - $annualUsed)],
            'sick'    => ['total' => 15, 'used' => $sickUsed,    'remaining' => max(0, 15 - $sickUsed)],
            'other'   => ['used' => $otherUsed],
            'pending' => $pending,
        ]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Leave::where('employee_name', $user->CompleteName)
            ->whereIn('status', ['approuve', 'refuse'])
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn ($l) => [
                'id'     => $l->id,
                'type'   => $l->type,
                'status' => $l->status,
                'days'   => $l->days,
                'date'   => $l->updated_at?->diffForHumans() ?? '',
            ]);

        return response()->json($items);
    }

    public function teamCalendar(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = Employee::where('email', $user->email)->first();

        if (! $employee) {
            return response()->json(['dept' => '', 'leaves' => []]);
        }

        $today      = now()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $leaves = Leave::where('dept', $employee->dept)
            ->where('status', 'approuve')
            ->where('to_date', '>=', $today)
            ->where('from_date', '<=', $endOfMonth)
            ->where('employee_name', '!=', $user->CompleteName)
            ->orderBy('from_date')
            ->get()
            ->map(fn ($l) => [
                'employee' => $l->employee_name,
                'type'     => $l->type,
                'from'     => $l->from_date->format('d M'),
                'to'       => $l->to_date->format('d M'),
                'days'     => $l->days,
            ]);

        return response()->json([
            'dept'   => $employee->dept,
            'leaves' => $leaves,
        ]);
    }
}
