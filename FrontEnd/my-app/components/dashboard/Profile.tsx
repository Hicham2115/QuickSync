"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  Mail, Building2, Briefcase, Calendar,
  Phone, Shield, Camera, Pencil, Check, X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { EmpAvatar } from "./shared/EmpAvatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  dept: string;
  title: string;
  hired: string;
  status: string;
  phone: string;
  bio: string;
  avatar: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrateur",
  rh: "Ressources Humaines",
  employee: "Employé",
};

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  admin:    { bg: "#EEF2F9", color: "#2C3E63" },
  rh:       { bg: "#EDFAF3", color: "#2E7D5B" },
  employee: { bg: "#FDF8EE", color: "#947024" },
};

/* ── Avatar with photo upload ── */
function AvatarUpload({
  name,
  avatarUrl,
  onUploaded,
}: {
  name: string;
  avatarUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 4 Mo)");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("avatar", file);
      const res = await api.post("/api/me/avatar", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(res.data.avatar);
      toast.success("Photo mise à jour.");
    } catch (err) {
      setPreview(null);
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erreur d'upload.")
        : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const src = preview ?? avatarUrl;

  return (
    <div className="relative shrink-0">
      <div
        className="rounded-full ring-4 ring-white overflow-hidden"
        style={{ width: 72, height: 72 }}
      >
        {src ? (
          <img
            src={src}
            alt="Photo de profil"
            className="w-full h-full object-cover"
          />
        ) : (
          <EmpAvatar name={name} size={72} />
        )}
      </div>

      {/* Camera overlay */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Changer la photo"
        className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-2 border-white transition-opacity disabled:opacity-50"
        style={{ background: "#2C3E63" }}
      >
        {uploading ? (
          <span
            className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"
          />
        ) : (
          <Camera size={11} color="#fff" aria-hidden="true" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

/* ── Inline editable field ── */
function EditableField({
  label,
  value,
  placeholder,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[9px] uppercase tracking-widest text-warm-400">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-warm-200 focus:border-[#2C3E63] font-sans text-[13px] text-ink-900 outline-none transition-colors bg-warm-50 resize-none placeholder:text-warm-300"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-warm-200 focus:border-[#2C3E63] font-sans text-[13px] text-ink-900 outline-none transition-colors bg-warm-50 placeholder:text-warm-300"
        />
      )}
    </div>
  );
}

/* ── Info row (read-only) ── */
function InfoRow({
  icon, label, children,
}: {
  icon: React.ReactNode; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "#F0F2F7", color: "#2C3E63" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-warm-400 mb-0.5">{label}</p>
        <div className="font-sans text-[13px] font-medium text-ink-900">{children}</div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function Profile() {
  const queryClient = useQueryClient();
  const setUser     = useAuthStore((s) => s.setUser);
  const storeUser   = useAuthStore((s) => s.user);

  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      try { return (await api.get("/api/me/profile")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone ?? "", bio: profile.bio ?? "" });
      setAvatarUrl(profile.avatar ?? null);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      try { return (await api.patch("/api/me/profile", payload)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      if (storeUser) setUser({ ...storeUser, name: form.name });
      toast.success("Profil sauvegardé.");
      setEditing(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cancel = () => {
    if (profile) setForm({ name: profile.name, phone: profile.phone ?? "", bio: profile.bio ?? "" });
    setEditing(false);
  };

  const roleStyle = ROLE_COLOR[profile?.role ?? "employee"] ?? { bg: "#F5F4F2", color: "#76766C" };

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-4 max-w-2xl">

      {/* ── Profile hero card ─────────────────────── */}
      <div
        className="bg-white rounded-2xl overflow-hidden border border-warm-200"
        style={{ boxShadow: "0 2px 12px rgba(15,23,41,.07)" }}
      >
        {/* Banner */}
        <div
          className="h-28 w-full relative"
          style={{ background: "linear-gradient(135deg,#1A253C 0%,#2C3E63 60%,#3A5080 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 80% 50%, #CBA24A 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-9 mb-5">
            {isLoading ? (
              <Skeleton className="w-18 h-18 rounded-full ring-4 ring-white" style={{ width: 72, height: 72 }} />
            ) : (
              <AvatarUpload
                name={form.name || profile?.name || ""}
                avatarUrl={avatarUrl}
                onUploaded={(url) => {
                  setAvatarUrl(url);
                  queryClient.invalidateQueries({ queryKey: ["my-profile"] });
                }}
              />
            )}

            {!editing && !isLoading && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-200 bg-white font-sans text-[12px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer"
              >
                <Pencil size={11} aria-hidden="true" />
                Modifier le profil
              </button>
            )}
          </div>

          {/* Name + title (or edit form) */}
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-56 mt-1" />
            </div>
          ) : editing ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditableField
                  label="Nom complet"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                />
                <EditableField
                  label="Téléphone"
                  value={form.phone}
                  placeholder="+212 6XX XXX XXX"
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                />
              </div>
              <EditableField
                label="À propos"
                value={form.bio}
                placeholder="Décrivez-vous brièvement…"
                multiline
                onChange={(v) => setForm((f) => ({ ...f, bio: v }))}
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending || !form.name.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 8px rgba(180,134,47,.3)" }}
                >
                  <Check size={13} aria-hidden="true" />
                  {saveMutation.isPending ? "Sauvegarde…" : "Sauvegarder"}
                </button>
                <button
                  onClick={cancel}
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X size={13} aria-hidden="true" />
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                className="font-display text-[22px] font-semibold text-ink-900 leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {profile?.name ?? "–"}
              </p>
              <p className="font-sans text-[13px] text-warm-500 mt-0.5">
                {profile?.title || "Aucun poste renseigné"}
              </p>

              {/* Role badge + status */}
              <div className="flex items-center gap-2 mt-2.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[11px] font-semibold"
                  style={{ background: roleStyle.bg, color: roleStyle.color }}
                >
                  <Shield size={9} aria-hidden="true" />
                  {ROLE_LABEL[profile?.role ?? "employee"] ?? profile?.role}
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full font-sans text-[11px] font-semibold"
                  style={{ background: "#EDFAF3", color: "#2E7D5B" }}
                >
                  {profile?.status ?? "Actif"}
                </span>
              </div>

              {profile?.bio && (
                <p className="font-sans text-[13px] text-ink-600 mt-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Info grid ─────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-warm-200 overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(15,23,41,.07)" }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}
        >
          <p className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">
            Informations
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={<Mail size={14} aria-hidden="true" />} label="Adresse e-mail">
            {isLoading ? <Skeleton className="h-4 w-44" /> : (
              <a href={`mailto:${profile?.email}`} className="text-[#2C3E63] no-underline hover:underline">
                {profile?.email ?? "–"}
              </a>
            )}
          </InfoRow>

          <InfoRow icon={<Phone size={14} aria-hidden="true" />} label="Téléphone">
            {isLoading ? <Skeleton className="h-4 w-28" /> : (
              profile?.phone ? (
                <a href={`tel:${profile.phone}`} className="text-ink-900 no-underline hover:underline">
                  {profile.phone}
                </a>
              ) : (
                <span
                  className="font-sans text-[12px] italic cursor-pointer"
                  style={{ color: "#C5C5BE" }}
                  onClick={() => setEditing(true)}
                >
                  Ajouter un numéro →
                </span>
              )
            )}
          </InfoRow>

          <InfoRow icon={<Building2 size={14} aria-hidden="true" />} label="Département">
            {isLoading ? <Skeleton className="h-4 w-24" /> : (
              <span>{profile?.dept || "–"}</span>
            )}
          </InfoRow>

          <InfoRow icon={<Briefcase size={14} aria-hidden="true" />} label="Poste">
            {isLoading ? <Skeleton className="h-4 w-28" /> : (
              <span>{profile?.title || "–"}</span>
            )}
          </InfoRow>

          <InfoRow icon={<Calendar size={14} aria-hidden="true" />} label="Date d'embauche">
            {isLoading ? <Skeleton className="h-4 w-24" /> : (
              <span>{profile?.hired || "–"}</span>
            )}
          </InfoRow>

          <InfoRow icon={<Shield size={14} aria-hidden="true" />} label="Rôle">
            {isLoading ? <Skeleton className="h-4 w-20" /> : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[11px] font-semibold"
                style={{ background: roleStyle.bg, color: roleStyle.color }}
              >
                {ROLE_LABEL[profile?.role ?? "employee"] ?? profile?.role}
              </span>
            )}
          </InfoRow>
        </div>

        {!isLoading && !editing && (
          <div
            className="px-6 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}
          >
            <p className="font-sans text-[12px] text-warm-400">
              Dept. et poste gérés par les RH
            </p>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 font-sans text-[12px] font-medium cursor-pointer border-none bg-transparent"
              style={{ color: "#2C3E63" }}
            >
              <Pencil size={10} aria-hidden="true" />
              Modifier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
