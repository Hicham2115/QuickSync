<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today         = now()->toDateString();
        $totalEmp      = Employee::count();
        $totalDepts    = Department::count();
        $totalPositions = Employee::count(); // same as employees for now

        $pendingLeaves = Leave::where('status', 'en_attente')->count();

        $presentToday  = Attendance::whereDate('date', $today)->count();
        $presenceRate  = $totalEmp > 0 ? round(($presentToday / $totalEmp) * 100, 1) : 0;

        // Last month presence rate for delta
        $lastMonthStart = now()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd   = now()->subMonth()->endOfMonth()->toDateString();
        $lastMonthDays  = Attendance::whereBetween('date', [$lastMonthStart, $lastMonthEnd])
            ->selectRaw('date, COUNT(*) as cnt')
            ->groupBy('date')
            ->get();
        $lastMonthRate  = 0;
        if ($lastMonthDays->count() > 0 && $totalEmp > 0) {
            $avgPresent    = $lastMonthDays->avg('cnt');
            $lastMonthRate = round(($avgPresent / $totalEmp) * 100, 1);
        }
        $presenceDelta = round($presenceRate - $lastMonthRate, 1);

        $recentLeaves = Leave::orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($l) => [
                'id'       => $l->id,
                'employee' => $l->employee_name,
                'dept'     => $l->dept ?? '',
                'type'     => $l->type,
                'from'     => $l->from_date->format('d M Y'),
                'to'       => $l->to_date->format('d M Y'),
                'days'     => $l->days,
                'status'   => $l->status,
            ]);

        return response()->json([
            'total_employees'  => $totalEmp,
            'pending_leaves'   => $pendingLeaves,
            'presence_rate'    => $presenceRate,
            'presence_delta'   => $presenceDelta,
            'total_departments'=> $totalDepts,
            'recent_leaves'    => $recentLeaves,
        ]);
    }
}
