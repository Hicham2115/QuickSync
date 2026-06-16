"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { X, ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, inputCls } from "@/components/dashboard/shared/ModalFormField";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type Role = "rh" | "employee";

interface AccountForm {
  CompleteName: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Role;
}

const EMPTY: AccountForm = {
  CompleteName: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "employee",
};

const ROLES: { value: Role; label: string; desc: string; bg: string; color: string }[] = [
  {
    value: "employee",
    label: "Employé",
    desc: "Consultation et demandes de congés",
    bg: "#EEF2F9",
    color: "#2C3E63",
  },
  {
    value: "rh",
    label: "RH",
    desc: "Gestion des congés et du personnel",
    bg: "#EDFAF3",
    color: "#2E7D5B",
  },
];

export function CreateAccountModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<AccountForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AccountForm, string>>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = <K extends keyof AccountForm>(field: K, value: AccountForm[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.CompleteName.trim()) e.CompleteName = "Nom requis";
    if (!form.email.trim()) e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    else if (form.password.length < 8) e.password = "8 caractères minimum";
    if (!form.password_confirmation) e.password_confirmation = "Confirmation requise";
    else if (form.password !== form.password_confirmation)
      e.password_confirmation = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (payload: AccountForm) => {
      try {
        const res = await api.post("/api/admin/create-account", payload);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la création.");
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Compte créé. Un email de vérification a été envoyé.");
      setForm(EMPTY);
      setErrors({});
      onCreated?.();
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
    setShowPwd(false);
    setShowConfirm(false);
    onClose();
  };

  const selected = ROLES.find((r) => r.value === form.role)!;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
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
              <ShieldCheck size={16} style={{ color: "#fff" }} aria-hidden="true" />
            </div>
            <div>
              <DialogTitle
                className="font-display text-[17px] font-medium text-ink-900 leading-tight"
                style={{ letterSpacing: "-0.01em" }}
              >
                Créer un compte
              </DialogTitle>
              <p className="font-sans text-[12px] text-warm-500 mt-0.5">
                Un email de vérification sera envoyé automatiquement
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer shrink-0"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-6 flex flex-col gap-5">

            {/* Role picker cards */}
            <div>
              <p className="font-sans text-[12px] font-semibold text-ink-900 mb-2.5">Rôle du compte</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const active = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set("role", r.value)}
                      className="rounded-xl p-4 text-left transition-all cursor-pointer border"
                      style={{
                        borderColor: active ? r.color : "#DEDED8",
                        background: active ? r.bg : "#fff",
                        boxShadow: active ? `0 0 0 1.5px ${r.color}` : "none",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-sans text-[13px] font-semibold" style={{ color: r.color }}>
                          {r.label}
                        </p>
                        <span
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{
                            borderColor: active ? r.color : "#DEDED8",
                            background: active ? r.color : "transparent",
                          }}
                        >
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-warm-500 leading-snug">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
              <p className="font-sans text-[11px] text-warm-400 mt-2">
                Rôle sélectionné :{" "}
                <span className="font-semibold" style={{ color: selected.color }}>
                  {selected.label}
                </span>
              </p>
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Nom complet" error={errors.CompleteName} required>
                <input
                  value={form.CompleteName}
                  onChange={(e) => set("CompleteName", e.target.value)}
                  placeholder="Nadia Benjelloun"
                  className={inputCls(!!errors.CompleteName)}
                />
              </Field>
              <Field label="Adresse email" error={errors.email} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="n.exemple@aurea.ma"
                  className={inputCls(!!errors.email)}
                />
              </Field>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Mot de passe" error={errors.password} required>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="8 caractères minimum"
                    className={`${inputCls(!!errors.password)} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-ink-700 transition-colors cursor-pointer"
                  >
                    {showPwd ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirmer le mot de passe" error={errors.password_confirmation} required>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={(e) => set("password_confirmation", e.target.value)}
                    placeholder="Répéter le mot de passe"
                    className={`${inputCls(!!errors.password_confirmation)} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-ink-700 transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                  </button>
                </div>
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-7 py-5 flex items-center justify-end gap-3"
            style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60 transition-opacity"
              style={{
                background: "linear-gradient(140deg,#2C3E63,#1A253C)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(44,62,99,.28)",
              }}
            >
              {mutation.isPending ? "Création…" : "Créer le compte"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
