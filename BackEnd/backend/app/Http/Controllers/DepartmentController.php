<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    private function format(Department $d): array
    {
        $count  = Employee::where('dept', $d->name)->count();
        $active = Employee::where('dept', $d->name)->where('status', 'Actif')->count();
        return [
            'id'     => $d->id,
            'name'   => $d->name,
            'head'   => $d->head,
            'count'  => $count,
            'active' => $active,
            'color'  => $d->color,
        ];
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Department::orderBy('name')->get()->map(fn ($d) => $this->format($d))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:100|unique:departments,name',
            'head'  => 'required|string|max:255',
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $dept = Department::create($data);
        return response()->json($this->format($dept), 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:100|unique:departments,name,' . $department->id,
            'head'  => 'required|string|max:255',
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $department->update($data);
        return response()->json($this->format($department));
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(['message' => 'Département supprimé.']);
    }
}
