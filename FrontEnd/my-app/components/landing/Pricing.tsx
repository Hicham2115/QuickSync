"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { FadeIn } from "./FadeIn";

interface Plan {
  name: string;
  price: string;
  period?: string;
  cta: string;
  ctaVariant: "gold" | "ghost";
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "Gratuit",
    cta: "Commencer",
    ctaVariant: "ghost",
    features: [
      "Jusqu'à 10 employés",
      "Gestion des congés",
      "1 département",
      "Rapports basiques",
    ],
  },
  {
    name: "Pro",
    price: "49 DH",
    period: "/mois",
    cta: "Choisir Pro",
    ctaVariant: "gold",
    popular: true,
    features: [
      "Employés illimités",
      "Tous les modules",
      "Exports PDF/Excel",
      "Support prioritaire",
      "Rôles & permissions",
    ],
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    cta: "Nous contacter",
    ctaVariant: "ghost",
    features: [
      "Tout dans Pro",
      "SSO / SAML",
      "API dédiée",
      "SLA garanti",
      "Account manager",
    ],
  },
];

function PlanCTA({
  variant,
  label,
}: {
  variant: "gold" | "ghost";
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isGold = variant === "gold";
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full mt-7 py-3 rounded-lg text-sm font-bold font-sans cursor-pointer transition-all duration-200 border"
      style={
        isGold
          ? {
              background: "linear-gradient(140deg, #CBA24A, #947024)",
              color: "#0F1729",
              borderColor: "transparent",
              boxShadow: hovered
                ? "0 8px 24px rgba(180,134,47,.38)"
                : "0 4px 14px rgba(180,134,47,.28)",
            }
          : {
              background: hovered ? "#EEF2F9" : "transparent",
              color: "#2C3E63",
              borderColor: hovered ? "#7E96C7" : "#C4C4BB",
            }
      }
    >
      {label}
    </button>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 lg:px-12 bg-warm-25">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="text-center mb-13">
            <p className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-500 mb-3.5">
              Tarifs
            </p>
            <h2
              className="font-display font-medium tracking-tight text-ink-900 mb-4"
              style={{ fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.08 }}
            >
              Un Plan Simple, Transparent.
            </h2>
            <p className="font-sans text-[17px] text-warm-600 leading-[1.65]">
              Pas de frais cachés. Passez à l&apos;échelle quand vous êtes prêt.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.08} className="flex">
              <div
                className="group bg-white rounded-[18px] px-7 py-8 relative cursor-pointer flex flex-col w-full"
                style={{
                  border: plan.popular
                    ? "2px solid #CBA24A"
                    : "1px solid #DEDED8",
                  boxShadow: plan.popular
                    ? "0 6px 20px rgba(180,134,47,.2)"
                    : "0 1px 2px rgba(15,23,41,.05)",
                  transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  if (plan.popular) {
                    el.style.borderColor = "#E0BB6A";
                    el.style.boxShadow = "0 8px 32px rgba(180,134,47,.35)";
                  } else {
                    el.style.borderColor = "#CBA24A";
                    el.style.boxShadow = "0 4px 20px rgba(180,134,47,.14)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = plan.popular ? "#CBA24A" : "#DEDED8";
                  el.style.boxShadow = plan.popular
                    ? "0 6px 20px rgba(180,134,47,.2)"
                    : "0 1px 2px rgba(15,23,41,.05)";
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold tracking-widest uppercase text-ink-900 px-3.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      background: "linear-gradient(140deg, #CBA24A, #947024)",
                    }}
                  >
                    POPULAIRE
                  </div>
                )}
                <div className="font-display text-[22px] font-medium text-ink-900 mb-2">
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-0.5 mb-6">
                  <span className="font-display text-[38px] font-medium text-ink-900 leading-none">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-sans text-sm text-warm-500">
                      {plan.period}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex gap-2 items-start">
                      <Check
                        aria-hidden="true"
                        size={15}
                        color="#2E7D5B"
                        className="mt-px shrink-0"
                      />
                      <span className="font-sans text-sm text-warm-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <PlanCTA variant={plan.ctaVariant} label={plan.cta} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
