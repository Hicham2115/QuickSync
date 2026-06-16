const PALETTE = ['#2C3E63', '#4A7C6B', '#6B5EA8', '#8B5E3C', '#3C6B8B', '#947024'];

function hashName(name: string): number {
  if (!name) return 0;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

export function EmpAvatar({ name, size = 34 }: { name?: string; size?: number }) {
  const safe = name ?? "";
  const bg = PALETTE[hashName(safe) % PALETTE.length];
  const initials = safe.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || "?";
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: bg }}
    >
      <span className="font-sans font-bold text-white leading-none" style={{ fontSize: size * 0.36 }}>
        {initials}
      </span>
    </div>
  );
}
