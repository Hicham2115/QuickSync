"use client";
import Link from 'next/link';
import { UserPlus, CalendarPlus, Building2, FileDown } from 'lucide-react';
import { DASHBOARD_STATS } from '@/lib/mock/hr-data';
import { useHRStore } from '@/lib/store/useHRStore';
import { StatusBadge } from './shared/StatusBadge';
import { EmpAvatar } from './shared/EmpAvatar';

function StatCard({ label, value, delta, deltaLabel, trend }: {
  label: string;
  value: string | number;
  delta?: number | string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? '#2E7D5B' : trend === 'down' ? '#B4453A' : '#76766C';
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  return (
    <div className="bg-white border border-warm-200 rounded-xl p-5 flex flex-col gap-2.5" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
      <p className="font-mono text-[10px] uppercase tracking-[.1em] text-warm-500">{label}</p>
      <p className="font-display text-[36px] font-medium leading-none text-ink-900" style={{ letterSpacing: '-0.02em' }}>{value}</p>
      <div className="flex items-center gap-1.5">
        {arrow && <span className="font-sans text-[12px] font-semibold" style={{ color: trendColor }}>{arrow} {typeof delta === 'number' ? `${Math.abs(delta)}%` : delta}</span>}
        {deltaLabel && <span className="font-sans text-[12px] text-warm-500">{deltaLabel}</span>}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: UserPlus,     label: 'Ajouter un employé',    href: '/dashboard/personnel' },
  { icon: CalendarPlus, label: 'Nouvelle demande',       href: '/dashboard/conges' },
  { icon: Building2,    label: 'Gérer les départements', href: '/dashboard/departements' },
  { icon: FileDown,     label: 'Exporter le rapport',    href: '/dashboard/rapports' },
];

export function Overview() {
  const leaves = useHRStore((s) => s.leaves);
  const pendingCount = leaves.filter((l) => l.status === 'en_attente').length;
  const recent = leaves.slice(0, 5);

  return (
    <div className="p-7 flex flex-col gap-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl px-8 py-6 relative overflow-hidden flex items-center justify-between"
        style={{ background: 'linear-gradient(140deg,#0F1729 0%,#131B2C 50%,#1A253C 100%)' }}
      >
        <div className="absolute top-[-20%] right-0 w-[40%] h-[140%] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 30%, rgba(203,162,74,.18), transparent 60%)' }} />
        <div className="relative z-10">
          <p className="font-display text-[22px] font-medium text-white mb-1">Bonjour, Fatima Zahra 👋</p>
          <p className="font-sans text-[13px]" style={{ color: 'rgba(255,255,255,.55)' }}>Voici le résumé de votre activité du jour.</p>
        </div>
        <p className="relative z-10 font-mono text-[11px] capitalize" style={{ color: 'rgba(255,255,255,.35)', letterSpacing: '.06em' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Effectif total"      value={DASHBOARD_STATS.totalEmployees} delta={4}                           deltaLabel="ce mois"  trend="up"      />
        <StatCard label="Congés en attente"   value={pendingCount}                   deltaLabel="à traiter"               trend="neutral" />
        <StatCard label="Taux de présence"    value={DASHBOARD_STATS.presenceRate}   delta={DASHBOARD_STATS.presenceDelta} deltaLabel="vs mois dernier" trend="up" />
        <StatCard label="Départements"        value={DASHBOARD_STATS.departments}    deltaLabel="312 postes"               trend="neutral" />
      </div>

      {/* 2-col */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Recent leaves table */}
        <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #DEDED8' }}>
            <span className="font-display text-[17px] font-medium text-ink-900">Dernières demandes de congés</span>
            <Link href="/dashboard/conges" className="font-sans text-[13px] font-medium text-ink-400 hover:text-ink-600 transition-colors no-underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid px-5 py-2.5 bg-warm-50" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr', borderBottom: '1px solid #DEDED8' }}>
            {['EMPLOYÉ', 'TYPE', 'PÉRIODE', 'STATUT'].map((h) => (
              <span key={h} className="font-mono text-[9.5px] uppercase tracking-[.1em] text-warm-500">{h}</span>
            ))}
          </div>
          {recent.map((l, i) => (
            <div
              key={l.id}
              className="grid px-5 py-3 items-center transition-colors hover:bg-warm-50 cursor-pointer"
              style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr', borderBottom: i < recent.length - 1 ? '1px solid #DEDED8' : 'none' }}
            >
              <div className="flex items-center gap-2.5">
                <EmpAvatar name={l.employee} size={30} />
                <div>
                  <p className="font-sans text-[13px] font-medium text-ink-900 leading-tight">{l.employee}</p>
                  <p className="font-sans text-[11px] text-warm-500">{l.dept}</p>
                </div>
              </div>
              <span className="font-sans text-[12px] text-ink-900">{l.type}</span>
              <span className="font-mono text-[11px] text-warm-500">{l.from.split(' ').slice(0, 2).join(' ')}–{l.to.split(' ').slice(0, 2).join(' ')}</span>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-warm-200 rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,23,41,.06)' }}>
          <p className="font-display text-[16px] font-medium text-ink-900 mb-3.5">Actions rapides</p>
          <div className="flex flex-col gap-2">
            {QUICK_ACTIONS.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50 font-sans text-[13px] font-medium text-ink-900 no-underline transition-all hover:bg-ink-50 hover:border-ink-200 hover:text-ink-500 duration-150"
              >
                <Icon size={15} aria-hidden="true" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
