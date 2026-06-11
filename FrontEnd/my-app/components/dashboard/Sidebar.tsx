"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, CalendarDays, Building2,
  BarChart3, Bell, Settings, ChevronUp, LogOut,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'PRINCIPAL',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard' },
      { icon: Users,           label: 'Personnel',       href: '/dashboard/personnel' },
      { icon: CalendarDays,    label: 'Congés',          href: '/dashboard/conges' },
      { icon: Building2,       label: 'Départements',    href: '/dashboard/departements' },
    ],
  },
  {
    label: 'OUTILS',
    items: [
      { icon: BarChart3, label: 'Rapports',       href: '/dashboard/rapports' },
      { icon: Bell,      label: 'Notifications',  href: '/dashboard/notifications' },
      { icon: Settings,  label: 'Paramètres',     href: '/dashboard/parametres' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="w-64 flex flex-col h-screen shrink-0" style={{ background: '#131B2C' }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)' }}
        >
          <span className="font-display text-[18px] font-semibold leading-none" style={{ color: '#0F1729' }}>A</span>
        </div>
        <span className="font-display text-[17px] font-medium text-white" style={{ letterSpacing: '-0.01em' }}>aurea</span>
        <span className="font-mono text-[9px] text-gold-300" style={{ letterSpacing: '3px' }}>HR</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="font-mono text-[10px] uppercase mb-1.5 pl-2" style={{ letterSpacing: '.12em', color: 'rgba(255,255,255,.28)' }}>
              {group.label}
            </p>
            {group.items.map(({ icon: Icon, label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 relative no-underline transition-colors duration-150"
                  style={{ background: active ? 'rgba(255,255,255,.1)' : undefined }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = ''; }}
                >
                  {active && (
                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px]" style={{ background: '#CBA24A' }} />
                  )}
                  <Icon size={15} color={active ? '#fff' : 'rgba(255,255,255,.45)'} />
                  <span
                    className="font-sans text-[13px]"
                    style={{ fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,.58)' }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 relative" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
        {menuOpen && (
          <div
            className="absolute bottom-[calc(100%+4px)] left-3 right-3 rounded-[10px] overflow-hidden z-50"
            style={{ background: '#1A253C', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}
          >
            <button
              onClick={() => { router.push('/dashboard/parametres'); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left font-sans text-[13px] text-white bg-transparent border-none cursor-pointer"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Settings size={13} /> Paramètres
            </button>
            <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
            <button
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left font-sans text-[13px] bg-transparent border-none cursor-pointer"
              style={{ color: '#B4453A' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(180,69,58,.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={13} /> Se déconnecter
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-transparent border-none cursor-pointer"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(140deg,#CBA24A,#947024)' }}
          >
            <span className="font-sans text-[13px] font-bold" style={{ color: '#0F1729' }}>FZ</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-sans text-[13px] font-semibold text-white truncate">Fatima Zahra Alami</p>
            <p className="font-sans text-[11px]" style={{ color: 'rgba(255,255,255,.4)' }}>Responsable RH</p>
          </div>
          <ChevronUp
            size={13}
            color="rgba(255,255,255,.4)"
            style={{ transform: menuOpen ? 'none' : 'rotate(180deg)', transition: 'transform .2s', flexShrink: 0 }}
          />
        </button>
      </div>
    </aside>
  );
}
