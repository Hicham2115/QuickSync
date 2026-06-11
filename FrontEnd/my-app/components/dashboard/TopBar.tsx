"use client";
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useHRStore } from '@/lib/store/useHRStore';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':               'Tableau de bord',
  '/dashboard/personnel':     'Personnel',
  '/dashboard/conges':        'Congés',
  '/dashboard/departements':  'Départements',
  '/dashboard/rapports':      'Rapports',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/parametres':    'Paramètres',
};

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Tableau de bord';
  const pendingCount = useHRStore((s) => s.leaves.filter((l) => l.status === 'en_attente').length);

  return (
    <header
      className="h-16 flex items-center justify-between px-7 shrink-0 z-30"
      style={{ background: 'rgba(251,251,250,.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #DEDED8' }}
    >
      <span className="font-display text-[20px] font-medium text-ink-900" style={{ letterSpacing: '-0.01em' }}>
        {title}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-200 bg-warm-50 font-sans text-[13px] text-warm-500 cursor-pointer select-none">
          <Search size={14} aria-hidden="true" />
          <span>Rechercher...</span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-warm-200 text-warm-500">⌘K</span>
        </div>
        <button className="relative w-9 h-9 rounded-lg border border-warm-200 bg-transparent flex items-center justify-center cursor-pointer hover:bg-warm-50 transition-colors">
          <Bell size={15} className="text-warm-500" aria-hidden="true" />
          {pendingCount > 0 && (
            <div
              className="absolute top-[7px] right-[7px] w-[7px] h-[7px] rounded-full bg-[#B4453A]"
              style={{ border: '1.5px solid #FBFBFA' }}
            />
          )}
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)' }}
        >
          <span className="font-sans text-[12px] font-bold" style={{ color: '#0F1729' }}>FZ</span>
        </div>
      </div>
    </header>
  );
}
