"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { X, CalendarPlus, Paperclip, FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { Field, NumInput } from "@/components/dashboard/shared/ModalFormField";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Form {
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
}

const EMPTY: Form = { type: "", from: "", to: "", days: 1, reason: "" };

const TYPE_OPTIONS = [
  { value: "Annuel",     label: "Annuel" },
  { value: "Maladie",    label: "Maladie" },
  { value: "Sans solde", label: "Sans solde" },
  { value: "Maternité",  label: "Maternité" },
  { value: "Paternité",  label: "Paternité" },
  { value: "Autre",      label: "Autre" },
];

const ACCEPTED = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
const MAX_MB = 5;

export function MyLeaveModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Form>(field: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFileError("");
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`Fichier trop volumineux (max ${MAX_MB} Mo)`);
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.type)         e.type   = "Type requis";
    if (!form.from)         e.from   = "Date de début requise";
    if (!form.to)           e.to     = "Date de fin requise";
    if (form.days < 1)      e.days   = "Minimum 1 jour";
    if (!form.reason.trim()) e.reason = "Motif requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (payload: Form) => {
      try {
        const body = new FormData();
        Object.entries(payload).forEach(([k, v]) => body.append(k, String(v)));
        if (file) body.append("attachment", file);
        const res = await api.post("/api/me/leaves", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la demande.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["my-balance"] });
      toast.success("Demande soumise. En attente d'approbation.");
      setForm(EMPTY);
      setFile(null);
      setErrors({});
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    setForm(EMPTY);
    setFile(null);
    setErrors({});
    setFileError("");
    onClose();
  };

  const fmtSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} Ko`
      : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16), 0 4px 12px rgba(15,23,41,.08)" }}
      >
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}
            >
              <CalendarPlus size={16} style={{ color: "#0F1729" }} aria-hidden="true" />
            </div>
            <div>
              <DialogTitle
                className="font-display text-[17px] font-medium text-ink-900 leading-tight"
                style={{ letterSpacing: "-0.01em" }}
              >
                Nouvelle demande de congé
              </DialogTitle>
              <p className="font-sans text-[12px] text-warm-500 mt-0.5">Soumise pour approbation RH</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer shrink-0"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); if (validate()) mutation.mutate(form); }}>
          <div className="px-7 py-6 flex flex-col gap-5">

            <Field label="Type de congé" error={errors.type} required>
              <AppSelect
                value={form.type}
                onChange={(v) => set("type", v)}
                placeholder="Sélectionner un type"
                options={TYPE_OPTIONS}
                error={!!errors.type}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Date de début" error={errors.from} required>
                <AppDatePicker value={form.from} onChange={(v) => set("from", v)} placeholder="Sélectionner" error={!!errors.from} />
              </Field>
              <Field label="Date de fin" error={errors.to} required>
                <AppDatePicker value={form.to} onChange={(v) => set("to", v)} placeholder="Sélectionner" error={!!errors.to} />
              </Field>
            </div>

            <Field label="Nombre de jours" error={errors.days}>
              <NumInput value={form.days} onChange={(v) => set("days", v)} min={1} />
            </Field>

            <Field label="Motif" error={errors.reason} required>
              <textarea
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
                placeholder="Décrivez la raison de votre demande…"
                rows={3}
                className={[
                  "w-full px-4 py-3 rounded-md border font-sans text-[14px] text-ink-900 outline-none transition-colors bg-white resize-none placeholder:text-warm-300",
                  errors.reason ? "border-[#B4453A]" : "border-warm-300 focus:border-ink-400",
                ].join(" ")}
              />
            </Field>

            {/* File upload */}
            <div>
              <label className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-widest text-warm-500 mb-1.5">
                Pièce jointe
                <span className="font-sans text-[10px] normal-case tracking-normal text-warm-400 ml-1">(PDF, Word, image — max {MAX_MB} Mo)</span>
              </label>

              {file ? (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-md border border-warm-200 bg-warm-50"
                >
                  <FileText size={18} color="#2C3E63" aria-hidden="true" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[13px] font-medium text-ink-900 truncate">{file.name}</p>
                    <p className="font-sans text-[11px] text-warm-400">{fmtSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:text-[#B4453A] hover:bg-[#F8E5E2] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-dashed border-warm-300 bg-white font-sans text-[13px] text-warm-500 hover:border-warm-400 hover:bg-warm-50 transition-colors cursor-pointer"
                >
                  <Paperclip size={14} aria-hidden="true" />
                  Joindre un document
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFile}
                className="hidden"
              />
              {fileError && (
                <p className="font-sans text-[11px] mt-1" style={{ color: "#B4453A" }}>{fileError}</p>
              )}
            </div>
          </div>

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
              className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
            >
              {mutation.isPending ? "Envoi…" : "Soumettre la demande"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
