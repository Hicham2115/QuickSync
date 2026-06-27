"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  GraduationCap, Plus, X, Trash2,
  CheckCircle2, Clock, AlertTriangle, Pencil,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { Field, inputCls } from "@/components/dashboard/shared/ModalFormField";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { Employee } from "@/lib/mock/hr-data";

/* ── types ───────────────────────────────────────────── */
interface Training {
  id: number;
  name: string;
  provider: string | null;
  started_at: string | null;
  completed_at: string | null;
  expiry_date: string | null;
  status: "en_cours" | "complété" | "expiré";
  notes: string | null;
}

type TrainingForm = Omit<Training, "id">;

const EMPTY_FORM: TrainingForm = {
  name: "", provider: "", started_at: null,
  completed_at: null, expiry_date: null,
  status: "en_cours", notes: "",
};

const STATUS_META = {
  en_cours: { label: "En cours",  bg: "#EEF2FF", color: "#3730A3", icon: Clock },
  complété: { label: "Complété",  bg: "#EDFAF3", color: "#2E7D5B", icon: CheckCircle2 },
  expiré:   { label: "Expiré",    bg: "#FEF0EE", color: "#B4453A", icon: AlertTriangle },
};

function StatusBadge({ status }: { status: Training["status"] }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[11px] font-medium" style={{ background: m.bg, color: m.color }}>
      <Icon size={11} aria-hidden="true" /> {m.label}
    </span>
  );
}

/* ── Training Form Modal ─────────────────────────────── */
function TrainingModal({ open, onClose, employeeId, editing }: {
  open: boolean; onClose: () => void; employeeId: number; editing: Training | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TrainingForm>(editing ? {
    name: editing.name, provider: editing.provider ?? "",
    started_at: editing.started_at, completed_at: editing.completed_at,
    expiry_date: editing.expiry_date, status: editing.status, notes: editing.notes ?? "",
  } : EMPTY_FORM);

  const set = <K extends keyof TrainingForm>(k: K, v: TrainingForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (payload: TrainingForm) => {
      try {
        if (editing) return (await api.put(`/api/employees/${employeeId}/trainings/${editing.id}`, payload)).data;
        return (await api.post(`/api/employees/${employeeId}/trainings`, payload)).data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings", employeeId] });
      toast.success(editing ? "Formation mise à jour." : "Formation ajoutée.");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16)" }}
      >
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "linear-gradient(140deg,#6366F1,#4338CA)" }}>
              <GraduationCap size={16} color="#fff" aria-hidden="true" />
            </div>
            <DialogTitle className="font-display text-[18px] font-medium text-ink-900" style={{ letterSpacing: "-0.01em" }}>
              {editing ? "Modifier la formation" : "Ajouter une formation"}
            </DialogTitle>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }}>
          <div className="px-7 py-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Intitulé de la formation" required>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Formation React Avancé" className={inputCls(false)} required />
              </Field>
              <Field label="Organisme / Prestataire">
                <input value={form.provider ?? ""} onChange={e => set("provider", e.target.value)} placeholder="Coursera, OFPPT…" className={inputCls(false)} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Date de début">
                <AppDatePicker value={form.started_at ?? ""} onChange={v => set("started_at", v || null)} placeholder="jj/mm/aaaa" />
              </Field>
              <Field label="Date de fin">
                <AppDatePicker value={form.completed_at ?? ""} onChange={v => set("completed_at", v || null)} placeholder="jj/mm/aaaa" />
              </Field>
              <Field label="Date d'expiration">
                <AppDatePicker value={form.expiry_date ?? ""} onChange={v => set("expiry_date", v || null)} placeholder="jj/mm/aaaa" />
              </Field>
            </div>
            <Field label="Statut">
              <AppSelect
                value={form.status}
                onChange={v => set("status", v as Training["status"])}
                options={[
                  { value: "en_cours", label: "En cours" },
                  { value: "complété", label: "Complété" },
                  { value: "expiré",   label: "Expiré" },
                ]}
              />
            </Field>
            <Field label="Notes">
              <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Observations…" className={`${inputCls(false)} resize-none`} />
            </Field>
          </div>

          <div className="px-7 py-5 flex justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
            <button type="button" onClick={onClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60" style={{ background: "linear-gradient(140deg,#6366F1,#4338CA)", color: "#fff", boxShadow: "0 2px 10px rgba(99,102,241,.28)" }}>
              {mutation.isPending ? "Enregistrement…" : editing ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main component ──────────────────────────────────── */
export function Formations() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "rh";
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      try { return (await api.get("/api/employees")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    enabled: isAdmin,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Training | null>(null);
  const empId = selectedEmployee?.id;

  const { data: trainings = [], isLoading: loadingTrainings } = useQuery<Training[]>({
    queryKey: ["trainings", empId],
    queryFn: async () => {
      try { return (await api.get(`/api/employees/${empId}/trainings`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    enabled: !!empId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try { return (await api.delete(`/api/employees/${empId}/trainings/${id}`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings", empId] });
      toast.success("Formation supprimée.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-7 flex flex-col items-center justify-center gap-3 py-32 text-warm-400">
        <GraduationCap size={40} aria-hidden="true" />
        <p className="font-sans text-sm">Accès réservé aux RH et administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>
            Formations & Certifications
          </h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">
            Gérez les formations et certifications des employés
          </p>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — employee list */}
        <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}>
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">Employés</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {loadingEmployees ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5" style={{ borderBottom: "1px solid #F0EFE9" }}>
                  <Skeleton className="h-3.5 w-32 mb-1.5" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              ))
            ) : employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="w-full text-left px-5 py-3.5 transition-colors hover:bg-warm-50 cursor-pointer"
                style={{
                  borderBottom: "1px solid #F0EFE9",
                  background: selectedEmployee?.id === emp.id ? "#F4F4F0" : undefined,
                  borderLeft: selectedEmployee?.id === emp.id ? "3px solid #6366F1" : "3px solid transparent",
                }}
              >
                <p className="font-sans text-[13px] font-semibold text-ink-900">{emp.name}</p>
                <p className="font-sans text-[11px] text-warm-400 mt-0.5">{emp.title} · {emp.dept}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right — trainings panel */}
        <div className="lg:col-span-2 bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          {!selectedEmployee ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-warm-300 py-32">
              <GraduationCap size={36} aria-hidden="true" />
              <p className="font-sans text-[13px]">Sélectionnez un employé</p>
            </div>
          ) : (
            <>
              {/* Panel header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-ink-900">{selectedEmployee.name}</p>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-warm-400 mt-0.5">
                    {trainings.length} formation{trainings.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => { setEditing(null); setModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-[13px] font-bold border-none cursor-pointer"
                  style={{ background: "linear-gradient(140deg,#6366F1,#4338CA)", color: "#fff", boxShadow: "0 2px 10px rgba(99,102,241,.24)" }}
                >
                  <Plus size={14} aria-hidden="true" /> Ajouter
                </button>
              </div>

              {/* Trainings list */}
              <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {loadingTrainings ? (
                  <div className="p-6 flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                  </div>
                ) : trainings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-20 text-warm-300">
                    <GraduationCap size={30} aria-hidden="true" />
                    <p className="font-sans text-[13px]">Aucune formation enregistrée</p>
                  </div>
                ) : (
                  <div className="divide-y divide-warm-100">
                    {trainings.map(t => (
                      <div key={t.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-warm-50 transition-colors">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans text-[14px] font-semibold text-ink-900">{t.name}</span>
                            <StatusBadge status={t.status} />
                          </div>
                          {t.provider && (
                            <p className="font-sans text-[12px] text-warm-500">{t.provider}</p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-0.5">
                            {t.started_at   && <span className="font-mono text-[10px] text-warm-400">Début : {t.started_at}</span>}
                            {t.completed_at && <span className="font-mono text-[10px] text-warm-400">Fin : {t.completed_at}</span>}
                            {t.expiry_date  && <span className="font-mono text-[10px] text-warm-400">Expire : {t.expiry_date}</span>}
                          </div>
                          {t.notes && (
                            <p className="font-sans text-[12px] text-warm-400 italic">{t.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditing(t); setModalOpen(true); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer"
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(t.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:bg-red-50 hover:text-[#B4453A] transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen && empId && (
        <TrainingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          employeeId={empId}
          editing={editing}
        />
      )}
    </div>
  );
}
