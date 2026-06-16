"use client";

import { X, CalendarDays, Clock, FileText, MessageSquare, Download, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "./shared/StatusBadge";
import { EmpAvatar } from "./shared/EmpAvatar";

interface LeaveDetail {
  id: number;
  employee?: string;
  dept?: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: "en_attente" | "approuve" | "refuse";
  reason?: string;
  attachment?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  leave: LeaveDetail | null;
  open: boolean;
  onClose: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  Annuel:      "#2C3E63",
  Maladie:     "#2E7D5B",
  "Sans solde":"#76766C",
  Maternité:   "#6B5EA8",
  Paternité:   "#4A7C6B",
  Autre:       "#947024",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">{label}</span>
      <div className="font-sans text-[13px] font-medium text-ink-900">{children}</div>
    </div>
  );
}

export function LeaveDetailModal({ leave, open, onClose }: Props) {
  if (!leave) return null;

  const typeColor = TYPE_COLOR[leave.type] ?? "#76766C";
  const fileName = leave.attachment?.split("/").pop() ?? leave.attachment ?? "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16), 0 4px 12px rgba(15,23,41,.08)" }}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ background: typeColor }}
            >
              <CalendarDays size={16} color="#fff" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle
                className="font-display text-[17px] font-medium text-ink-900 leading-tight"
                style={{ letterSpacing: "-0.01em" }}
              >
                Détails du congé
              </DialogTitle>
              <p className="font-sans text-[12px] text-warm-500 mt-0.5">
                Demande #{leave.id}
                {leave.created_at && ` · Soumis le ${leave.created_at}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer shrink-0"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Employee info (shown when available) */}
          {leave.employee && (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#F7F7F5" }}>
              <EmpAvatar name={leave.employee} size={40} />
              <div className="min-w-0">
                <p className="font-sans text-[14px] font-semibold text-ink-900 leading-tight truncate">{leave.employee}</p>
                {leave.dept && (
                  <p className="font-sans text-[12px] text-warm-400 mt-0.5">{leave.dept}</p>
                )}
              </div>
            </div>
          )}

          {/* Status + type */}
          <div className="flex items-center gap-3">
            <StatusBadge status={leave.status} />
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full font-sans text-[11px] font-semibold"
              style={{ background: `${typeColor}18`, color: typeColor }}
            >
              {leave.type}
            </span>
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-2 gap-4">
            <Row label="Date de début">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} color={typeColor} aria-hidden="true" />
                {leave.from}
              </span>
            </Row>
            <Row label="Date de fin">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} color={typeColor} aria-hidden="true" />
                {leave.to}
              </span>
            </Row>
            <Row label="Durée">
              <span className="flex items-center gap-1.5">
                <Clock size={12} color="#76766C" aria-hidden="true" />
                {leave.days} jour{leave.days !== 1 ? "s" : ""}
              </span>
            </Row>
            {leave.updated_at && (
              <Row label="Dernière mise à jour">
                <span className="text-warm-500 font-normal">{leave.updated_at}</span>
              </Row>
            )}
          </div>

          {/* Reason */}
          {leave.reason ? (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare size={12} color="#76766C" aria-hidden="true" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">Motif</span>
              </div>
              <p
                className="font-sans text-[13px] text-ink-700 leading-relaxed px-3.5 py-3 rounded-md"
                style={{ background: "#F7F7F5", borderLeft: `3px solid ${typeColor}` }}
              >
                {leave.reason}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warm-400">
              <MessageSquare size={12} aria-hidden="true" />
              <span className="font-sans text-[12px]">Aucun motif renseigné</span>
            </div>
          )}

          {/* Attachment */}
          {leave.attachment ? (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={12} color="#76766C" aria-hidden="true" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">Pièce jointe</span>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${leave.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-md border border-warm-200 hover:bg-warm-50 transition-colors cursor-pointer no-underline"
              >
                <FileText size={18} color="#2C3E63" aria-hidden="true" className="shrink-0" />
                <span className="flex-1 font-sans text-[13px] text-ink-900 truncate">{fileName}</span>
                <Download size={13} color="#76766C" aria-hidden="true" className="shrink-0" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warm-400">
              <FileText size={12} aria-hidden="true" />
              <span className="font-sans text-[12px]">Aucune pièce jointe</span>
            </div>
          )}
        </div>

        <div
          className="px-6 py-4 flex justify-end"
          style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
