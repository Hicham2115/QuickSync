<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Employee $employee): JsonResponse
    {
        $promotions = $employee->promotions->map(fn ($p) => [
            'id'              => $p->id,
            'title'           => $p->title,
            'salary'          => $p->salary,
            'previous_salary' => $p->previous_salary,
            'promoted_at'     => $p->promoted_at->format('d M Y'),
            'notes'           => $p->notes,
        ]);

        return response()->json($promotions);
    }

    public function store(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:100',
            'salary'      => 'required|numeric|min:0',
            'promoted_at' => 'required|date',
            'notes'       => 'nullable|string|max:500',
        ]);

        $data['employee_id']     = $employee->id;
        $data['previous_salary'] = $employee->salary;

        $promotion = Promotion::create($data);

        // Update employee's current title and salary
        $employee->update(['title' => $data['title'], 'salary' => $data['salary']]);

        return response()->json([
            'id'              => $promotion->id,
            'title'           => $promotion->title,
            'salary'          => $promotion->salary,
            'previous_salary' => $promotion->previous_salary,
            'promoted_at'     => $promotion->promoted_at->format('d M Y'),
            'notes'           => $promotion->notes,
        ], 201);
    }

    public function destroy(Employee $employee, Promotion $promotion): JsonResponse
    {
        abort_if($promotion->employee_id !== $employee->id, 404);
        $promotion->delete();
        return response()->json(['message' => 'Promotion supprimée.']);
    }
}
