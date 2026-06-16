"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Field, NumInput, inputCls } from "@/components/dashboard/shared/ModalFormField";
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
  phone: string;
  bio: string;
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

  const { data: departments = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      try { return (await api.get("/api/departments")).data; }
      catch { return []; }
    },
    staleTime: 30_000,
  });
  const deptOptions = departments.map((d) => ({ value: d.name, label: d.name }));

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
        phone:  employee.phone ?? "",
        bio:    employee.bio ?? "",
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
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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
          <div className="px-8 py-7 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
            {/* Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Nom complet" error={errors.name} required>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nadia Benjelloun" className={inputCls(!!errors.name)} />
              </Field>
              <Field label="Adresse email" error={errors.email} required>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="n.exemple@aurea.ma" className={inputCls(!!errors.email)} />
              </Field>
            </div>

            {/* Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Département" error={errors.dept} required>
                <AppSelect
                  value={form.dept}
                  onChange={(v) => set("dept", v)}
                  placeholder="Sélectionner un département"
                  options={deptOptions}
                  error={!!errors.dept}
                />
              </Field>
              <Field label="Poste" error={errors.title} required>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Lead Developer" className={inputCls(!!errors.title)} />
              </Field>
            </div>

            {/* Contract */}
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
                <NumInput value={form.leaves} onChange={(v) => set("leaves", v)} />
              </Field>
            </div>

            {/* Contact */}
            <div
              className="rounded-md px-5 py-4 flex flex-col gap-4"
              style={{ background: "#F7F7F5", border: "1px solid #DEDED8" }}
            >
              <p className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">
                Informations de contact
              </p>
              <Field label="Téléphone" error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className={inputCls(!!errors.phone)}
                />
              </Field>
              <Field label="Bio / Notes">
                <textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Quelques mots sur cet employé…"
                  rows={3}
                  className={`${inputCls(false)} resize-none`}
                />
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
