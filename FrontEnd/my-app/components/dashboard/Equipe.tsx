"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { ShieldCheck, UserPlus, Trash2, Search, Pencil, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSelect } from "@/components/ui/AppSelect";
import { EmpAvatar } from "./shared/EmpAvatar";
import { DeleteModal } from "./shared/DeleteModal";
import { CreateAccountModal } from "./CreateAccountModal";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, inputCls } from "@/components/dashboard/shared/ModalFormField";

type Role = "rh" | "employee";

interface Account {
  id: number;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  created_at: string;
}

const ROLE_FALLBACK = { label: "Inconnu", bg: "#F5F4F2", color: "#76766C" };
const ROLE_META: Record<string, { label: string; bg: string; color: string }> = {
  rh:       { label: "RH",      bg: "#EDFAF3", color: "#2E7D5B" },
  employee: { label: "Employé", bg: "#EEF2F9", color: "#2C3E63" },
};
const getRoleMeta = (role: string) => ROLE_META[role] ?? ROLE_FALLBACK;

const ROLE_OPTIONS = [
  { value: "",         label: "Tous les rôles" },
  { value: "employee", label: "Employé" },
  { value: "rh",       label: "RH" },
];

// ── Edit account modal ──────────────────────────────────────────────────────
interface EditForm { name: string; email: string }

function EditAccountModal({
  account,
  onClose,
}: {
  account: Account | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EditForm>({ name: "", email: "" });
  const [errors, setErrors] = useState<Partial<EditForm>>({});

  const open = !!account;

  useEffect(() => {
    if (account) {
      setForm({ name: account.name, email: account.email });
      setErrors({});
    }
  }, [account]);

  const set = (field: keyof EditForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const e: Partial<EditForm> = {};
    if (!form.name.trim())  e.name  = "Nom requis";
    if (!form.email.trim()) e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (payload: EditForm) => {
      try {
        const res = await api.patch(`/api/admin/users/${account!.id}`, payload);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Compte mis à jour.");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleOpenChange = (v: boolean) => {
    if (!v && !mutation.isPending) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              style={{ background: "linear-gradient(140deg,#2C3E63,#1A253C)" }}
            >
              <Pencil size={15} style={{ color: "#fff" }} aria-hidden="true" />
            </div>
            <DialogTitle
              className="font-display text-[19px] font-medium text-ink-900"
              style={{ letterSpacing: "-0.01em" }}
            >
              Modifier le compte
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="w-8 h-8 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-6 flex flex-col gap-5">
            <Field label="Nom complet" error={errors.name} required>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Nadia Benjelloun"
                className={inputCls(!!errors.name)}
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

          <div
            className="px-7 py-5 flex items-center justify-end gap-3"
            style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-md border border-warm-200 bg-white font-sans text-[13px] font-medium text-ink-700 hover:bg-warm-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60 transition-opacity"
              style={{ background: "linear-gradient(140deg,#2C3E63,#1A253C)", color: "#fff", boxShadow: "0 2px 10px rgba(44,62,99,.28)" }}
            >
              {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function Equipe() {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, isError } = useQuery<Account[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/admin/users");
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur de chargement.");
        throw err;
      }
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: Role }) => {
      try {
        const res = await api.patch(`/api/admin/users/${id}/role`, { role });
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
        throw err;
      }
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Rôle mis à jour → ${getRoleMeta(role).label}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.delete(`/api/admin/users/${deleteTarget!.id}`);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la suppression.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Compte de ${deleteTarget?.name} supprimé.`);
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = accounts.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (isError)
    return (
      <div className="p-7 flex items-center justify-center h-64">
        <p className="font-sans text-[13px] text-warm-500">Impossible de charger les comptes.</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="font-display text-[22px] font-semibold text-ink-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            Gestion des comptes
          </h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">
            {isLoading ? "Chargement…" : `${accounts.length} compte${accounts.length !== 1 ? "s" : ""} · 3 rôles disponibles`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-md font-sans text-[13px] font-bold border-none cursor-pointer self-start"
          style={{
            background: "linear-gradient(140deg,#2C3E63,#1A253C)",
            color: "#fff",
            boxShadow: "0 2px 10px rgba(44,62,99,.28)",
          }}
        >
          <UserPlus size={15} aria-hidden="true" />
          Créer un compte
        </button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {(["rh", "employee"] as Role[]).map((r) => {
          const meta = getRoleMeta(r);
          const count = accounts.filter((a) => a.role === r).length;
          return (
            <div
              key={r}
              className="rounded-xl border p-4 cursor-pointer transition-all"
              style={{
                borderColor: roleFilter === r ? meta.color : "#DEDED8",
                background: roleFilter === r ? meta.bg : "#fff",
                boxShadow: roleFilter === r ? `0 0 0 1.5px ${meta.color}` : "0 1px 2px rgba(15,23,41,.06)",
              }}
              onClick={() => setRoleFilter(roleFilter === r ? "" : r)}
            >
              <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <p
                className="font-display text-[28px] font-medium leading-none text-ink-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                {isLoading ? "–" : count}
              </p>
              <p className="font-sans text-[11px] text-warm-400 mt-1">
                compte{count !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + filter toolbar */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 border border-warm-300 bg-white rounded-md h-9.5 w-full sm:w-64 shrink-0">
          <Search size={14} className="text-warm-400 shrink-0" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un compte…"
            className="flex-1 border-none outline-none bg-transparent font-sans text-[13px] text-ink-900 placeholder:text-warm-400"
          />
        </div>
        <AppSelect
          className="w-44"
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
        />
      </div>

      {/* Accounts table */}
      <div
        className="bg-white border border-warm-200 rounded-xl overflow-hidden"
        style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
      >
        {/* Table head */}
        <div
          className="px-5 py-3 bg-warm-50 grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center"
          style={{ borderBottom: "1px solid #DEDED8" }}
        >
          {[
            { label: "COMPTE",   cls: "" },
            { label: "RÔLE",     cls: "hidden md:block text-center" },
            { label: "CRÉÉ LE",  cls: "hidden md:block text-center" },
            { label: "ACTIONS",  cls: "text-right" },
          ].map(({ label, cls }, i) => (
            <span key={i} className={`font-mono text-[9.5px] uppercase tracking-widest text-warm-500 ${cls}`}>
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4" style={{ borderBottom: "1px solid #DEDED8" }}>
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-2.5 w-48" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <ShieldCheck size={28} className="text-warm-300 mx-auto mb-3" aria-hidden="true" />
            <p className="font-display text-[15px] text-warm-400 mb-1">Aucun compte trouvé</p>
            <p className="font-sans text-[12px] text-warm-400">Modifiez vos filtres ou créez un nouveau compte.</p>
          </div>
        ) : (
          filtered.map((account, i) => {
            const meta = getRoleMeta(account.role);
            return (
              <div
                key={account.id}
                className="px-5 py-3.5 grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center hover:bg-warm-50 transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #DEDED8" : "none" }}
              >
                {/* Account identity */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <EmpAvatar name={account.name} size={36} />
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] font-semibold text-ink-900 leading-tight truncate">
                      {account.name}
                    </p>
                    <p className="font-sans text-[11px] text-warm-500 truncate">{account.email}</p>
                  </div>
                </div>

                {/* Role selector */}
                <div className="hidden md:block">
                  <AppSelect
                    className="w-36"
                    value={account.role}
                    onChange={(v) => roleMutation.mutate({ id: account.id, role: v as Role })}
                    options={ROLE_OPTIONS}
                  />
                </div>

                {/* Created at */}
                <span className="font-mono text-[11px] text-warm-500 hidden md:block text-center">
                  {account.created_at}
                </span>

                {/* Role pill on mobile */}
                <span
                  className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full md:hidden"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.label}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setEditTarget(account)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:text-ink-700 hover:bg-warm-100 transition-colors cursor-pointer"
                    title="Modifier le compte"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(account)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:text-[#B4453A] hover:bg-[#F8E5E2] transition-colors cursor-pointer"
                    title="Supprimer le compte"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <div
            className="px-5 py-3 bg-warm-50 flex items-center justify-between"
            style={{ borderTop: "1px solid #DEDED8" }}
          >
            <span className="font-sans text-[12px] text-warm-500">
              {filtered.length} compte{filtered.length !== 1 ? "s" : ""}
              {roleFilter ? ` · ${getRoleMeta(roleFilter).label}` : ""}
            </span>
          </div>
        )}
      </div>

      <EditAccountModal account={editTarget} onClose={() => setEditTarget(null)} />

      <CreateAccountModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
      />

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        title="Supprimer le compte"
        description="Ce compte sera définitivement supprimé. L'utilisateur perdra tout accès à l'application."
        confirmLabel="Supprimer le compte"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        preview={
          deleteTarget && (
            <div className="flex items-center gap-3">
              <EmpAvatar name={deleteTarget.name} size={40} />
              <div>
                <p className="font-sans text-[14px] font-semibold text-ink-900 leading-tight">{deleteTarget.name}</p>
                <p className="font-sans text-[12px] text-warm-500 mt-0.5">{deleteTarget.email}</p>
                <span
                  className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: getRoleMeta(deleteTarget.role).bg, color: getRoleMeta(deleteTarget.role).color }}
                >
                  {getRoleMeta(deleteTarget.role).label}
                </span>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
