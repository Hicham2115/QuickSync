"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  Megaphone, Plus, X, Trash2, Info, AlertTriangle, CalendarDays,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/* ── types ───────────────────────────────────────────── */
interface Annonce {
  id: number;
  author_name: string;
  title: string;
  body: string;
  type: "info" | "urgent" | "event";
  created_at: string;
}

/* ── meta ────────────────────────────────────────────── */
const TYPE_META = {
  info:   { label: "Information", bg: "#EEF2F9", color: "#2C3E63", border: "#C5D0E6", Icon: Info },
  urgent: { label: "Urgent",      bg: "#FEF0EE", color: "#B4453A", border: "#EDBBB5", Icon: AlertTriangle },
  event:  { label: "Événement",   bg: "#EDFAF3", color: "#2E7D5B", border: "#B3E8CF", Icon: CalendarDays },
};

/* ── New announcement modal ──────────────────────────── */
function NewAnnonceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body,  setBody]  = useState("");
  const [type,  setType]  = useState<Annonce["type"]>("info");
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        return (await api.post("/api/announcements", { title, body, type })).data;
      } catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Annonce publiée et envoyée à tous les employés.");
      setTitle(""); setBody(""); setType("info"); setErrors({});
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = "Titre requis";
    if (!body.trim())  e.body  = "Contenu requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setTitle(""); setBody(""); setType("info"); setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-md border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.16)" }}
      >
        <DialogHeader
          className="px-7 py-5 flex-row items-center justify-between space-y-0"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}>
              <Megaphone size={16} style={{ color: "#0F1729" }} aria-hidden="true" />
            </div>
            <DialogTitle className="font-display text-[18px] font-medium text-ink-900" style={{ letterSpacing: "-0.01em" }}>
              Nouvelle annonce
            </DialogTitle>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 transition-colors cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <div className="px-7 py-6 flex flex-col gap-5">
          {/* Type selector */}
          <div>
            <label className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 block mb-2">Type</label>
            <div className="flex items-center gap-2">
              {(Object.entries(TYPE_META) as [Annonce["type"], typeof TYPE_META.info][]).map(([value, m]) => {
                const Icon = m.Icon;
                const selected = type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-[12px] font-medium border cursor-pointer transition-all"
                    style={{
                      background:   selected ? m.bg     : "#fff",
                      color:        selected ? m.color  : "#76766C",
                      borderColor:  selected ? m.border : "#DEDED8",
                    }}
                  >
                    <Icon size={13} aria-hidden="true" /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 block mb-1.5">
              Titre <span style={{ color: "#B4453A" }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fermeture exceptionnelle vendredi 20 juin"
              className="w-full px-4 py-2.5 rounded-md border font-sans text-[13px] text-ink-900 outline-none transition-colors"
              style={{ borderColor: errors.title ? "#B4453A" : "#D4D3CC", background: "#fff" }}
            />
            {errors.title && <p className="font-sans text-[11px] mt-1" style={{ color: "#B4453A" }}>{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 block mb-1.5">
              Message <span style={{ color: "#B4453A" }}>*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Rédigez le contenu de votre annonce…"
              rows={5}
              className="w-full px-4 py-3 rounded-md border font-sans text-[13px] text-ink-900 outline-none transition-colors resize-none"
              style={{ borderColor: errors.body ? "#B4453A" : "#D4D3CC", background: "#fff" }}
            />
            {errors.body && <p className="font-sans text-[11px] mt-1" style={{ color: "#B4453A" }}>{errors.body}</p>}
          </div>

          <p className="font-sans text-[11px] text-warm-400">
            Cette annonce sera envoyée en notification à tous les employés, RH et administrateurs.
          </p>
        </div>

        <div className="px-7 py-5 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
          <button type="button" onClick={handleClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={() => validate() && mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
          >
            <Megaphone size={14} aria-hidden="true" />
            {mutation.isPending ? "Publication…" : "Publier l'annonce"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Annonce card ────────────────────────────────────── */
function AnnonceCard({ annonce, onDelete }: { annonce: Annonce; onDelete: (id: number) => void }) {
  const m    = TYPE_META[annonce.type];
  const Icon = m.Icon;

  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-3"
      style={{ border: `1px solid ${m.border}`, boxShadow: "0 1px 3px rgba(15,23,41,.07)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.bg }}>
            <Icon size={17} style={{ color: m.color }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ background: m.bg, color: m.color }}>{m.label}</span>
            </div>
            <p className="font-display text-[16px] font-semibold text-ink-900 mt-1" style={{ letterSpacing: "-0.01em" }}>{annonce.title}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(annonce.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-300 hover:bg-red-50 hover:text-[#B4453A] transition-colors cursor-pointer shrink-0 border-none"
          title="Supprimer"
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      </div>

      <p className="font-sans text-[13px] text-ink-700 leading-relaxed whitespace-pre-line">{annonce.body}</p>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid #F0EFE9" }}>
        <span className="font-sans text-[11px] text-warm-400">Par <span className="font-medium text-warm-600">{annonce.author_name}</span></span>
        <span className="font-mono text-[10px] text-warm-400">{annonce.created_at}</span>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export function Annonces() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | Annonce["type"]>("all");

  const { data: annonces = [], isLoading } = useQuery<Annonce[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      try { return (await api.get("/api/announcements")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    refetchInterval: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try { return (await api.delete(`/api/announcements/${id}`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Annonce supprimée."); },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = filter === "all" ? annonces : annonces.filter((a) => a.type === filter);
  const canDelete = (a: Annonce) => user?.role === "admin" || a.author_name === user?.name;

  const FILTERS: { value: typeof filter; label: string }[] = [
    { value: "all",    label: "Toutes" },
    { value: "info",   label: "Information" },
    { value: "urgent", label: "Urgent" },
    { value: "event",  label: "Événement" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>Annonces</h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">
            Publiez des annonces visibles par tous les employés via notifications.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-[13px] font-bold border-none cursor-pointer"
          style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
        >
          <Plus size={14} aria-hidden="true" /> Nouvelle annonce
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg self-start" style={{ background: "#F0EFE9" }}>
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

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F0F2F7" }}>
            <Megaphone size={24} color="#76766C" aria-hidden="true" />
          </div>
          <p className="font-display text-[17px] font-medium text-ink-700 mb-1">Aucune annonce</p>
          <p className="font-sans text-[13px] text-warm-400">Publiez votre première annonce pour informer l'équipe.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((a) => (
            <AnnonceCard
              key={a.id}
              annonce={a}
              onDelete={(id) => canDelete(a) && deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      <NewAnnonceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
