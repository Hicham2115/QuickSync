<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(): JsonResponse
    {
        $employees = Employee::orderBy('name')->get()->map(fn ($e) => [
            'id'     => $e->id,
            'name'   => $e->name,
            'email'  => $e->email,
            'dept'   => $e->dept,
            'title'  => $e->title,
            'hired'  => $e->hired->format('d M Y'),
            'status' => $e->status,
            'leaves' => $e->leaves,
            'phone'  => $e->phone ?? '',
            'bio'    => $e->bio ?? '',
            'salary' => $e->salary,
        ]);

        return response()->json($employees);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'id'         => $employee->id,
            'name'       => $employee->name,
            'email'      => $employee->email,
            'dept'       => $employee->dept,
            'title'      => $employee->title,
            'hired'      => $employee->hired->format('Y-m-d'),
            'status'     => $employee->status,
            'leaves'     => $employee->leaves,
            'phone'      => $employee->phone ?? '',
            'bio'        => $employee->bio ?? '',
            'salary'     => $employee->salary,
            'promotions' => $employee->promotions->map(fn ($p) => [
                'id'              => $p->id,
                'title'           => $p->title,
                'salary'          => $p->salary,
                'previous_salary' => $p->previous_salary,
                'promoted_at'     => $p->promoted_at->format('d M Y'),
                'notes'           => $p->notes,
            ]),
            'trainings' => $employee->trainings->map(fn ($t) => [
                'id'           => $t->id,
                'name'         => $t->name,
                'provider'     => $t->provider,
                'started_at'   => $t->started_at?->format('d M Y'),
                'completed_at' => $t->completed_at?->format('d M Y'),
                'expiry_date'  => $t->expiry_date?->format('d M Y'),
                'status'       => $t->status,
                'notes'        => $t->notes,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|unique:employees,email',
            'dept'   => 'required|string|max:100',
            'title'  => 'required|string|max:100',
            'hired'  => 'required|date',
            'status' => ['required', Rule::in(['Actif', 'En congé', 'Inactif'])],
            'leaves' => 'integer|min:0',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $employee = Employee::create($data);

        return response()->json([
            'id'     => $employee->id,
            'name'   => $employee->name,
            'email'  => $employee->email,
            'dept'   => $employee->dept,
            'title'  => $employee->title,
            'hired'  => $employee->hired->format('d M Y'),
            'status' => $employee->status,
            'leaves' => $employee->leaves,
            'salary' => $employee->salary,
        ], 201);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|unique:employees,email,' . $employee->id,
            'dept'   => 'required|string|max:100',
            'title'  => 'required|string|max:100',
            'hired'  => 'required|date',
            'status' => ['required', Rule::in(['Actif', 'En congé', 'Inactif'])],
            'leaves' => 'integer|min:0',
            'phone'  => 'nullable|string|max:30',
            'bio'    => 'nullable|string|max:500',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $employee->update($data);

        return response()->json([
            'id'     => $employee->id,
            'name'   => $employee->name,
            'email'  => $employee->email,
            'dept'   => $employee->dept,
            'title'  => $employee->title,
            'hired'  => $employee->hired->format('d M Y'),
            'status' => $employee->status,
            'leaves' => $employee->leaves,
            'phone'  => $employee->phone ?? '',
            'bio'    => $employee->bio ?? '',
            'salary' => $employee->salary,
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();
        return response()->json(['message' => 'Employé supprimé.']);
    }
}
