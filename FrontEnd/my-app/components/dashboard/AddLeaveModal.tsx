"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { X, CalendarPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppDatePicker } from "@/components/ui/AppDatePicker";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface LeaveForm {
  employee: string;
  dept: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
}

const EMPTY: LeaveForm = { employee: "", dept: "", type: "", from: "", to: "", days: 1, reason: "" };

const TYPE_OPTIONS = [
  { value: "Annuel",     label: "Annuel" },
  { value: "Maladie",    label: "Maladie" },
  { value: "Sans solde", label: "Sans solde" },
  { value: "Maternité",  label: "Maternité" },
  { value: "Paternité",  label: "Paternité" },
  { value: "Autre",      label: "Autre" },
];

export function AddLeaveModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LeaveForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof LeaveForm, string>>>({});

  const set = <K extends keyof LeaveForm>(field: K, value: LeaveForm[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.employee.trim()) e.employee = "Nom requis";
    if (!form.dept.trim())     e.dept     = "Département requis";
    if (!form.type)            e.type     = "Type requis";
    if (!form.from)            e.from     = "Date de début requise";
    if (!form.to)              e.to       = "Date de fin requise";
    if (form.days < 1)         e.days     = "Minimum 1 jour";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (payload: LeaveForm) => {
      try {
        const res = await api.post("/api/leaves", payload);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la création.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Demande de congé créée.");
      setForm(EMPTY);
      setErrors({});
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate(form);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16), 0 4px 12px rgba(15,23,41,.08)" }}
      >
        {/* Header */}
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}
            >
              <CalendarPlus size={15} style={{ color: "#0F1729" }} aria-hidden="true" />
            </div>
            <DialogTitle
              className="font-display text-[19px] font-medium text-ink-900"
              style={{ letterSpacing: "-0.01em" }}
            >
              Nouvelle demande de congé
            </DialogTitle>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer shrink-0"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-7 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Nom de l'employé" error={errors.employee} required>
                <input
                  value={form.employee}
                  onChange={(e) => set("employee", e.target.value)}
                  placeholder="Nadia Benjelloun"
                  className={inputCls(!!errors.employee)}
                />
              </Field>
              <Field label="Département" error={errors.dept} required>
                <input
                  value={form.dept}
                  onChange={(e) => set("dept", e.target.value)}
                  placeholder="Finance"
                  className={inputCls(!!errors.dept)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Field label="Type de congé" error={errors.type} required>
                <AppSelect
                  value={form.type}
                  onChange={(v) => set("type", v)}
                  placeholder="Sélectionner"
                  options={TYPE_OPTIONS}
                  error={!!errors.type}
                />
              </Field>
              <Field label="Date de début" error={errors.from} required>
                <AppDatePicker value={form.from} onChange={(v) => set("from", v)} error={!!errors.from} />
              </Field>
              <Field label="Date de fin" error={errors.to} required>
                <AppDatePicker value={form.to} onChange={(v) => set("to", v)} error={!!errors.to} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Nombre de jours" error={errors.days} required>
                <div className="flex items-center h-11 w-full rounded-md border border-warm-300 bg-white overflow-hidden focus-within:border-ink-400 transition-colors">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.days}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      set("days", v === "" ? 1 : Number(v));
                    }}
                    className="flex-1 h-full px-4 bg-transparent outline-none font-sans text-[14px] text-ink-900 appearance-none"
                  />
                  <div className="flex flex-col border-l border-warm-200 shrink-0">
                    <button type="button" onClick={() => set("days", form.days + 1)} className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer border-b border-warm-200">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2.5L9 7.5H1L5 2.5Z"/></svg>
                    </button>
                    <button type="button" onClick={() => set("days", Math.max(1, form.days - 1))} className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 7.5L1 2.5H9L5 7.5Z"/></svg>
                    </button>
                  </div>
                </div>
              </Field>
              <Field label="Motif">
                <input
                  value={form.reason}
                  onChange={(e) => set("reason", e.target.value)}
                  placeholder="Raison de la demande (optionnel)"
                  className={inputCls(false)}
                />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
            <button type="button" onClick={handleClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60 transition-opacity" style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}>
              {mutation.isPending ? "Envoi…" : "Soumettre la demande"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-widest text-warm-500">
        {label}{required && <span style={{ color: "#B4453A" }}>*</span>}
      </label>
      {children}
      {error && <p className="font-sans text-[11px]" style={{ color: "#B4453A" }}>{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    "h-11 w-full px-4 rounded-md border font-sans text-[14px] text-ink-900",
    "outline-none transition-colors bg-white appearance-none placeholder:text-warm-300",
    hasError ? "border-[#B4453A] focus:border-[#B4453A]" : "border-warm-300 focus:border-ink-400",
  ].join(" ");
}
