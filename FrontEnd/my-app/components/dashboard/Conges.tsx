"use client";
import { useState, useMemo, useEffect } from 'react';
import { CalendarPlus, Check, X, Eye, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import axios from 'axios';
import { StatusBadge } from './shared/StatusBadge';
import { EmpAvatar } from './shared/EmpAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AureaPagination } from '@/components/ui/AureaPagination';
import { AddLeaveModal } from './AddLeaveModal';
import { DeleteLeaveModal } from './DeleteLeaveModal';
import type { Leave } from '@/lib/mock/hr-data';

type TabKey = 'all' | 'en_attente' | 'approuve' | 'refuse';
const PAGE_SIZE = 10;

// Grid columns: employee | type | period | days | status | actions
const COLS = '2fr 1fr 1.5fr .5fr .9fr 1.6fr';

export function Conges() {
  const queryClient = useQueryClient();
  const [tab, setTab]                   = useState<TabKey>('all');
  const [typeFilter, setTypeFilter]     = useState('');
  const [page, setPage]                 = useState(1);
  const [addOpen, setAddOpen]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Leave | null>(null);

  const { data: leaves = [], isLoading, isError } = useQuery<Leave[]>({
    queryKey: ['leaves'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/leaves');
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? 'Erreur de chargement.');
        throw err;
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approuve' | 'refuse' }) => {
      try {
        const res = await api.patch(`/api/leaves/${id}/status`, { status });
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? 'Erreur lors de la mise à jour.');
        throw err;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      if (status === 'approuve') toast.success('Demande approuvée avec succès.');
      else toast.error('Demande refusée.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const pendingCount = leaves.filter((l) => l.status === 'en_attente').length;
  const types = [...new Set(leaves.map((l) => l.type))].sort();

  const filtered = useMemo(() => {
    let r = tab === 'all' ? [...leaves] : leaves.filter((l) => l.status === tab);
    if (typeFilter) r = r.filter((l) => l.type === typeFilter);
    return r;
  }, [leaves, tab, typeFilter]);

  useEffect(() => { setPage(1); }, [tab, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all',        label: 'Toutes' },
    { key: 'en_attente', label: 'En attente', count: pendingCount },
    { key: 'approuve',   label: 'Approuvées' },
    { key: 'refuse',     label: 'Refusées' },
  ];

  if (isError)
    return (
      <div className="p-7 flex items-center justify-center h-64">
        <p className="font-sans text-[13px] text-warm-500">Impossible de charger les demandes.</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-[13px] text-warm-500">
          {isLoading ? 'Chargement…' : `${leaves.length} demande${leaves.length !== 1 ? 's' : ''} au total`}
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2.5 rounded-md font-sans text-[13px] sm:text-[14px] font-bold border-none cursor-pointer self-start sm:self-auto"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)', color: '#0F1729', boxShadow: '0 2px 10px rgba(180,134,47,.28)' }}
        >
          <CalendarPlus size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Nouvelle demande</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Tabs bar — tab buttons + type filter on same row */}
      <div className="flex items-stretch justify-between" style={{ borderBottom: '1px solid #DEDED8' }}>
        {/* Tabs — plain flex, no overflow container so -mb-px works */}
        <div className="flex items-end min-w-0">
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 font-sans text-[13px] sm:text-[14px] bg-transparent border-none cursor-pointer transition-colors -mb-px whitespace-nowrap"
                style={{
                  fontWeight: on ? 600 : 400,
                  color: on ? '#2C3E63' : '#76766C',
                  borderBottom: on ? '2px solid #2C3E63' : '2px solid transparent',
                }}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: on ? '#D7E0F0' : '#F6F6F4', color: on ? '#2C3E63' : '#76766C' }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <div className="pb-2 pl-3 shrink-0 flex items-end">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 pl-2.5 pr-7 rounded-md border border-warm-200 bg-white font-sans text-[12px] text-warm-500 cursor-pointer outline-none appearance-none focus:border-warm-300 transition-colors"
            >
              <option value="">Tous les types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-warm-200 rounded-md overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>

        {/* Column headers — desktop only */}
        <div
          className="hidden md:grid px-4 lg:px-5 py-3 bg-warm-50"
          style={{ gridTemplateColumns: COLS, borderBottom: '1px solid #DEDED8' }}
        >
          {['EMPLOYÉ', 'TYPE', 'PÉRIODE', 'JOURS', 'STATUT'].map((h) => (
            <span key={h} className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">{h}</span>
          ))}
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 text-center">ACTIONS</span>
        </div>

        {/* Skeleton while loading */}
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 sm:px-5 py-3.5" style={{ borderBottom: '1px solid #DEDED8' }}>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              </div>
            ))
          : filtered.length === 0
            ? (
              <div className="py-12 text-center">
                <p className="font-display text-[16px] text-warm-400 mb-2">Aucune demande.</p>
                <p className="font-sans text-[13px] text-warm-400">Pas de demandes dans cette catégorie.</p>
              </div>
            )
            : paginated.map((l, i) => (
              <div
                key={l.id}
                className="px-4 lg:px-5 py-3.5 transition-colors hover:bg-warm-50"
                style={{ borderBottom: i < paginated.length - 1 ? '1px solid #DEDED8' : 'none' }}
              >

                {/* ── Mobile layout (< md) ── */}
                <div className="md:hidden flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <EmpAvatar name={l.employee} size={32} />
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-medium text-ink-900 leading-tight truncate">{l.employee}</p>
                      <p className="font-sans text-[11px] text-warm-500 mt-0.5">{l.dept} · {l.type}</p>
                      <p className="font-mono text-[10px] text-warm-400 mt-0.5">
                        {l.from.slice(0, -5)} → {l.to.slice(0, -5)} · {l.days}j
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={l.status} />
                    <div className="flex gap-1">
                      {l.status === 'en_attente' ? (
                        <>
                          <button
                            onClick={() => statusMutation.mutate({ id: l.id, status: 'approuve' })}
                            disabled={statusMutation.isPending}
                            title="Approuver"
                            className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer border disabled:opacity-50 transition-colors hover:opacity-80"
                            style={{ background: '#E4F2EA', color: '#2E7D5B', border: '1px solid rgba(46,125,91,.2)' }}
                          >
                            <Check size={12} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => statusMutation.mutate({ id: l.id, status: 'refuse' })}
                            disabled={statusMutation.isPending}
                            title="Refuser"
                            className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer border disabled:opacity-50 transition-colors hover:opacity-80"
                            style={{ background: '#F8E5E2', color: '#B4453A', border: '1px solid rgba(180,69,58,.2)' }}
                          >
                            <X size={12} aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <button className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer border border-warm-200 bg-warm-50 hover:bg-warm-100 transition-colors text-warm-500">
                          <Eye size={12} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(l)}
                        title="Supprimer"
                        className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer text-warm-400 hover:text-[#B4453A] hover:bg-[#F8E5E2] border border-warm-200 transition-colors"
                      >
                        <Trash2 size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Desktop layout (≥ md) ── */}
                <div className="hidden md:grid items-center gap-2" style={{ gridTemplateColumns: COLS }}>
                  {/* Employee */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <EmpAvatar name={l.employee} size={32} />
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-medium text-ink-900 leading-tight truncate">{l.employee}</p>
                      <p className="font-sans text-[11px] text-warm-500 truncate">{l.dept}</p>
                    </div>
                  </div>

                  {/* Type */}
                  <span className="font-sans text-[12px] text-ink-900 truncate">{l.type}</span>

                  {/* Period */}
                  <span className="font-mono text-[11px] text-warm-500 truncate">
                    {l.from.slice(0, -5)} → {l.to.slice(0, -5)}
                  </span>

                  {/* Days */}
                  <span className="font-display text-[15px] font-medium text-ink-900">{l.days}</span>

                  {/* Status */}
                  <div><StatusBadge status={l.status} /></div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1.5">
                    {l.status === 'en_attente' ? (
                      <>
                        <button
                          onClick={() => statusMutation.mutate({ id: l.id, status: 'approuve' })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-1 px-2 lg:px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold cursor-pointer border disabled:opacity-50 transition-colors hover:opacity-80 whitespace-nowrap"
                          style={{ background: '#E4F2EA', color: '#2E7D5B', border: '1px solid rgba(46,125,91,.2)' }}
                        >
                          <Check size={10} aria-hidden="true" />
                          <span className="hidden lg:inline">Approuver</span>
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: l.id, status: 'refuse' })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-1 px-2 lg:px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold cursor-pointer border disabled:opacity-50 transition-colors hover:opacity-80 whitespace-nowrap"
                          style={{ background: '#F8E5E2', color: '#B4453A', border: '1px solid rgba(180,69,58,.2)' }}
                        >
                          <X size={10} aria-hidden="true" />
                          <span className="hidden lg:inline">Refuser</span>
                        </button>
                      </>
                    ) : (
                      <button className="inline-flex items-center gap-1 px-2 lg:px-2.5 py-1 rounded-md font-sans text-[11px] text-warm-500 cursor-pointer border border-warm-200 bg-warm-50 hover:bg-warm-100 transition-colors">
                        <Eye size={10} aria-hidden="true" />
                        <span className="hidden lg:inline">Détails</span>
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(l)}
                      title="Supprimer"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:text-[#B4453A] hover:bg-[#F8E5E2] transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

              </div>
            ))}

        {/* Footer with pagination */}
        {!isLoading && (
          <div
            className="px-4 sm:px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-warm-50"
            style={{ borderTop: '1px solid #DEDED8' }}
          >
            <span className="font-sans text-[12px] text-warm-500">
              {filtered.length === 0
                ? 'Aucun résultat'
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
            </span>
            <AureaPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AddLeaveModal open={addOpen} onClose={() => setAddOpen(false)} />
      <DeleteLeaveModal leave={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
