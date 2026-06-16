<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentController extends Controller
{
    private function format(DocumentRequest $d): array
    {
        return [
            'id'            => $d->id,
            'user_id'       => $d->user_id,
            'employee_name' => $d->employee_name,
            'dept'          => $d->dept,
            'job_title'     => $d->job_title,
            'hired_date'    => $d->hired_date,
            'type'          => $d->type,
            'status'        => $d->status,
            'admin_note'    => $d->admin_note,
            'created_at'    => $d->created_at?->format('d M Y') ?? '',
        ];
    }

    // Employee: list own requests
    public function myRequests(Request $request): JsonResponse
    {
        $docs = DocumentRequest::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($d) => $this->format($d));

        return response()->json($docs);
    }

    // Employee: submit new request
    public function store(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = Employee::where('email', $user->email)->first();

        $data = $request->validate([
            'type' => ['required', Rule::in(['attestation_travail', 'attestation_salaire'])],
        ]);

        $doc = DocumentRequest::create([
            'user_id'       => $user->id,
            'employee_name' => $user->CompleteName,
            'dept'          => $employee?->dept ?? '',
            'job_title'     => $employee?->title ?? '',
            'hired_date'    => $employee?->hired?->format('d M Y') ?? '',
            'type'          => $data['type'],
        ]);

        $label = $data['type'] === 'attestation_travail' ? 'attestation de travail' : 'attestation de salaire';

        User::whereIn('role', ['rh', 'admin'])->each(function ($recipient) use ($user, $label) {
            Notification::create([
                'user_id' => $recipient->id,
                'title'   => 'Nouvelle demande de document',
                'body'    => "{$user->CompleteName} a demandé une {$label}.",
                'type'    => 'document_request',
            ]);
        });

        return response()->json($this->format($doc), 201);
    }

    // Admin/RH: list all requests
    public function index(): JsonResponse
    {
        $docs = DocumentRequest::orderByDesc('created_at')
            ->get()
            ->map(fn ($d) => $this->format($d));

        return response()->json($docs);
    }

    // Admin/RH: approve or refuse
    public function updateStatus(Request $request, DocumentRequest $document): JsonResponse
    {
        $data = $request->validate([
            'status'     => ['required', Rule::in(['approuve', 'refuse'])],
            'admin_note' => 'nullable|string|max:300',
        ]);

        $document->update([
            'status'     => $data['status'],
            'admin_note' => $data['admin_note'] ?? null,
        ]);

        $label = $data['status'] === 'approuve' ? 'approuvée ✓' : 'refusée ✗';
        $typeLabel = $document->type === 'attestation_travail' ? 'attestation de travail' : 'attestation de salaire';

        Notification::create([
            'user_id' => $document->user_id,
            'title'   => "Demande de document {$label}",
            'body'    => "Votre {$typeLabel} a été {$label}." . ($data['admin_note'] ? " Note : {$data['admin_note']}" : ''),
            'type'    => 'document_status',
        ]);

        return response()->json($this->format($document));
    }

    // Admin/RH: delete a request
    public function destroy(DocumentRequest $document): JsonResponse
    {
        $document->delete();
        return response()->json(['message' => 'Demande supprimée.']);
    }
}
