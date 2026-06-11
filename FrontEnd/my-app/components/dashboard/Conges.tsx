"use client";
import { useState, useMemo } from 'react';
import { CalendarPlus, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useHRStore } from '@/lib/store/useHRStore';
import { StatusBadge } from './shared/StatusBadge';
import { EmpAvatar } from './shared/EmpAvatar';

type TabKey = 'all' | 'en_attente' | 'approuve' | 'refuse';

export function Conges() {
  const leaves        = useHRStore((s) => s.leaves);
  const updateLeave   = useHRStore((s) => s.updateLeave);
  const [tab, setTab]             = useState<TabKey>('all');
  const [typeFilter, setTypeFilter] = useState('');

  const pendingCount = leaves.filter((l) => l.status === 'en_attente').length;
  const types = [...new Set(leaves.map((l) => l.type))].sort();

  const filtered = useMemo(() => {
    let r = tab === 'all' ? [...leaves] : leaves.filter((l) => l.status === tab);
    if (typeFilter) r = r.filter((l) => l.type === typeFilter);
    return r;
  }, [leaves, tab, typeFilter]);

  const approve = (id: number) => { updateLeave(id, 'approuve'); toast.success('Demande approuvée avec succès.'); };
  const refuse  = (id: number) => { updateLeave(id, 'refuse');   toast.error('Demande refusée.'); };

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all',        label: 'Toutes' },
    { key: 'en_attente', label: 'En attente', count: pendingCount },
    { key: 'approuve',   label: 'Approuvées' },
    { key: 'refuse',     label: 'Refusées' },
  ];

  return (
    <div className="p-7 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-[13px] text-warm-500">{leaves.length} demandes au total</p>
        <button
          className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-lg font-sans text-[14px] font-bold border-none cursor-pointer"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)', color: '#0F1729', boxShadow: '0 6px 20px rgba(180,134,47,.28)' }}
        >
          <CalendarPlus size={15} aria-hidden="true" /> Nouvelle demande
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-end" style={{ borderBottom: '1px solid #DEDED8' }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 font-sans text-[14px] bg-transparent border-none cursor-pointer transition-colors -mb-px"
              style={{ fontWeight: on ? 600 : 400, color: on ? '#2C3E63' : '#76766C', borderBottom: on ? '2px solid #2C3E63' : '2px solid transparent' }}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: on ? '#D7E0F0' : '#F6F6F4', color: on ? '#2C3E63' : '#76766C' }}>{t.count}</span>
              )}
            </button>
          );
        })}
        <div className="ml-auto pb-2">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 px-2.5 rounded-md border border-warm-200 bg-white font-sans text-[12px] text-warm-500 cursor-pointer outline-none">
            <option value="">Tous les types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
        <div className="grid px-5 py-3 bg-warm-50" style={{ gridTemplateColumns: '2fr 1fr 1.5fr .7fr 1fr 1.2fr', borderBottom: '1px solid #DEDED8' }}>
          {['EMPLOYÉ', 'TYPE', 'PÉRIODE', 'JOURS', 'STATUT', 'ACTIONS'].map((h) => (
            <span key={h} className="font-mono text-[9.5px] uppercase tracking-[.1em] text-warm-500">{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-display text-[16px] text-warm-400 mb-2">Aucune demande.</p>
            <p className="font-sans text-[13px] text-warm-400">Pas de demandes dans cette catégorie.</p>
          </div>
        ) : filtered.map((l, i) => (
          <div
            key={l.id}
            className="grid px-5 py-3.5 items-center transition-colors hover:bg-warm-50"
            style={{ gridTemplateColumns: '2fr 1fr 1.5fr .7fr 1fr 1.2fr', borderBottom: i < filtered.length - 1 ? '1px solid #DEDED8' : 'none' }}
          >
            <div className="flex items-center gap-2.5">
              <EmpAvatar name={l.employee} size={30} />
              <div>
                <p className="font-sans text-[13px] font-medium text-ink-900 leading-tight">{l.employee}</p>
                <p className="font-sans text-[11px] text-warm-500">{l.dept}</p>
              </div>
            </div>
            <span className="font-sans text-[12px] text-ink-900">{l.type}</span>
            <span className="font-mono text-[11px] text-warm-500">{l.from.slice(0, -5)} → {l.to.slice(0, -5)}</span>
            <span className="font-display text-[16px] font-medium text-ink-900">{l.days}</span>
            <StatusBadge status={l.status} />
            <div className="flex gap-1.5">
              {l.status === 'en_attente' ? (
                <>
                  <button onClick={() => approve(l.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold cursor-pointer border transition-colors hover:opacity-80" style={{ background: '#E4F2EA', color: '#2E7D5B', border: '1px solid rgba(46,125,91,.2)' }}>
                    <Check size={11} aria-hidden="true" /> Approuver
                  </button>
                  <button onClick={() => refuse(l.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold cursor-pointer border transition-colors hover:opacity-80" style={{ background: '#F8E5E2', color: '#B4453A', border: '1px solid rgba(180,69,58,.2)' }}>
                    <X size={11} aria-hidden="true" /> Refuser
                  </button>
                </>
              ) : (
                <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-sans text-[11px] text-warm-500 cursor-pointer border border-warm-200 bg-warm-50 hover:bg-warm-100 transition-colors">
                  <Eye size={11} aria-hidden="true" /> Détails
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
