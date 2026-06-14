"use client";
import { useState } from "react";
import { FadeIn } from "./FadeIn";

const FAQS = [
  {
    q: "QuickSync convient-il aux petites entreprises ?",
    a: "Absolument. Le plan Starter est gratuit jusqu'à 10 employés et couvre toutes les fonctionnalités essentielles — gestion des congés, fiches employés et rapports basiques.",
  },
  {
    q: "Comment fonctionne le workflow de congés ?",
    a: "L'employé soumet une demande, son manager reçoit une notification et peut approuver ou refuser en un clic. Le solde est mis à jour automatiquement en temps réel.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Chiffrement AES-256 au repos, TLS 1.3 en transit, hébergement conforme RGPD, et audit logs complets disponibles depuis le tableau de bord.",
  },
  {
    q: "Peut-on importer des données existantes ?",
    a: "Oui, via import CSV ou Excel. Notre assistant vous guide colonne par colonne pour mapper vos données en quelques minutes.",
  },
  {
    q: "Y a-t-il une API disponible ?",
    a: "Le plan Enterprise inclut un accès API REST complet avec documentation Swagger, webhooks et rate limiting configurable selon vos besoins.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl  border cursor-pointer transition-all duration-250"
      style={{
        background: open ? "#FDFCF9" : "#ffffff",
        borderColor: open ? "#CBA24A" : "#E8E8E3",
        borderLeftWidth: open ? 3 : 1,
        boxShadow: open ? "0 4px 20px rgba(180,134,47,.08)" : "none",
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        {/* Number + Question */}
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="font-mono text-[11px] font-semibold shrink-0 transition-colors duration-200"
            style={{ color: open ? "#CBA24A" : "#B8B8B0" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="font-display text-[16px] font-medium leading-snug transition-colors duration-200"
            style={{ color: open ? "#0F1729" : "#2C3E63" }}
          >
            {q}
          </span>
        </div>

        {/* Toggle icon */}
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250"
          style={
            open
              ? {
                  background: "rgba(203,162,74,0.12)",
                  border: "1px solid rgba(203,162,74,0.35)",
                }
              : { background: "#F4F4F0", border: "1px solid #E8E8E3" }
          }
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transition: "transform 0.25s ease",
              transform: open ? "rotate(45deg)" : "none",
            }}
          >
            <line
              x1="6"
              y1="1"
              x2="6"
              y2="11"
              stroke={open ? "#CBA24A" : "#6B7280"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="1"
              y1="6"
              x2="11"
              y2="6"
              stroke={open ? "#CBA24A" : "#6B7280"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Answer — grid trick for smooth height */}
      <div
        className="grid transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="font-sans text-[14.5px] text-warm-600 leading-[1.75] px-6 pb-5 pt-0 pl-[4.5rem]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-6 lg:px-16 bg-warm-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-12 lg:gap-20 items-start">
        {/* Left — sticky header */}
        <FadeIn>
          <div className="lg:sticky lg:top-28">
            {/* Accent line */}
            <div
              className="w-8 h-0.5 rounded-full mb-5"
              style={{ background: "linear-gradient(90deg, #CBA24A, #947024)" }}
            />

            <p className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-500 mb-3">
              FAQ
            </p>
            <h2
              className="font-display font-medium tracking-tight text-ink-900 mb-5"
              style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.1 }}
            >
              Questions
              <br />
              Fréquentes.
            </h2>
            <p className="font-sans text-[14px] text-warm-500 leading-[1.7] mb-1">
              Vous ne trouvez pas votre réponse ?
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-ink-500 hover:text-gold-500 transition-colors duration-200"
            >
              Contactez-nous
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {/* Count badge */}
            <div
              className="inline-flex items-center gap-2 mt-8 px-3.5 py-1.5 rounded-full border"
              style={{
                background: "#FBF7EC",
                borderColor: "rgba(203,162,74,0.3)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="font-mono text-[11px] text-gold-600 font-medium">
                {FAQS.length} questions
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Right — accordion */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.q} {...faq} index={i} />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
