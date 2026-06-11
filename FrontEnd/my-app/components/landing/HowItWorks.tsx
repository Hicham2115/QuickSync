import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "./FadeIn";

function QuatrefoilIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="20" cy="20" r="11" />
      <circle cx="34" cy="20" r="11" />
      <circle cx="20" cy="34" r="11" />
      <circle cx="34" cy="34" r="11" />
    </svg>
  );
}

function DiamondPairIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.25">
      <rect x="5" y="17" width="20" height="20" rx="2" transform="rotate(45 15 27)" />
      <rect x="29" y="17" width="20" height="20" rx="2" transform="rotate(45 39 27)" />
    </svg>
  );
}

function ConcentricIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="27" cy="27" r="7" />
      <circle cx="27" cy="27" r="14" />
      <circle cx="27" cy="27" r="21" />
    </svg>
  );
}

const STEPS = [
  {
    title: "Créez votre espace",
    desc: "Inscrivez votre entreprise, invitez vos collaborateurs et configurez vos départements en quelques minutes.",
    Icon: QuatrefoilIcon,
    accent: false,
  },
  {
    title: "Centralisez vos données",
    desc: "Importez vos fiches employés, définissez les politiques de congés et paramétrez les workflows d'approbation.",
    Icon: DiamondPairIcon,
    accent: false,
  },
  {
    title: "Pilotez en temps réel",
    desc: "Suivez les indicateurs clés depuis votre tableau de bord, approuvez les demandes et exportez vos rapports.",
    Icon: ConcentricIcon,
    accent: true,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 lg:px-16 bg-warm-25">
      <div className="max-w-6xl mx-auto">

        {/* Split header */}
        <FadeIn>
          <div className="grid lg:grid-cols-2 gap-8 items-end mb-16">
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-500 mb-4">
                Comment ça marche
              </p>
              <h2
                className="font-display font-medium tracking-tight text-ink-900"
                style={{ fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.06 }}
              >
                Opérationnel En<br />Trois Etapes.
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="font-sans text-[17px] text-warm-500 leading-[1.7] max-w-sm lg:ml-auto">
                Une mise en place guidée pour que votre équipe RH soit productive dès le premier jour.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.1}>
              <div
                className="group relative flex flex-col min-h-96 p-8 cursor-pointer"
                style={{
                  background: step.accent ? "#ECEAE3" : "#ffffff",
                  border: step.accent ? "none" : "1px solid #E8E8E3",
                  borderRadius: step.accent ? "16px 80px 16px 16px" : 16,
                  transition: "background 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = step.accent ? "#E2DFD7" : "#F8F7F5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = step.accent ? "#ECEAE3" : "#ffffff";
                }}
              >
                {/* Icon */}
                <div className="text-ink-500 mb-10">
                  <step.Icon />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="font-display text-[20px] font-semibold text-ink-900 mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[14.5px] text-warm-600 leading-[1.65]">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow button */}
                <div className="mt-10">
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={
                      step.accent
                        ? { background: "#1A253C", color: "#fff" }
                        : { border: "1px solid #DEDED8", color: "#2C3E63", background: "transparent" }
                    }
                    aria-label="En savoir plus"
                  >
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
