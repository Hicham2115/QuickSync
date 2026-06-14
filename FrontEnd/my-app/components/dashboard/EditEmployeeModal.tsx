"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { X, Pencil } from "lucide-react";
import { parse, format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import type { Employee } from "@/lib/mock/hr-data";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

interface EmployeeForm {
  name: string;
  email: string;
  dept: string;
  title: string;
  hired: string; // ISO "YYYY-MM-DD"
  status: "Actif" | "En congé" | "Inactif";
  leaves: number;
}

function toIso(hired: string): string {
  // API returns "20 Feb 2022" — convert to "2022-02-20"
  const d = parse(hired, "dd MMM yyyy", new Date(), { locale: fr });
  return isValid(d) ? format(d, "yyyy-MM-dd") : "";
}

export function EditEmployeeModal({ employee, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EmployeeForm | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeForm, string>>>({});

  useEffect(() => {
    if (employee) {
      setForm({
        name:   employee.name,
        email:  employee.email,
        dept:   employee.dept,
        title:  employee.title,
        hired:  toIso(employee.hired),
        status: employee.status,
        leaves: employee.leaves,
      });
      setErrors({});
    }
  }, [employee]);

  const set = <K extends keyof EmployeeForm>(field: K, value: EmployeeForm[K]) =>
    setForm((f) => f ? { ...f, [field]: value } : f);

  const validate = (): boolean => {
    if (!form) return false;
    const e: typeof errors = {};
    if (!form.name.trim())  e.name  = "Nom requis";
    if (!form.email.trim()) e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.dept.trim())  e.dept  = "Département requis";
    if (!form.title.trim()) e.title = "Poste requis";
    if (!form.hired)        e.hired = "Date requise";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (payload: EmployeeForm) => {
      try {
        const res = await api.put(`/api/employees/${employee!.id}`, payload);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employé mis à jour.");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate(form!);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose();
  };

  if (!form) return null;

  return (
    <Dialog open={!!employee} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
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
              style={{ background: "linear-gradient(140deg,#2C3E63,#1A253C)" }}
            >
              <Pencil size={15} style={{ color: "#fff" }} aria-hidden="true" />
            </div>
            <DialogTitle
              className="font-display text-[19px] font-medium text-ink-900"
              style={{ letterSpacing: "-0.01em" }}
            >
              Modifier l'employé
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
              <Field label="Nom complet" error={errors.name} required>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nadia Benjelloun" className={inputCls(!!errors.name)} />
              </Field>
              <Field label="Adresse email" error={errors.email} required>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="n.exemple@aurea.ma" className={inputCls(!!errors.email)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Département" error={errors.dept} required>
                <input value={form.dept} onChange={(e) => set("dept", e.target.value)} placeholder="Engineering" className={inputCls(!!errors.dept)} />
              </Field>
              <Field label="Poste" error={errors.title} required>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Lead Developer" className={inputCls(!!errors.title)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Field label="Date d'embauche" error={errors.hired} required>
                <AppDatePicker value={form.hired} onChange={(v) => set("hired", v)} error={!!errors.hired} />
              </Field>
              <Field label="Statut">
                <AppSelect
                  value={form.status}
                  onChange={(v) => set("status", v as EmployeeForm["status"])}
                  options={[
                    { value: "Actif",    label: "Actif" },
                    { value: "En congé", label: "En congé" },
                    { value: "Inactif",  label: "Inactif" },
                  ]}
                />
              </Field>
              <Field label="Jours de congés">
                <div className="flex items-center h-11 w-full rounded-md border border-warm-300 bg-white overflow-hidden focus-within:border-ink-400 transition-colors">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.leaves}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      set("leaves", v === "" ? 0 : Number(v));
                    }}
                    className="flex-1 h-full px-4 bg-transparent outline-none font-sans text-[14px] text-ink-900 appearance-none"
                  />
                  <div className="flex flex-col border-l border-warm-200 shrink-0">
                    <button type="button" onClick={() => set("leaves", form.leaves + 1)} className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer border-b border-warm-200">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2.5L9 7.5H1L5 2.5Z"/></svg>
                    </button>
                    <button type="button" onClick={() => set("leaves", Math.max(0, form.leaves - 1))} className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 7.5L1 2.5H9L5 7.5Z"/></svg>
                    </button>
                  </div>
                </div>
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
            <button type="button" onClick={handleClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60 transition-opacity" style={{ background: "linear-gradient(140deg,#2C3E63,#1A253C)", color: "#fff", boxShadow: "0 2px 10px rgba(44,62,99,.28)" }}>
              {mutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
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
