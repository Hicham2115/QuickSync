<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveController extends Controller
{
    private function format(Leave $l): array
    {
        return [
            'id'       => $l->id,
            'employee' => $l->employee_name,
            'dept'     => $l->dept,
            'type'     => $l->type,
            'from'     => $l->from_date->format('d M Y'),
            'to'       => $l->to_date->format('d M Y'),
            'days'     => $l->days,
            'status'   => $l->status,
            'reason'   => $l->reason ?? '',
        ];
    }

    public function index(): JsonResponse
    {
        $leaves = Leave::orderByDesc('from_date')->get()->map(fn ($l) => $this->format($l));
        return response()->json($leaves);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee' => 'required|string|max:255',
            'dept'     => 'required|string|max:100',
            'type'     => ['required', Rule::in(['Annuel', 'Maladie', 'Sans solde', 'Maternité', 'Paternité', 'Autre'])],
            'from'     => 'required|date',
            'to'       => 'required|date|after_or_equal:from',
            'days'     => 'required|integer|min:1',
            'reason'   => 'nullable|string|max:500',
        ]);

        $leave = Leave::create([
            'employee_name' => $data['employee'],
            'dept'          => $data['dept'],
            'type'          => $data['type'],
            'from_date'     => $data['from'],
            'to_date'       => $data['to'],
            'days'          => $data['days'],
            'status'        => 'en_attente',
            'reason'        => $data['reason'] ?? null,
        ]);

        return response()->json($this->format($leave), 201);
    }

    public function updateStatus(Request $request, Leave $leave): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['en_attente', 'approuve', 'refuse'])],
        ]);

        $leave->update(['status' => $data['status']]);
        return response()->json($this->format($leave));
    }

    public function update(Request $request, Leave $leave): JsonResponse
    {
        $data = $request->validate([
            'employee' => 'required|string|max:255',
            'dept'     => 'required|string|max:100',
            'type'     => ['required', Rule::in(['Annuel', 'Maladie', 'Sans solde', 'Maternité', 'Paternité', 'Autre'])],
            'from'     => 'required|date',
            'to'       => 'required|date|after_or_equal:from',
            'days'     => 'required|integer|min:1',
            'reason'   => 'nullable|string|max:500',
            'status'   => ['nullable', Rule::in(['en_attente', 'approuve', 'refuse'])],
        ]);

        $leave->update([
            'employee_name' => $data['employee'],
            'dept'          => $data['dept'],
            'type'          => $data['type'],
            'from_date'     => $data['from'],
            'to_date'       => $data['to'],
            'days'          => $data['days'],
            'reason'        => $data['reason'] ?? null,
            'status'        => $data['status'] ?? $leave->status,
        ]);

        return response()->json($this->format($leave));
    }

    public function destroy(Leave $leave): JsonResponse
    {
        $leave->delete();
        return response()->json(['message' => 'Demande supprimée.']);
    }
}
