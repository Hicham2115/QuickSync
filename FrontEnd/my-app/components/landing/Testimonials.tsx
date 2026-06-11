import { FadeIn } from "./FadeIn";

const OVERALL = 4.8;
const TOTAL = "848 avis";

const RATING_BARS = [
  { stars: 5, count: "580 avis", pct: 68 },
  { stars: 4, count: "188 avis", pct: 22 },
  { stars: 3, count: "52 avis", pct: 6 },
  { stars: 2, count: "17 avis", pct: 2 },
  { stars: 1, count: "11 avis", pct: 2 },
];

const CATEGORIES = [
  { label: "Facilité d'utilisation", score: 4.9 },
  { label: "Support client", score: 4.8 },
  { label: "Onboarding", score: 4.7 },
  { label: "Valeur", score: 4.8 },
  { label: "Fonctionnalités", score: 4.6 },
];

const REVIEWS = [
  {
    name: "Nadia Benjelloun",
    role: "DRH · FinanceGroup",
    date: "il y a 2 mois",
    rating: 5,
    quote:
      "Depuis WorkSync, le traitement des congés est passé de 3 jours à 3 minutes. L'interface est un plaisir à utiliser au quotidien.",
  },
  {
    name: "Karim El Idrissi",
    role: "CEO · TechNova",
    date: "il y a 1 mois",
    rating: 5,
    quote:
      "Enfin une plateforme RH qui ne ressemble pas à un logiciel des années 2000. Moderne, rapide, fiable — exactement ce qu'il nous fallait.",
  },
  {
    name: "Salma Ait Ouarab",
    role: "Office Manager · Créalab",
    date: "il y a 3 mois",
    rating: 4,
    quote:
      "Le tableau de bord me donne une vision claire de toute l'équipe. Les rapports automatiques me font gagner plusieurs heures chaque semaine.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.5l1.545 3.13 3.455.5-2.5 2.435.59 3.435L8 9.385l-3.09 1.615.59-3.435L3 5.13l3.455-.5L8 1.5z"
            fill={i <= rating ? "#CBA24A" : "#E8E8E3"}
            stroke={i <= rating ? "#B4862F" : "#DEDED8"}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-warm-25">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <FadeIn>
          <p className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-500 mb-2">
            Témoignages
          </p>
          <h2
            className="font-display font-medium tracking-tight text-ink-900 mb-8"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.08 }}
          >
            Ce Que Nos Utilisateurs En Disent.
          </h2>
          <div className="h-px bg-warm-200 mb-10" />
        </FadeIn>

        {/* Rating summary */}
        <FadeIn delay={0.05}>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 mb-8">
            {/* Left — overall score */}
            <div className="flex flex-col justify-center items-start shrink-0 sm:border-r sm:border-warm-200 sm:pr-12">
              <span
                className="font-display font-semibold text-ink-900 leading-none mb-2"
                style={{ fontSize: 56 }}
              >
                {OVERALL}
              </span>
              <Stars rating={Math.round(OVERALL)} size={20} />
              <span className="font-sans text-sm text-warm-500 mt-2">
                {TOTAL}
              </span>
            </div>

            {/* Right — bar chart */}
            <div className="flex-1 flex flex-col justify-center gap-2">
              {RATING_BARS.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20 shrink-0">
                    <span className="font-sans text-[13px] font-semibold text-ink-900 w-3 text-right">
                      {row.stars}
                    </span>
                    <span className="font-sans text-[12px] text-warm-500">
                      .0
                    </span>
                  </div>
                  {/* Track */}
                  <div className="flex-1 h-2 rounded-full bg-warm-200 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.pct}%`,
                        background: "linear-gradient(90deg, #CBA24A, #947024)",
                      }}
                    />
                  </div>
                  <span className="font-sans text-[12px] text-warm-500 w-20 shrink-0 text-right">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Category score pills */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2.5 mb-10">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-warm-200 font-sans text-sm"
                style={{ boxShadow: "0 1px 2px rgba(15,23,41,.04)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: cat.score >= 4.5 ? "#B4862F" : "#2C3E63" }}
                >
                  {cat.score}
                </span>
                <span className="text-warm-600">{cat.label}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-warm-200 mb-0" />
        </FadeIn>

        {/* Individual reviews */}
        <div>
          {REVIEWS.map((review, i) => (
            <FadeIn key={review.name} delay={i * 0.08}>
              <div className="py-8">
                {/* Row 1 — avatar + meta + rating */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-sans text-xs font-bold text-ink-900"
                      style={{
                        background: "linear-gradient(140deg, #CBA24A, #947024)",
                      }}
                    >
                      {initials(review.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans text-[15px] font-semibold text-ink-900">
                          {review.name}
                        </span>
                        <span className="font-sans text-[13px] text-warm-400">
                          {review.date}
                        </span>
                      </div>
                      <span className="font-sans text-[12px] text-warm-500">
                        {review.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-display text-[17px] font-semibold text-ink-900">
                      {review.rating}.0
                    </span>
                    <Stars rating={review.rating} size={15} />
                  </div>
                </div>

                {/* Review text */}
                <p className="font-sans text-[15px] text-warm-700 leading-[1.7] max-w-3xl">
                  {review.quote}
                </p>
              </div>
              {i < REVIEWS.length - 1 && <div className="h-px bg-warm-200" />}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
