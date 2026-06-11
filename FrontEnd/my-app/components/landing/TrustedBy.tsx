const COMPANIES = [
  { name: "APEX", letter: "A" },
  { name: "NOVUS", letter: "N" },
  { name: "STRATEX", letter: "S" },
  { name: "LUMIN", letter: "L" },
  { name: "KAIROS", letter: "K" },
  { name: "DELPHI", letter: "D" },
  { name: "ORION", letter: "O" },
  { name: "VANTA", letter: "V" },
];

export function TrustedBy() {
  return (
    <section className="py-14 border-b border-warm-100 bg-white overflow-hidden">
      <p className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-gold-500 text-center mb-9">
        Ils nous font confiance
      </p>

      <div className="relative">
        {/* Edge fade masks */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #fff, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #fff, transparent)" }}
        />

        <div className="flex">
          {[0, 1].map((set) => (
            <div
              key={set}
              className="flex shrink-0 items-center gap-4"
              style={{ animation: "marquee 28s linear infinite" }}
            >
              {COMPANIES.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-25 mx-2 select-none"
                  style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
                >
                  <div className="w-6 h-6 rounded-md bg-ink-50 flex items-center justify-center shrink-0">
                    <span className="font-mono text-[10px] font-bold text-ink-500">
                      {company.letter}
                    </span>
                  </div>
                  <span className="font-display text-sm font-medium tracking-wide text-warm-800 whitespace-nowrap">
                    {company.name}
                  </span>
                </div>
              ))}
              <div className="mx-6 w-1.5 h-1.5 rounded-full bg-warm-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
}
