"use client";
import { useState, useMemo, useEffect } from 'react';
import { Plus, Building2, Pencil, Trash2, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { AureaPagination } from '@/components/ui/AureaPagination';
import { AddDepartmentModal } from './AddDepartmentModal';
import { EditDepartmentModal } from './EditDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';
import type { Department } from '@/lib/mock/hr-data';

const PAGE_SIZE = 9;

export function Departements() {
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [addOpen, setAddOpen]           = useState(false);
  const [editTarget, setEditTarget]     = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const { data: departments = [], isLoading, isError } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/departments');
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? 'Erreur de chargement.');
        throw err;
      }
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.head.toLowerCase().includes(q),
    );
  }, [departments, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isError)
    return (
      <div className="p-7 flex items-center justify-center h-64">
        <p className="font-sans text-[13px] text-warm-500">Impossible de charger les départements.</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-[13px] text-warm-500">
          {isLoading ? 'Chargement…' : `${departments.length} département${departments.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2.5 rounded-md font-sans text-[13px] sm:text-[14px] font-bold border-none cursor-pointer self-start sm:self-auto"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)', color: '#0F1729', boxShadow: '0 2px 10px rgba(180,134,47,.28)' }}
        >
          <Plus size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Ajouter un département</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 border border-warm-300 bg-white rounded-md h-9.5 w-full sm:w-72">
        <Search size={14} className="text-warm-400 shrink-0" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un département…"
          className="flex-1 border-none outline-none bg-transparent font-sans text-[13px] text-ink-900 placeholder:text-warm-400"
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-warm-200 rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="w-11 h-11 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3.5 w-40 mb-4" />
              <Skeleton className="h-1 w-full rounded-full" />
              <Skeleton className="h-3 w-24 mt-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display text-[16px] text-warm-400 mb-2">Aucun département trouvé.</p>
          <p className="font-sans text-[13px] text-warm-400">Essayez de modifier votre recherche.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
            {paginated.map((d) => (
              <div
                key={d.id}
                className="bg-white border border-warm-200 rounded-2xl p-5 transition-shadow hover:shadow-md flex flex-col"
                style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}
              >
                {/* Top row: icon + count badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: d.color + '22' }}>
                    <Building2 size={20} color={d.color} aria-hidden="true" />
                  </div>
                  <span
                    className="font-mono text-[11px] font-semibold rounded-full px-2.5 py-0.75"
                    style={{ color: d.color, background: d.color + '18' }}
                  >
                    {d.count} emp.
                  </span>
                </div>

                {/* Info */}
                <p className="font-display text-[18px] font-medium text-ink-900 mb-1">{d.name}</p>
                <p className="font-sans text-[12px] text-warm-500 mb-3.5">Responsable : {d.head}</p>

                {/* Progress bar */}
                <div className="h-1 rounded-full bg-warm-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.count > 0 ? (d.active / d.count) * 100 : 0}%`, background: d.color }}
                  />
                </div>
                <p className="font-sans text-[11px] text-warm-500 mt-1.5 mb-4">{d.active} actifs sur {d.count}</p>

                {/* Actions */}
                <div className="flex gap-1.5 mt-auto pt-3 border-t border-warm-200">
                  <button
                    onClick={() => setEditTarget(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-warm-200 bg-warm-50 font-sans text-[12px] font-medium text-ink-700 hover:bg-warm-100 transition-colors cursor-pointer"
                  >
                    <Pencil size={12} aria-hidden="true" /> Modifier
                  </button>
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-[#F8E5E2] bg-[#FDF3F2] font-sans text-[12px] font-medium text-[#B4453A] hover:bg-[#F8E5E2] transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} aria-hidden="true" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
            <span className="font-sans text-[12px] text-warm-500">
              {filtered.length === 0
                ? 'Aucun résultat'
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
            </span>
            <AureaPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <AddDepartmentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditDepartmentModal department={editTarget} onClose={() => setEditTarget(null)} />
      <DeleteDepartmentModal department={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
