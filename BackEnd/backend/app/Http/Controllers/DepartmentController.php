<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Department::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:100|unique:departments,name',
            'head'   => 'required|string|max:255',
            'count'  => 'required|integer|min:0',
            'active' => 'required|integer|min:0|lte:count',
            'color'  => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $dept = Department::create($data);
        return response()->json($dept, 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:100|unique:departments,name,' . $department->id,
            'head'   => 'required|string|max:255',
            'count'  => 'required|integer|min:0',
            'active' => 'required|integer|min:0|lte:count',
            'color'  => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $department->update($data);
        return response()->json($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(['message' => 'Département supprimé.']);
    }
}
