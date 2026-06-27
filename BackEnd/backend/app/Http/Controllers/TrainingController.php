<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Training;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TrainingController extends Controller
{
    public function index(Employee $employee): JsonResponse
    {
        $trainings = $employee->trainings->map(fn ($t) => $this->format($t));
        return response()->json($trainings);
    }

    public function store(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'provider'     => 'nullable|string|max:255',
            'started_at'   => 'nullable|date',
            'completed_at' => 'nullable|date',
            'expiry_date'  => 'nullable|date',
            'status'       => ['required', Rule::in(['en_cours', 'complété', 'expiré'])],
            'notes'        => 'nullable|string|max:500',
        ]);

        $data['employee_id'] = $employee->id;
        $training = Training::create($data);

        return response()->json($this->format($training), 201);
    }

    public function update(Request $request, Employee $employee, Training $training): JsonResponse
    {
        abort_if($training->employee_id !== $employee->id, 404);

        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'provider'     => 'nullable|string|max:255',
            'started_at'   => 'nullable|date',
            'completed_at' => 'nullable|date',
            'expiry_date'  => 'nullable|date',
            'status'       => ['required', Rule::in(['en_cours', 'complété', 'expiré'])],
            'notes'        => 'nullable|string|max:500',
        ]);

        $training->update($data);
        return response()->json($this->format($training->fresh()));
    }

    public function destroy(Employee $employee, Training $training): JsonResponse
    {
        abort_if($training->employee_id !== $employee->id, 404);
        $training->delete();
        return response()->json(['message' => 'Formation supprimée.']);
    }

    private function format(Training $t): array
    {
        return [
            'id'           => $t->id,
            'name'         => $t->name,
            'provider'     => $t->provider,
            'started_at'   => $t->started_at?->format('d M Y'),
            'completed_at' => $t->completed_at?->format('d M Y'),
            'expiry_date'  => $t->expiry_date?->format('d M Y'),
            'status'       => $t->status,
            'notes'        => $t->notes,
        ];
    }
}
