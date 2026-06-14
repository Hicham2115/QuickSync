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
        ]);

        return response()->json($employees);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'id'     => $employee->id,
            'name'   => $employee->name,
            'email'  => $employee->email,
            'dept'   => $employee->dept,
            'title'  => $employee->title,
            'hired'  => $employee->hired->format('Y-m-d'),
            'status' => $employee->status,
            'leaves' => $employee->leaves,
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
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();
        return response()->json(['message' => 'Employé supprimé.']);
    }
}
