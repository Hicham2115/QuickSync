"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  FileText, Download, Clock, CheckCircle, XCircle,
  Plus, X, Briefcase, BadgeDollarSign, Trash2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EmpAvatar } from "./shared/EmpAvatar";

/* ── types ───────────────────────────────────────────── */
interface DocRequest {
  id: number;
  user_id: number;
  employee_name: string;
  dept: string;
  job_title: string;
  hired_date: string;
  type: "attestation_travail" | "attestation_salaire";
  status: "en_attente" | "approuve" | "refuse";
  admin_note: string | null;
  created_at: string;
}

/* ── helpers ─────────────────────────────────────────── */
const TYPE_LABEL: Record<DocRequest["type"], string> = {
  attestation_travail:  "Attestation de travail",
  attestation_salaire:  "Attestation de salaire",
};

const STATUS_META = {
  en_attente: { label: "En attente",  bg: "#FEF3E2", color: "#92400E", icon: Clock },
  approuve:   { label: "Approuvée",   bg: "#EDFAF3", color: "#2E7D5B", icon: CheckCircle },
  refuse:     { label: "Refusée",     bg: "#FEF0EE", color: "#B4453A", icon: XCircle },
};

function StatusBadge({ status }: { status: DocRequest["status"] }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[11px] font-medium" style={{ background: m.bg, color: m.color }}>
      <Icon size={11} aria-hidden="true" /> {m.label}
    </span>
  );
}

/* ── PDF generation ──────────────────────────────────── */
async function generatePDF(doc: DocRequest) {
  const { default: jsPDF } = await import("jspdf");

  const pdf        = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W          = 210;
  const H          = 297;
  const STRIPE     = 8;    // left gold stripe width
  const LM         = STRIPE + 16; // left text margin
  const RM         = W - 18;
  const today      = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const year       = new Date().getFullYear();
  const ref        = `ATT-${year}-${String(doc.id).padStart(4, "0")}`;
  const isSalaire  = doc.type === "attestation_salaire";
  const docTitle   = isSalaire ? "ATTESTATION DE SALAIRE" : "ATTESTATION DE TRAVAIL";

  // ── Left gold stripe
  pdf.setFillColor(180, 134, 47);
  pdf.rect(0, 0, STRIPE, H, "F");

  // ── Top accent line (dark navy)
  pdf.setFillColor(19, 27, 44);
  pdf.rect(STRIPE, 0, W - STRIPE, 3, "F");

  // ── Company header
  let y = 22;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(19, 27, 44);
  pdf.text("AUREA HR", LM, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 110);
  y += 6;
  pdf.text("Système de Gestion des Ressources Humaines", LM, y);

  // Reference block (top right)
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 140);
  pdf.text(`Réf : ${ref}`, RM, 19, { align: "right" });
  pdf.text(`Émis le : ${today}`, RM, 25, { align: "right" });

  // Divider under header
  y = 35;
  pdf.setDrawColor(222, 222, 216);
  pdf.setLineWidth(0.4);
  pdf.line(LM, y, RM, y);

  // ── Document title
  y += 14;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.setTextColor(19, 27, 44);
  const titleX = LM + (RM - LM) / 2;
  pdf.text(docTitle, titleX, y, { align: "center" });

  // Gold underline below title
  const titleW = pdf.getTextWidth(docTitle);
  const tlx = titleX - titleW / 2;
  y += 3;
  pdf.setDrawColor(180, 134, 47);
  pdf.setLineWidth(1.2);
  pdf.line(tlx, y, tlx + titleW, y);

  // ── Intro paragraph
  y += 16;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(19, 27, 44);
  pdf.text("Nous soussignés, la Direction des Ressources Humaines de la société Aurea HR,", LM, y);
  y += 6.5;
  pdf.text("attestons par la présente que :", LM, y);

  // ── Employee info box
  y += 10;
  const rows: [string, string][] = [
    ["Nom complet",    doc.employee_name],
    ["Poste occupé",   doc.job_title   || "–"],
    ["Département",    doc.dept        || "–"],
    ["Date d'embauche", doc.hired_date  || "–"],
  ];
  if (isSalaire) rows.push(["Rémunération", "Selon contrat en vigueur"]);

  const ROW_H  = 10;
  const boxH   = rows.length * ROW_H + 6;
  const boxX   = LM;
  const boxW   = RM - LM;

  // Box background
  pdf.setFillColor(250, 249, 246);
  pdf.setDrawColor(222, 222, 216);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(boxX, y, boxW, boxH, 3, 3, "FD");

  // Gold left accent inside box
  pdf.setFillColor(203, 162, 74);
  pdf.roundedRect(boxX, y, 3, boxH, 1.5, 1.5, "F");

  const labelX = boxX + 8;
  const valX   = boxX + 58;
  let ry = y + ROW_H;

  rows.forEach(([label, value], idx) => {
    // Row separator (skip first)
    if (idx > 0) {
      pdf.setDrawColor(232, 232, 228);
      pdf.setLineWidth(0.3);
      pdf.line(boxX + 5, ry - ROW_H / 2 - 1, boxX + boxW - 5, ry - ROW_H / 2 - 1);
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(130, 130, 120);
    pdf.text(label.toUpperCase(), labelX, ry);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(19, 27, 44);
    pdf.text(value, valX, ry);
    ry += ROW_H;
  });

  y += boxH + 12;

  // ── Body paragraphs
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(19, 27, 44);
  const lineH = 6.5;

  if (isSalaire) {
    pdf.text("L'intéressé(e) perçoit une rémunération conformément aux dispositions contractuelles", LM, y);
    y += lineH;
    pdf.text("en vigueur au sein de notre entreprise, et ce depuis la date d'embauche mentionnée ci-dessus.", LM, y);
    y += lineH * 1.8;
  } else {
    pdf.text(`L'intéressé(e) est employé(e) au sein de la société Aurea HR en qualité de`, LM, y);
    y += lineH;
    pdf.setFont("helvetica", "bold");
    pdf.text(`${doc.job_title || "–"}, au département ${doc.dept || "–"},`, LM, y);
    pdf.setFont("helvetica", "normal");
    y += lineH;
    pdf.text("et ce depuis la date d'embauche mentionnée ci-dessus.", LM, y);
    y += lineH * 1.8;
  }

  pdf.text("La présente attestation est délivrée à l'intéressé(e) à sa demande et pour servir", LM, y);
  y += lineH;
  pdf.text("et valoir ce que de droit.", LM, y);

  // ── Signature block (right-aligned)
  y += 20;
  const sigW   = 72;
  const sigX   = RM - sigW;
  const sigH   = 52;

  // Box
  pdf.setFillColor(250, 249, 246);
  pdf.setDrawColor(222, 222, 216);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(sigX, y, sigW, sigH, 3, 3, "FD");

  // Title in box
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(19, 27, 44);
  pdf.text("Le/La Directeur(trice) des", sigX + sigW / 2, y + 9, { align: "center" });
  pdf.text("Ressources Humaines", sigX + sigW / 2, y + 15, { align: "center" });

  // Dashed stamp circle
  const cx = sigX + sigW / 2;
  const cy = y + 35;
  const cr = 11;
  pdf.setDrawColor(180, 180, 170);
  pdf.setLineWidth(0.5);
  // Approximate dashed circle with segments
  const segs = 24;
  for (let i = 0; i < segs; i += 2) {
    const a1 = (i / segs) * 2 * Math.PI;
    const a2 = ((i + 0.9) / segs) * 2 * Math.PI;
    pdf.line(cx + Math.cos(a1) * cr, cy + Math.sin(a1) * cr, cx + Math.cos(a2) * cr, cy + Math.sin(a2) * cr);
  }
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(180, 180, 170);
  pdf.text("CACHET", cx, cy + 2, { align: "center" });

  // Date line
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 110);
  pdf.text(`Fait le ${today}`, sigX + sigW / 2, y + sigH - 5, { align: "center" });

  // ── Footer
  const footY = H - 14;
  pdf.setFillColor(245, 244, 241);
  pdf.rect(STRIPE, footY - 4, W - STRIPE, 18, "F");
  pdf.setFontSize(7.5);
  pdf.setTextColor(160, 160, 150);
  pdf.text(
    `Aurea HR · Document officiel · Réf. ${ref} · Ce document est confidentiel et ne peut être reproduit sans autorisation.`,
    LM + (RM - LM) / 2,
    footY + 4,
    { align: "center" }
  );

  pdf.save(`${doc.type}_${doc.employee_name.replace(/\s+/g, "_")}_${ref}.pdf`);
}

/* ── Request modal ───────────────────────────────────── */
function RequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<DocRequest["type"] | "">("");

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        return (await api.post("/api/me/documents", { type })).data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-documents"] });
      toast.success("Demande envoyée. En attente de validation.");
      setType("");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleClose = () => { if (!mutation.isPending) { setType(""); onClose(); } };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16)" }}
      >
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}>
              <FileText size={16} style={{ color: "#0F1729" }} aria-hidden="true" />
            </div>
            <DialogTitle className="font-display text-[18px] font-medium text-ink-900" style={{ letterSpacing: "-0.01em" }}>
              Demander un document
            </DialogTitle>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 transition-colors cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <div className="px-7 py-6 flex flex-col gap-4">
          <p className="font-sans text-[13px] text-warm-500">Choisissez le type de document à demander. La RH vous informera dès validation.</p>

          <div className="grid grid-cols-1 gap-3">
            {([
              { value: "attestation_travail", label: "Attestation de travail", desc: "Certifie votre poste et ancienneté", Icon: Briefcase },
              { value: "attestation_salaire", label: "Attestation de salaire", desc: "Certifie votre rémunération actuelle", Icon: BadgeDollarSign },
            ] as const).map(({ value, label, desc, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all cursor-pointer"
                style={{
                  borderColor: type === value ? "#CBA24A" : "#DEDED8",
                  background:  type === value ? "#FDF8EE" : "#fff",
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: type === value ? "#CBA24A22" : "#F7F7F5" }}>
                  <Icon size={18} style={{ color: type === value ? "#947024" : "#76766C" }} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-ink-900">{label}</p>
                  <p className="font-sans text-[12px] text-warm-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-7 py-5 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
          <button type="button" onClick={handleClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={() => type && mutation.mutate()}
            disabled={!type || mutation.isPending}
            className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
          >
            {mutation.isPending ? "Envoi…" : "Envoyer la demande"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Approve / Refuse modal ──────────────────────────── */
function ReviewModal({ doc, onClose }: { doc: DocRequest | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: async (status: "approuve" | "refuse") => {
      try {
        return (await api.patch(`/api/documents/${doc!.id}/status`, { status, admin_note: note.trim() || null })).data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-documents"] });
      toast.success("Statut mis à jour.");
      setNote("");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleClose = () => { if (!mutation.isPending) { setNote(""); onClose(); } };

  return (
    <Dialog open={!!doc} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16)" }}
      >
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <DialogTitle className="font-display text-[18px] font-medium text-ink-900" style={{ letterSpacing: "-0.01em" }}>
            Traiter la demande
          </DialogTitle>
          <button onClick={handleClose} className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 transition-colors cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        {doc && (
          <div className="px-7 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#F7F7F5", border: "1px solid #DEDED8" }}>
              <EmpAvatar name={doc.employee_name} size={40} />
              <div>
                <p className="font-sans text-[14px] font-semibold text-ink-900">{doc.employee_name}</p>
                <p className="font-sans text-[12px] text-warm-500">{TYPE_LABEL[doc.type]}</p>
                <p className="font-sans text-[11px] text-warm-400">{doc.dept} · {doc.created_at}</p>
              </div>
            </div>

            <div>
              <label className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 block mb-1.5">Note (optionnel)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Raison du refus ou message pour l'employé…"
                className="w-full px-4 py-2.5 rounded-md border border-warm-300 font-sans text-[13px] text-ink-900 outline-none focus:border-ink-400 transition-colors"
              />
            </div>
          </div>
        )}

        <div className="px-7 py-5 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
          <button type="button" onClick={handleClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={() => mutation.mutate("refuse")}
            disabled={mutation.isPending}
            className="px-4 py-2.5 rounded-md font-sans text-[13px] font-medium border-none cursor-pointer disabled:opacity-50"
            style={{ background: "#FEF0EE", color: "#B4453A" }}
          >
            Refuser
          </button>
          <button
            onClick={() => mutation.mutate("approuve")}
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
          >
            {mutation.isPending ? "…" : "Approuver"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Employee view ───────────────────────────────────── */
function EmployeeDocuments() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: docs = [], isLoading } = useQuery<DocRequest[]>({
    queryKey: ["my-documents"],
    queryFn: async () => {
      try { return (await api.get("/api/me/documents")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    refetchInterval: 15_000,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>Mes documents</h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">Demandez et téléchargez vos attestations officielles.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-[13px] font-bold border-none cursor-pointer"
          style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
        >
          <Plus size={14} aria-hidden="true" /> Nouvelle demande
        </button>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F0F2F7" }}>
            <FileText size={24} color="#76766C" aria-hidden="true" />
          </div>
          <p className="font-display text-[17px] font-medium text-ink-700 mb-1">Aucune demande</p>
          <p className="font-sans text-[13px] text-warm-400">Cliquez sur "Nouvelle demande" pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white border border-warm-200 rounded-xl p-5 flex flex-col gap-3" style={{ boxShadow: "0 1px 3px rgba(15,23,41,.07)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF2F9" }}>
                    <FileText size={18} color="#2C3E63" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-ink-900">{TYPE_LABEL[doc.type]}</p>
                    <p className="font-sans text-[11px] text-warm-400">{doc.created_at}</p>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {doc.admin_note && (
                <p className="font-sans text-[12px] text-warm-500 px-3 py-2 rounded-lg" style={{ background: "#F7F7F5" }}>
                  {doc.admin_note}
                </p>
              )}

              {doc.status === "approuve" && (
                <button
                  onClick={() => generatePDF(doc)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-sans text-[13px] font-semibold transition-colors cursor-pointer border-none"
                  style={{ background: "#EDFAF3", color: "#2E7D5B" }}
                >
                  <Download size={14} aria-hidden="true" /> Télécharger le PDF
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <RequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

/* ── Admin / RH view ─────────────────────────────────── */
function AdminDocuments() {
  const queryClient = useQueryClient();
  const [reviewDoc, setReviewDoc] = useState<DocRequest | null>(null);
  const [filter, setFilter] = useState<"all" | DocRequest["status"]>("all");

  const { data: docs = [], isLoading } = useQuery<DocRequest[]>({
    queryKey: ["all-documents"],
    queryFn: async () => {
      try { return (await api.get("/api/documents")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    refetchInterval: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try { return (await api.delete(`/api/documents/${id}`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["all-documents"] }); toast.success("Supprimé."); },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = filter === "all" ? docs : docs.filter((d) => d.status === filter);
  const pending  = docs.filter((d) => d.status === "en_attente").length;

  const FILTERS: { value: typeof filter; label: string }[] = [
    { value: "all",        label: "Tous" },
    { value: "en_attente", label: "En attente" },
    { value: "approuve",   label: "Approuvées" },
    { value: "refuse",     label: "Refusées" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>Documents</h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">
            {pending > 0 ? <span><span className="font-semibold text-ink-700">{pending}</span> demande{pending > 1 ? "s" : ""} en attente</span> : "Toutes les demandes traitées."}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "#F0EFE9" }}>
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="px-3 py-1.5 rounded-md font-sans text-[12px] font-medium transition-all cursor-pointer border-none"
              style={{
                background: filter === value ? "#fff" : "transparent",
                color:      filter === value ? "#0F1729" : "#76766C",
                boxShadow:  filter === value ? "0 1px 3px rgba(15,23,41,.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
        <div className="hidden sm:grid px-5 py-3 bg-warm-50" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto", borderBottom: "1px solid #DEDED8" }}>
          {["EMPLOYÉ", "DOCUMENT", "DATE", "STATUT", ""].map((h) => (
            <span key={h} className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #DEDED8" }}>
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5"><Skeleton className="h-3 w-36" /><Skeleton className="h-2.5 w-24" /></div>
              <Skeleton className="h-3 w-24 shrink-0" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <FileText size={28} className="text-warm-200 mx-auto mb-2" aria-hidden="true" />
            <p className="font-sans text-[14px] text-warm-400">Aucune demande.</p>
          </div>
        ) : (
          filtered.map((doc, i) => (
            <div
              key={doc.id}
              className="px-5 py-3.5 hover:bg-warm-50 transition-colors"
              style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto", alignItems: "center", gap: "12px", borderBottom: i < filtered.length - 1 ? "1px solid #DEDED8" : "none" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <EmpAvatar name={doc.employee_name} size={36} />
                <div className="min-w-0">
                  <p className="font-sans text-[13px] font-semibold text-ink-900 truncate">{doc.employee_name}</p>
                  <p className="font-sans text-[11px] text-warm-400 truncate">{doc.dept}</p>
                </div>
              </div>

              <div>
                <p className="font-sans text-[13px] text-ink-700">{TYPE_LABEL[doc.type]}</p>
              </div>

              <p className="font-sans text-[12px] text-warm-500">{doc.created_at}</p>

              <StatusBadge status={doc.status} />

              <div className="flex items-center gap-1.5 shrink-0">
                {doc.status === "approuve" && (
                  <button
                    onClick={() => generatePDF(doc)}
                    title="Télécharger PDF"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border-none"
                    style={{ background: "#EDFAF3", color: "#2E7D5B" }}
                  >
                    <Download size={14} aria-hidden="true" />
                  </button>
                )}
                {doc.status === "en_attente" && (
                  <button
                    onClick={() => setReviewDoc(doc)}
                    className="px-3 py-1.5 rounded-lg font-sans text-[12px] font-medium cursor-pointer border-none transition-colors"
                    style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729" }}
                  >
                    Traiter
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(doc.id)}
                  disabled={deleteMutation.isPending}
                  title="Supprimer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:bg-red-50 hover:text-[#B4453A] transition-colors cursor-pointer border-none disabled:opacity-40"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ReviewModal doc={reviewDoc} onClose={() => setReviewDoc(null)} />
    </div>
  );
}

/* ── Export ──────────────────────────────────────────── */
export function Documents() {
  const role = useAuthStore((s) => s.user?.role ?? "employee");
  return role === "employee" ? <EmployeeDocuments /> : <AdminDocuments />;
}
