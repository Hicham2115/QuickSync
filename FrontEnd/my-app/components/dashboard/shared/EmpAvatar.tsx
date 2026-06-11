const PALETTE = ['#2C3E63', '#4A7C6B', '#6B5EA8', '#8B5E3C', '#3C6B8B', '#947024'];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

export function EmpAvatar({ name, size = 34 }: { name: string; size?: number }) {
  const bg = PALETTE[hashName(name) % PALETTE.length];
  const initials = name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: bg }}
    >
      <span className="font-sans font-bold text-white" style={{ fontSize: size * 0.36 }}>
        {initials}
      </span>
    </div>
  );
}
