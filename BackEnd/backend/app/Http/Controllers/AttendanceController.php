<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    private function format(Attendance $a): array
    {
        $workedMinutes = null;
        if ($a->checked_in_at && $a->checked_out_at) {
            $inTime  = Carbon::createFromTimeString($a->checked_in_at);
            $outTime = Carbon::createFromTimeString($a->checked_out_at);
            $workedMinutes = max(0, $inTime->diffInMinutes($outTime) - $a->break_minutes);
        }

        if ($a->checked_in_at && !$a->checked_out_at && $a->break_started_at) {
            $status = 'on_break';
        } elseif ($a->checked_in_at && $a->checked_out_at) {
            $status = 'done';
        } elseif ($a->checked_in_at) {
            $status = 'working';
        } else {
            $status = 'not_checked_in';
        }

        return [
            'id'               => $a->id,
            'employee_name'    => $a->employee_name,
            'dept'             => $a->dept,
            'date'             => $a->date->format('Y-m-d'),
            'date_label'       => $a->date->format('D d M Y'),
            'checked_in_at'    => $a->checked_in_at  ? substr($a->checked_in_at,  0, 5) : null,
            'checked_out_at'   => $a->checked_out_at ? substr($a->checked_out_at, 0, 5) : null,
            'break_started_at' => $a->break_started_at ? substr($a->break_started_at, 0, 5) : null,
            'break_minutes'    => (int) $a->break_minutes,
            'worked_minutes'   => $workedMinutes,
            'status'           => $status,
            'note'             => $a->note,
        ];
    }

    public function checkIn(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = Employee::where('email', $user->email)->first();
        $today    = now()->toDateString();

        $existing = Attendance::where('user_id', $user->id)->where('date', $today)->first();
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

    public function checkOut(Request $request): JsonResponse
    {
        $user  = $request->user();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)->where('date', $today)->first();
        if (! $attendance) {
            return response()->json(['message' => 'Aucun pointage aujourd\'hui.'], 404);
        }
        if ($attendance->checked_out_at) {
            return response()->json([
                'message'      => 'Déjà sorti.',
                'attendance'   => $this->format($attendance),
                'already_done' => true,
            ]);
        }

        // Auto-end any running break
        if ($attendance->break_started_at) {
            $breakMins = (int) round(Carbon::createFromTimeString($attendance->break_started_at)
                ->diffInMinutes(now()));
            $attendance->break_minutes    += $breakMins;
            $attendance->break_started_at  = null;
        }

        $attendance->checked_out_at = now()->format('H:i:s');
        $attendance->save();

        return response()->json([
            'message'    => 'Sortie enregistrée.',
            'attendance' => $this->format($attendance),
        ]);
    }

    public function breakStart(Request $request): JsonResponse
    {
        $user  = $request->user();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)->where('date', $today)->first();
        if (! $attendance) {
            return response()->json(['message' => 'Non pointé aujourd\'hui.'], 404);
        }
        if ($attendance->checked_out_at) {
            return response()->json(['message' => 'Journée déjà terminée.'], 422);
        }
        if ($attendance->break_started_at) {
            return response()->json([
                'message'      => 'Déjà en pause.',
                'attendance'   => $this->format($attendance),
                'already_done' => true,
            ]);
        }

        $attendance->break_started_at = now()->format('H:i:s');
        $attendance->save();

        return response()->json([
            'message'    => 'Pause commencée.',
            'attendance' => $this->format($attendance),
        ]);
    }

    public function breakEnd(Request $request): JsonResponse
    {
        $user  = $request->user();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)->where('date', $today)->first();
        if (! $attendance || ! $attendance->break_started_at) {
            return response()->json(['message' => 'Pas en pause.'], 422);
        }

        $breakMins = (int) round(Carbon::createFromTimeString($attendance->break_started_at)
            ->diffInMinutes(now()));
        $attendance->break_minutes   += $breakMins;
        $attendance->break_started_at = null;
        $attendance->save();

        return response()->json([
            'message'    => 'Pause terminée.',
            'attendance' => $this->format($attendance),
        ]);
    }

    public function myAttendance(Request $request): JsonResponse
    {
        $user  = $request->user();
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
}
