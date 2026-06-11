const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  approuve:   { label: 'Approuvé',   color: '#2E7D5B', bg: '#E4F2EA' },
  en_attente: { label: 'En attente', color: '#B4862F', bg: '#FBF1D9' },
  refuse:     { label: 'Refusé',     color: '#B4453A', bg: '#F8E5E2' },
  Actif:      { label: 'Actif',      color: '#2E7D5B', bg: '#E4F2EA' },
  'En congé': { label: 'En congé',   color: '#B4862F', bg: '#FBF1D9' },
  Inactif:    { label: 'Inactif',    color: '#76766C', bg: '#F6F6F4' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: '#76766C', bg: '#F6F6F4' };
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold font-sans rounded-full px-[9px] py-[3px] whitespace-nowrap"
      style={{ color: s.color, background: s.bg }}
    >
      <span className="w-[5px] h-[5px] rounded-full bg-current shrink-0" />
      {s.label}
    </span>
  );
}
