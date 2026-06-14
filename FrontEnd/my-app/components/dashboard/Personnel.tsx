"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  UserPlus,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import type { Employee } from "@/lib/mock/hr-data";
import { StatusBadge } from "./shared/StatusBadge";
import { EmpAvatar } from "./shared/EmpAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSelect } from "@/components/ui/AppSelect";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { DeleteModal } from "./shared/DeleteModal";
import { Pencil, Trash2 } from "lucide-react";
import { AureaPagination } from "@/components/ui/AureaPagination";

const PAGE_SIZE = 10;

type SortKey = keyof Pick<
  Employee,
  "name" | "dept" | "title" | "hired" | "status"
>;
const COLS: { key: SortKey; label: string }[] = [
  { key: "name", label: "EMPLOYÉ" },
  { key: "dept", label: "DÉPARTEMENT" },
  { key: "title", label: "POSTE" },
  { key: "hired", label: "DATE D'EMBAUCHE" },
  { key: "status", label: "STATUT" },
];
export function Personnel() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [sortCol, setSortCol] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.delete(`/api/employees/${deleteTarget!.id}`);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la suppression.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`${deleteTarget?.name} a été supprimé.`);
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const {
    data: employees = [],
    isLoading,
    isError,
  } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/employees");
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(
            err.response?.data?.message ?? "Erreur de chargement.",
          );
        throw err;
      }
    },
  });

  const DEPTS = useMemo(
    () => [...new Set(employees.map((e) => e.dept))].sort(),
    [employees],
  );

  const toggleSort = (col: SortKey) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let r = [...employees];
    if (search)
      r = r.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase()),
      );
    if (dept) r = r.filter((e) => e.dept === dept);
    if (status) r = r.filter((e) => e.status === status);
    r.sort((a, b) => {
      const av = String(a[sortCol]);
      const bv = String(b[sortCol]);
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [employees, search, dept, status, sortCol, sortDir]);

  useEffect(() => { setPage(1); }, [search, dept, status, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isError)
    return (
      <div className="p-7 flex items-center justify-center h-64">
        <p className="font-sans text-[13px] text-warm-500">
          Impossible de charger les employés.
        </p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-[13px] text-warm-500">
          {isLoading
            ? "Chargement…"
            : `${employees.length} collaborateur${employees.length !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2.5 rounded-md font-sans text-[13px] sm:text-[14px] font-bold border-none cursor-pointer self-start sm:self-auto"
          style={{
            background: "linear-gradient(140deg,#CBA24A,#947024)",
            color: "#0F1729",
            boxShadow: "0 2px 10px rgba(180,134,47,.28)",
          }}
        >
          <UserPlus size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Ajouter un employé</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search — full width on mobile */}
        <div className="flex items-center gap-2 px-3 border border-warm-300 bg-white rounded-md h-9.5 w-full sm:w-65 shrink-0">
          <Search
            size={14}
            className="text-warm-400 shrink-0"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un employé..."
            className="flex-1 border-none outline-none bg-transparent font-sans text-[13px] text-ink-900 placeholder:text-warm-400"
          />
        </div>

        {/* Filters row */}
        <div className="flex gap-2 flex-1">
          <AppSelect
            className="flex-1 sm:flex-none sm:w-44"
            value={dept}
            onChange={setDept}
            placeholder="Tous les dép."
            options={DEPTS.map((d) => ({ value: d, label: d }))}
          />
          <AppSelect
            className="flex-1 sm:flex-none sm:w-44"
            value={status}
            onChange={setStatus}
            placeholder="Tous les statuts"
            options={[
              { value: "Actif",    label: "Actif" },
              { value: "En congé", label: "En congé" },
              { value: "Inactif",  label: "Inactif" },
            ]}
          />

          {/* View toggle — pushed to right */}
          <div className="ml-auto flex gap-1 shrink-0">
            {(
              [
                ["table", List],
                ["cards", LayoutGrid],
              ] as const
            ).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="w-9 h-9 rounded-md border border-warm-200 flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: view === v ? "#EEF2F9" : "#fff" }}
              >
                <Icon
                  size={15}
                  color={view === v ? "#2C3E63" : "#76766C"}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div
          className="bg-white border border-warm-200 rounded-md overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
        >
          {/* Table header */}
          <div
            className="px-4 sm:px-5 py-3 bg-warm-50"
            style={{ borderBottom: "1px solid #DEDED8" }}
          >
            <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_auto_auto] lg:grid-cols-[2.5fr_1fr_1.2fr_1fr_1fr_auto] gap-2 items-center">
              {COLS.map(({ key, label }, idx) => {
                const hideClass =
                  idx === 1 ? "hidden md:flex"
                  : idx === 2 ? "hidden lg:flex"
                  : idx === 3 ? "hidden lg:flex"
                  : "flex";
                const centerClass = idx > 0 ? "justify-center" : "";
                return (
                  <button
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`${hideClass} ${centerClass} items-center gap-1 font-mono text-[9.5px] uppercase tracking-widest text-warm-500 bg-transparent border-none cursor-pointer p-0 font-medium`}
                  >
                    {label}
                    {sortCol === key ? (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    ) : (
                      <span className="w-3 inline-block" />
                    )}
                  </button>
                );
              })}
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 flex justify-end pr-1">ACTIONS</span>
            </div>
          </div>

          {/* Table rows */}
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-4 sm:px-5 py-3.5"
                style={{ borderBottom: "1px solid #DEDED8" }}
              >
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8.5 h-8.5 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-2.5 w-48" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-[16px] text-warm-400 mb-2">
                Aucun employé trouvé.
              </p>
              <p className="font-sans text-[13px] text-warm-400">
                Essayez de modifier vos filtres.
              </p>
            </div>
          ) : (
            paginated.map((emp, i) => (
              <div
                key={emp.id}
                className="px-4 sm:px-5 py-3.5 transition-colors hover:bg-warm-50 cursor-pointer"
                style={{
                  borderBottom:
                    i < paginated.length - 1 ? "1px solid #DEDED8" : "none",
                }}
              >
                <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_auto_auto] lg:grid-cols-[2.5fr_1fr_1.2fr_1fr_1fr_auto] gap-2 items-center">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <EmpAvatar name={emp.name} size={34} />
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-semibold text-ink-900 leading-tight truncate">
                        {emp.name}
                      </p>
                      <p className="font-sans text-[11px] text-warm-500 truncate">
                        {emp.email}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans text-[13px] text-ink-900 hidden md:block truncate text-center">
                    {emp.dept}
                  </span>
                  <span className="font-sans text-[12px] text-warm-500 hidden lg:block truncate text-center">
                    {emp.title}
                  </span>
                  <span className="font-mono text-[11px] text-warm-500 hidden lg:block text-center">
                    {emp.hired}
                  </span>
                  <div className="flex justify-center">
                    <StatusBadge status={emp.status} />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditTarget(emp); }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:text-ink-700 hover:bg-warm-100 transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(emp); }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:text-[#B4453A] hover:bg-[#F8E5E2] transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Footer */}
          <div
            className="px-4 sm:px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-warm-50"
            style={{ borderTop: "1px solid #DEDED8" }}
          >
            <span className="font-sans text-[12px] text-warm-500">
              {filtered.length === 0
                ? "Aucun résultat"
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
            </span>
            <AureaPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-warm-200 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
            >
              <div
                className="h-14"
                style={{
                  background: "linear-gradient(135deg,#1A253C,#2C3E63)",
                }}
              />
              <div className="px-4 pb-4" style={{ marginTop: -24 }}>
                <div className="flex items-end justify-between mb-2.5">
                  <div
                    className="p-0.75 rounded-full"
                    style={{
                      background: "linear-gradient(140deg,#CBA24A,#947024)",
                    }}
                  >
                    <EmpAvatar name={emp.name} size={44} />
                  </div>
                  <StatusBadge status={emp.status} />
                </div>
                <p className="font-display text-[16px] font-medium text-ink-900 leading-tight">
                  {emp.name}
                </p>
                <p className="font-sans text-[12px] text-warm-500 mt-0.5">
                  {emp.title}
                </p>
                <div className="border-t border-warm-200 mt-3 pt-2.5 grid grid-cols-2 gap-1.5">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-warm-400">
                      DEPT
                    </p>
                    <p className="font-sans text-[12px] font-medium text-ink-900 mt-0.5">
                      {emp.dept}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-warm-400">
                      CONGÉS
                    </p>
                    <p className="font-sans text-[12px] font-medium text-ink-900 mt-0.5">
                      {emp.leaves} j
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-warm-200">
                  <button
                    onClick={() => setEditTarget(emp)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-warm-200 bg-warm-50 font-sans text-[12px] font-medium text-ink-700 hover:bg-warm-100 transition-colors cursor-pointer"
                  >
                    <Pencil size={12} aria-hidden="true" /> Modifier
                  </button>
                  <button
                    onClick={() => setDeleteTarget(emp)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-[#F8E5E2] bg-[#FDF3F2] font-sans text-[12px] font-medium text-[#B4453A] hover:bg-[#F8E5E2] transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} aria-hidden="true" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-sans text-[12px] text-warm-500">
            {filtered.length === 0
              ? "Aucun résultat"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
          </span>
          <AureaPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
        </div>
      )}

      <AddEmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <EditEmployeeModal employee={editTarget} onClose={() => setEditTarget(null)} />
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        title="Supprimer l'employé"
        description="Cet employé sera supprimé définitivement. Toutes les données associées seront perdues."
        confirmLabel="Supprimer l'employé"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        preview={
          deleteTarget && (
            <div className="flex items-center gap-3">
              <EmpAvatar name={deleteTarget.name} size={40} />
              <div>
                <p className="font-sans text-[14px] font-semibold text-ink-900 leading-tight">{deleteTarget.name}</p>
                <p className="font-sans text-[12px] text-warm-500 mt-0.5">{deleteTarget.title} · {deleteTarget.dept}</p>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
