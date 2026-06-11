interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 36 }: LogoMarkProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "linear-gradient(140deg, #CBA24A, #947024)",
        boxShadow: "0 4px 14px rgba(180,134,47,.38)",
      }}
    >
      <span
        className="font-display leading-none text-ink-900"
        style={{ fontSize: size * 0.52, fontWeight: 700 }}
      >
        W
      </span>
    </div>
  );
}
