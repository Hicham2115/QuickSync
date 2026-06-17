"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import { Megaphone, Plus, X, Trash2, Info, AlertTriangle, CalendarDays } from "lucide-react";
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

/* ── type config ─────────────────────────────────────── */
const TYPE_META = {
  info: {
    label: "Information",
    Icon: Info,
    headerBg: "#2C3E63",
    badgeBg: "rgba(255,255,255,.15)",
    badgeColor: "#fff",
    iconColor: "#fff",
    cardBorder: "#C5D0E6",
    bodyBg: "#fff",
  },
  urgent: {
    label: "Urgent",
    Icon: AlertTriangle,
    headerBg: "#B4453A",
    badgeBg: "rgba(255,255,255,.18)",
    badgeColor: "#fff",
    iconColor: "#fff",
    cardBorder: "#EDBBB5",
    bodyBg: "#fff",
  },
  event: {
    label: "Événement",
    Icon: CalendarDays,
    headerBg: "#2E7D5B",
    badgeBg: "rgba(255,255,255,.15)",
    badgeColor: "#fff",
    iconColor: "#fff",
    cardBorder: "#B3E8CF",
    bodyBg: "#fff",
  },
};

/* ── New announcement modal (admin only) ─────────────── */
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
      toast.success("Annonce publiée et envoyée à tous les utilisateurs.");
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

  const m = TYPE_META[type];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl border border-warm-200"
        style={{ boxShadow: "0 24px 64px rgba(15,23,41,.18)" }}
      >
        {/* Colored header preview */}
        <div className="px-7 py-5 flex items-center justify-between" style={{ background: m.headerBg }}>
          <div className="flex items-center gap-3">
            <m.Icon size={18} color="#fff" aria-hidden="true" />
            <DialogTitle className="font-display text-[17px] font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>
              Nouvelle annonce
            </DialogTitle>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border-none">
            <X size={15} color="#fff" aria-hidden="true" />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          {/* Type selector */}
          <div>
            <label className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 block mb-2">Type d'annonce</label>
            <div className="flex items-center gap-2">
              {(Object.entries(TYPE_META) as [Annonce["type"], typeof TYPE_META.info][]).map(([value, meta]) => {
                const selected = type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-[12px] font-medium border-2 cursor-pointer transition-all"
                    style={{
                      background:   selected ? meta.headerBg : "#fff",
                      color:        selected ? "#fff"         : "#76766C",
                      borderColor:  selected ? meta.headerBg  : "#DEDED8",
                    }}
                  >
                    <meta.Icon size={12} aria-hidden="true" /> {meta.label}
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
              placeholder="Ex : Fermeture exceptionnelle vendredi 20 juin"
              className="w-full px-4 py-2.5 rounded-lg border font-sans text-[13px] text-ink-900 outline-none transition-colors"
              style={{ borderColor: errors.title ? "#B4453A" : "#D4D3CC" }}
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
              rows={4}
              className="w-full px-4 py-3 rounded-lg border font-sans text-[13px] text-ink-900 outline-none transition-colors resize-none"
              style={{ borderColor: errors.body ? "#B4453A" : "#D4D3CC" }}
            />
            {errors.body && <p className="font-sans text-[11px] mt-1" style={{ color: "#B4453A" }}>{errors.body}</p>}
          </div>

          <p className="font-sans text-[11px] text-warm-400 flex items-center gap-1.5">
            <Megaphone size={11} aria-hidden="true" />
            Cette annonce sera envoyée en notification à tous les utilisateurs.
          </p>
        </div>

        <div className="px-7 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}>
          <button type="button" onClick={handleClose} disabled={mutation.isPending} className="px-5 py-2.5 rounded-lg border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={() => validate() && mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60 text-white transition-opacity"
            style={{ background: m.headerBg }}
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
function AnnonceCard({ annonce, isAdmin, onDelete }: { annonce: Annonce; isAdmin: boolean; onDelete: () => void }) {
  const m = TYPE_META[annonce.type];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${m.cardBorder}`, boxShadow: "0 2px 8px rgba(15,23,41,.07)" }}
    >
      {/* Colored header band */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: m.headerBg }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.badgeBg }}>
            <m.Icon size={16} color={m.iconColor} aria-hidden="true" />
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,.6)" }}>
              {m.label}
            </span>
            <p className="font-display text-[17px] font-semibold text-white leading-tight" style={{ letterSpacing: "-0.01em" }}>
              {annonce.title}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer border-none shrink-0"
            title="Supprimer"
          >
            <Trash2 size={14} color="rgba(255,255,255,.7)" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5" style={{ background: m.bodyBg }}>
        <p className="font-sans text-[14px] text-ink-700 leading-relaxed whitespace-pre-line">
          {annonce.body}
        </p>
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid #F0EFE9" }}>
          <span className="font-sans text-[12px] text-warm-400">
            Par <span className="font-semibold text-warm-600">{annonce.author_name}</span>
          </span>
          <span className="font-mono text-[11px] text-warm-400">{annonce.created_at}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export function Annonces() {
  const queryClient = useQueryClient();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.role === "admin";
  const [modalOpen, setModalOpen] = useState(false);
  const [filter,    setFilter]    = useState<"all" | Annonce["type"]>("all");

  const { data: annonces = [], isLoading } = useQuery<Annonce[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      try { return (await api.get("/api/announcements")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    refetchInterval: 30_000,
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

  const FILTERS: { value: typeof filter; label: string }[] = [
    { value: "all",    label: "Toutes" },
    { value: "info",   label: "Information" },
    { value: "urgent", label: "Urgent" },
    { value: "event",  label: "Événement" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>
            Annonces
          </h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">
            {isAdmin
              ? "Publiez des annonces visibles par toute l'équipe."
              : "Les annonces et communications officielles de l'entreprise."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-[13px] font-bold border-none cursor-pointer shrink-0"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.28)" }}
          >
            <Plus size={14} aria-hidden="true" /> Nouvelle annonce
          </button>
        )}
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-warm-200">
              <Skeleton className="h-16 w-full rounded-none" />
              <div className="p-6"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F0F2F7" }}>
            <Megaphone size={26} color="#76766C" aria-hidden="true" />
          </div>
          <p className="font-display text-[18px] font-medium text-ink-700 mb-1">Aucune annonce</p>
          <p className="font-sans text-[13px] text-warm-400">
            {isAdmin ? "Publiez votre première annonce pour informer l'équipe." : "Aucune annonce pour le moment."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((a) => (
            <AnnonceCard
              key={a.id}
              annonce={a}
              isAdmin={isAdmin}
              onDelete={() => deleteMutation.mutate(a.id)}
            />
          ))}
        </div>
      )}

      {isAdmin && <NewAnnonceModal open={modalOpen} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
