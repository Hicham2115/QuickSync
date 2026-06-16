<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function checkIn(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = Employee::where('email', $user->email)->first();
        $today    = now()->toDateString();

        $existing = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'message'      => 'Déjà pointé aujourd\'hui.',
                'attendance'   => $this->format($existing),
                'already_done' => true,
            ]);
        }

        $attendance = Attendance::create([
            'user_id'       => $user->id,
            'employee_name' => $user->CompleteName,
            'dept'          => $employee?->dept ?? '',
            'date'          => $today,
            'checked_in_at' => now()->format('H:i:s'),
            'note'          => $request->input('note'),
        ]);

        return response()->json([
            'message'    => 'Présence enregistrée.',
            'attendance' => $this->format($attendance),
        ], 201);
    }

    public function myAttendance(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->query('month', now()->format('Y-m'));

        $records = Attendance::where('user_id', $user->id)
            ->whereRaw("strftime('%Y-%m', date) = ?", [$month])
            ->orderByDesc('date')
            ->get()
            ->map(fn ($a) => $this->format($a));

        $today = Attendance::where('user_id', $user->id)
            ->where('date', now()->toDateString())
            ->first();

        return response()->json([
            'today'   => $today ? $this->format($today) : null,
            'records' => $records,
        ]);
    }

    public function allAttendance(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        $records = Attendance::where('date', $date)
            ->orderBy('checked_in_at')
            ->get()
            ->map(fn ($a) => $this->format($a));

        return response()->json($records);
    }

    private function format(Attendance $a): array
    {
        return [
            'id'            => $a->id,
            'employee_name' => $a->employee_name,
            'dept'          => $a->dept,
            'date'          => $a->date->format('Y-m-d'),
            'date_label'    => $a->date->format('D d M Y'),
            'checked_in_at' => substr($a->checked_in_at, 0, 5),
            'note'          => $a->note,
        ];
    }
}
