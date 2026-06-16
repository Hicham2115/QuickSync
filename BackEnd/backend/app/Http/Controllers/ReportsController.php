<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class ReportsController extends Controller
{
    public function index(): JsonResponse
    {
        $now  = Carbon::now();
        $year = $now->year;

        // ── KPIs ────────────────────────────────────────────────────
        $totalEmployees = Employee::count();

        $approvedThisMonth = Leave::where('status', 'approuve')
            ->whereYear('from_date', $year)
            ->whereMonth('from_date', $now->month)
            ->count();

        $pendingLeaves = Leave::where('status', 'en_attente')->count();

        $absenceDays = Leave::where('status', 'approuve')
            ->whereYear('from_date', $year)
            ->whereMonth('from_date', $now->month)
            ->sum('days');

        // ── Headcount history (last 12 months based on hired date) ──
        $headcount = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $count = Employee::where('hired', '<=', $month->endOfMonth()->toDateString())->count();
            $headcount[] = [
                'month'   => $month->locale('fr')->isoFormat('MMM'),
                'effectif'=> $count,
            ];
        }

        // ── Departments ─────────────────────────────────────────────
        $departments = Department::orderBy('name')->get()->map(fn ($d) => [
            'name'    => $d->name,
            'head'    => $d->head,
            'effectif'=> $d->count,
            'actif'   => $d->active,
            'color'   => $d->color,
        ]);

        // ── Leave types (days by type) ───────────────────────────────
        $leaveTypes = Leave::where('status', 'approuve')
            ->whereYear('from_date', $year)
            ->selectRaw('type, SUM(days) as total')
            ->groupBy('type')
            ->get()
            ->map(fn ($r) => ['name' => $r->type, 'value' => (int) $r->total]);

        // ── Employee statuses ────────────────────────────────────────
        $statuses = Employee::selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => ['name' => $r->status, 'value' => (int) $r->cnt]);

        // ── Pending leaves by dept ───────────────────────────────────
        $pendingByDept = Leave::where('status', 'en_attente')
            ->selectRaw('dept, SUM(days) as jours')
            ->groupBy('dept')
            ->get()
            ->map(fn ($r) => ['dept' => $r->dept, 'jours' => (int) $r->jours]);

        // ── All leaves (for PDF table) ───────────────────────────────
        $leaves = Leave::orderByDesc('from_date')->get()->map(fn ($l) => [
            'id'       => $l->id,
            'employee' => $l->employee_name,
            'dept'     => $l->dept ?? '',
            'type'     => $l->type,
            'from'     => $l->from_date->format('d M Y'),
            'to'       => $l->to_date->format('d M Y'),
            'days'     => $l->days,
            'status'   => $l->status,
        ]);

        // ── All employees (for PDF table) ────────────────────────────
        $employees = Employee::orderBy('name')->get()->map(fn ($e) => [
            'name'   => $e->name,
            'email'  => $e->email,
            'dept'   => $e->dept,
            'title'  => $e->title,
            'hired'  => $e->hired->format('d M Y'),
            'status' => $e->status,
            'leaves' => $e->leaves,
        ]);

        return response()->json([
            'kpi' => [
                'total_employees'    => $totalEmployees,
                'pending_leaves'     => $pendingLeaves,
                'approved_this_month'=> $approvedThisMonth,
                'absence_days'       => $absenceDays,
            ],
            'headcount'       => $headcount,
            'departments'     => $departments,
            'leave_types'     => $leaveTypes,
            'statuses'        => $statuses,
            'pending_by_dept' => $pendingByDept,
            'leaves'          => $leaves,
            'employees'       => $employees,
        ]);
    }
}
