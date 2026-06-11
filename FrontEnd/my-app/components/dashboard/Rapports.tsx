"use client";
import { FileDown } from 'lucide-react';
import { DEPARTMENTS_DATA } from '@/lib/mock/hr-data';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const TREND   = [220, 228, 231, 235, 237, 241, 243, 244, 245, 246, 247, 247];
const KPI_TILES = [
  { label: 'Effectif total',    value: 247,   delta: '+4',          color: '#2E7D5B' },
  { label: 'Taux de turnover',  value: '3.2%', delta: '-0.8%',      color: '#2E7D5B' },
  { label: "Jours d'absence",   value: 48,    delta: '+6 ce mois',  color: '#76766C' },
  { label: 'Congés approuvés',  value: 18,    delta: 'ce mois',     color: '#76766C' },
];
const maxCount = Math.max(...DEPARTMENTS_DATA.map((d) => d.count));

export function Rapports() {
  return (
    <div className="p-7 flex flex-col gap-5">
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-warm-200 bg-white font-sans text-[13px] text-warm-500 cursor-pointer hover:bg-warm-50 transition-colors" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
          <FileDown size={14} aria-hidden="true" /> Exporter tout
        </button>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4">
        {KPI_TILES.map((t) => (
          <div key={t.label} className="bg-white border border-warm-200 rounded-xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
            <p className="font-mono text-[10px] uppercase tracking-[.1em] text-warm-500 mb-2">{t.label}</p>
            <p className="font-display text-[32px] font-medium leading-none text-ink-900 mb-1.5" style={{ letterSpacing: '-0.02em' }}>{t.value}</p>
            <p className="font-sans text-[12px] font-semibold" style={{ color: t.color }}>{t.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Headcount trend bar chart */}
        <div className="bg-white border border-warm-200 rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
          <p className="font-display text-[16px] font-medium text-ink-900 mb-1">Évolution de l'effectif</p>
          <p className="font-sans text-[12px] text-warm-500 mb-5">12 derniers mois</p>
          <div className="flex items-end gap-1.5 h-[120px]">
            {TREND.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t-[3px] transition-all duration-300"
                  style={{ height: `${(v / 250) * 100}%`, background: i === 11 ? '#2C3E63' : '#D7E0F0' }}
                />
                <span className="font-mono text-[8px] text-warm-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dept breakdown horizontal bars */}
        <div className="bg-white border border-warm-200 rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
          <p className="font-display text-[16px] font-medium text-ink-900 mb-1">Répartition par département</p>
          <p className="font-sans text-[12px] text-warm-500 mb-4">Effectif par unité</p>
          <div className="flex flex-col gap-2.5">
            {DEPARTMENTS_DATA.slice(0, 6).map((d) => (
              <div key={d.id} className="flex items-center gap-2.5">
                <span className="font-sans text-[12px] text-ink-900 w-[90px] shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-2 rounded-full bg-warm-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(d.count / maxCount) * 100}%`, background: d.color }} />
                </div>
                <span className="font-mono text-[11px] text-warm-500 w-6 text-right shrink-0">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
