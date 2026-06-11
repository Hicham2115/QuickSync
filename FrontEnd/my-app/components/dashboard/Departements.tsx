"use client";
import { Plus, Building2 } from 'lucide-react';
import { DEPARTMENTS_DATA } from '@/lib/mock/hr-data';

export function Departements() {
  return (
    <div className="p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[13px] text-warm-500">{DEPARTMENTS_DATA.length} départements</p>
        <button
          className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-lg font-sans text-[14px] font-bold border-none cursor-pointer"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)', color: '#0F1729', boxShadow: '0 6px 20px rgba(180,134,47,.28)' }}
        >
          <Plus size={15} aria-hidden="true" /> Ajouter un département
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
        {DEPARTMENTS_DATA.map((d) => (
          <div
            key={d.id}
            className="bg-white border border-warm-200 rounded-2xl p-5 cursor-pointer transition-shadow hover:shadow-md"
            style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center" style={{ background: d.color + '22' }}>
                <Building2 size={20} color={d.color} aria-hidden="true" />
              </div>
              <span
                className="font-mono text-[11px] font-semibold rounded-full px-2.5 py-[3px]"
                style={{ color: d.color, background: d.color + '18' }}
              >
                {d.count} emp.
              </span>
            </div>
            <p className="font-display text-[18px] font-medium text-ink-900 mb-1">{d.name}</p>
            <p className="font-sans text-[12px] text-warm-500 mb-3.5">Responsable : {d.head}</p>
            <div className="h-1 rounded-full bg-warm-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(d.active / d.count) * 100}%`, background: d.color }}
              />
            </div>
            <p className="font-sans text-[11px] text-warm-500 mt-1.5">{d.active} actifs sur {d.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
