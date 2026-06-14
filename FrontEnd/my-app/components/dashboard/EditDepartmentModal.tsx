"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { X, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Department } from "@/lib/mock/hr-data";

interface Props {
  department: Department | null;
  onClose: () => void;
}

interface DeptForm {
  name: string;
  head: string;
  count: number;
  active: number;
  color: string;
}

const PRESET_COLORS = [
  "#4E6BA6","#2E7D5B","#6B5EA8","#8B5E3C",
  "#B4862F","#3C6B8B","#7B5EA8","#4A7C6B",
  "#B4453A","#2C3E63","#76766C","#947024",
];

export function EditDepartmentModal({ department, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DeptForm | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof DeptForm, string>>>({});

  useEffect(() => {
    if (department) {
      setForm({
        name:   department.name,
        head:   department.head,
        count:  department.count,
        active: department.active,
        color:  department.color,
      });
      setErrors({});
    }
  }, [department]);

  const set = <K extends keyof DeptForm>(field: K, value: DeptForm[K]) =>
    setForm((f) => f ? { ...f, [field]: value } : f);

  const validate = (): boolean => {
    if (!form) return false;
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!form.head.trim()) e.head = "Responsable requis";
    if (form.active > form.count) e.active = "Ne peut pas dépasser l'effectif total";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (payload: DeptForm) => {
      try {
        const res = await api.put(`/api/departments/${department!.id}`, payload);
        return res.data as Department;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Département mis à jour.");
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
    <Dialog open={!!department} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16), 0 4px 12px rgba(15,23,41,.08)" }}
      >
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(140deg,#2C3E63,#1A253C)" }}>
              <Building2 size={15} style={{ color: "#fff" }} aria-hidden="true" />
            </div>
            <DialogTitle className="font-display text-[19px] font-medium text-ink-900" style={{ letterSpacing: "-0.01em" }}>
              Modifier le département
            </DialogTitle>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer shrink-0">
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-7 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Nom du département" error={errors.name} required>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(!!errors.name)} />
              </Field>
              <Field label="Responsable" error={errors.head} required>
                <input value={form.head} onChange={(e) => set("head", e.target.value)} className={inputCls(!!errors.head)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Field label="Effectif total" error={errors.count}>
                <NumInput value={form.count} onChange={(v) => set("count", v)} />
              </Field>
              <Field label="Employés actifs" error={errors.active}>
                <NumInput value={form.active} onChange={(v) => set("active", v)} />
              </Field>
            </div>

            <Field label="Couleur du département">
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    className="w-8 h-8 rounded-md border-2 transition-all cursor-pointer shrink-0"
                    style={{
                      background: c,
                      borderColor: form.color === c ? "#0F1729" : "transparent",
                      boxShadow: form.color === c ? "0 0 0 1px #0F1729" : "none",
                    }}
                    aria-label={c}
                  />
                ))}
                <label className="w-8 h-8 rounded-md border border-warm-200 flex items-center justify-center cursor-pointer overflow-hidden relative shrink-0" title="Couleur personnalisée">
                  <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <span className="w-4 h-4 rounded-sm border border-warm-300" style={{ background: form.color }} />
                </label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded" style={{ background: form.color }} />
                <span className="font-mono text-[11px] text-warm-500">{form.color.toUpperCase()}</span>
              </div>
            </Field>
          </div>

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

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center h-11 w-full rounded-md border border-warm-300 bg-white overflow-hidden focus-within:border-ink-400 transition-colors">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          onChange(v === "" ? 0 : Number(v));
        }}
        className="flex-1 h-full px-4 bg-transparent outline-none font-sans text-[14px] text-ink-900 appearance-none"
      />
      <div className="flex flex-col border-l border-warm-200 shrink-0">
        <button type="button" onClick={() => onChange(value + 1)} className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer border-b border-warm-200">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2.5L9 7.5H1L5 2.5Z"/></svg>
        </button>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 7.5L1 2.5H9L5 7.5Z"/></svg>
        </button>
      </div>
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
