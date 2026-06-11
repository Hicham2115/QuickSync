"use client";
import { useState, useMemo } from 'react';
import { Search, UserPlus, LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';
import { EMPLOYEES_DATA, Employee } from '@/lib/mock/hr-data';
import { StatusBadge } from './shared/StatusBadge';
import { EmpAvatar } from './shared/EmpAvatar';

type SortKey = keyof Pick<Employee, 'name' | 'dept' | 'title' | 'hired' | 'status'>;
const COLS: { key: SortKey; label: string }[] = [
  { key: 'name',   label: 'EMPLOYÉ' },
  { key: 'dept',   label: 'DÉPARTEMENT' },
  { key: 'title',  label: 'POSTE' },
  { key: 'hired',  label: "DATE D'EMBAUCHE" },
  { key: 'status', label: 'STATUT' },
];
const DEPTS = [...new Set(EMPLOYEES_DATA.map((e) => e.dept))].sort();

export function Personnel() {
  const [search, setSearch]         = useState('');
  const [dept, setDept]             = useState('');
  const [status, setStatus]         = useState('');
  const [view, setView]             = useState<'table' | 'cards'>('table');
  const [sortCol, setSortCol]       = useState<SortKey>('name');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('asc');

  const toggleSort = (col: SortKey) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let r = [...EMPLOYEES_DATA];
    if (search) r = r.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()));
    if (dept)   r = r.filter((e) => e.dept === dept);
    if (status) r = r.filter((e) => e.status === status);
    r.sort((a, b) => {
      const av = String(a[sortCol]); const bv = String(b[sortCol]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [search, dept, status, sortCol, sortDir]);

  return (
    <div className="p-7 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-[13px] text-warm-500">247 collaborateurs</p>
        <button
          className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-lg font-sans text-[14px] font-bold border-none cursor-pointer"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)', color: '#0F1729', boxShadow: '0 6px 20px rgba(180,134,47,.28)' }}
        >
          <UserPlus size={15} aria-hidden="true" /> Ajouter un employé
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2.5 items-center">
        <div className="flex items-center gap-2 px-3 border border-warm-300 bg-white rounded-lg h-[38px] w-[280px] shrink-0">
          <Search size={14} className="text-warm-400 shrink-0" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un employé..." className="flex-1 border-none outline-none bg-transparent font-sans text-[13px] text-ink-900 placeholder:text-warm-400" />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="h-[38px] px-3 rounded-lg border border-warm-300 bg-white font-sans text-[13px] cursor-pointer outline-none text-warm-500">
          <option value="">Tous les départements</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-[38px] px-3 rounded-lg border border-warm-300 bg-white font-sans text-[13px] cursor-pointer outline-none text-warm-500">
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="En congé">En congé</option>
          <option value="Inactif">Inactif</option>
        </select>
        <div className="ml-auto flex gap-1">
          {([['table', List], ['cards', LayoutGrid]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} className="w-9 h-9 rounded-lg border border-warm-200 flex items-center justify-center cursor-pointer transition-colors" style={{ background: view === v ? '#EEF2F9' : '#fff' }}>
              <Icon size={15} color={view === v ? '#2C3E63' : '#76766C'} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
          <div className="grid px-5 py-3 bg-warm-50" style={{ gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr', borderBottom: '1px solid #DEDED8' }}>
            {COLS.map(({ key, label }) => (
              <button key={key} onClick={() => toggleSort(key)} className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[.1em] text-warm-500 bg-transparent border-none cursor-pointer p-0 font-medium">
                {label} {sortCol === key ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <span className="w-3 inline-block" />}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-[16px] text-warm-400 mb-2">Aucun employé trouvé.</p>
              <p className="font-sans text-[13px] text-warm-400">Essayez de modifier vos filtres.</p>
            </div>
          ) : filtered.map((emp, i) => (
            <div key={emp.id} className="grid px-5 py-3.5 items-center transition-colors hover:bg-warm-50 cursor-pointer" style={{ gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr', borderBottom: i < filtered.length - 1 ? '1px solid #DEDED8' : 'none' }}>
              <div className="flex items-center gap-3">
                <EmpAvatar name={emp.name} size={34} />
                <div>
                  <p className="font-sans text-[13px] font-semibold text-ink-900 leading-tight">{emp.name}</p>
                  <p className="font-sans text-[11px] text-warm-500">{emp.email}</p>
                </div>
              </div>
              <span className="font-sans text-[13px] text-ink-900">{emp.dept}</span>
              <span className="font-sans text-[12px] text-warm-500">{emp.title}</span>
              <span className="font-mono text-[11px] text-warm-500">{emp.hired}</span>
              <StatusBadge status={emp.status} />
            </div>
          ))}
          <div className="px-5 py-3 flex items-center justify-between bg-warm-50" style={{ borderTop: '1px solid #DEDED8' }}>
            <span className="font-sans text-[12px] text-warm-500">Affichage {filtered.length} sur {EMPLOYEES_DATA.length}</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {filtered.map((emp) => (
            <div key={emp.id} className="bg-white border border-warm-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
              <div className="h-14" style={{ background: 'linear-gradient(135deg,#1A253C,#2C3E63)' }} />
              <div className="px-4 pb-4" style={{ marginTop: -24 }}>
                <div className="flex items-end justify-between mb-2.5">
                  <div className="p-[3px] rounded-full" style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)' }}>
                    <EmpAvatar name={emp.name} size={44} />
                  </div>
                  <StatusBadge status={emp.status} />
                </div>
                <p className="font-display text-[16px] font-medium text-ink-900 leading-tight">{emp.name}</p>
                <p className="font-sans text-[12px] text-warm-500 mt-0.5">{emp.title}</p>
                <div className="border-t border-warm-200 mt-3 pt-2.5 grid grid-cols-2 gap-1.5">
                  <div><p className="font-mono text-[9px] uppercase tracking-[.1em] text-warm-400">DEPT</p><p className="font-sans text-[12px] font-medium text-ink-900 mt-0.5">{emp.dept}</p></div>
                  <div><p className="font-mono text-[9px] uppercase tracking-[.1em] text-warm-400">CONGÉS</p><p className="font-sans text-[12px] font-medium text-ink-900 mt-0.5">{emp.leaves} j</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
