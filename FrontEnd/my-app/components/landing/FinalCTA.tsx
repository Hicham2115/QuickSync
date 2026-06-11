import { ArrowRight } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { useAppStore } from "@/lib/store/useAppStore";

export function FinalCTA() {
  const openSignUp = useAppStore((s) => s.openSignUp);

  return (
    <section className="py-20 px-12 bg-warm-25">
      <div className="max-w-225 mx-auto">
        <FadeIn>
          <div
            className="rounded-[22px] px-16 py-18 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #0F1729 0%, #131B2C 50%, #1A253C 100%)",
            }}
          >
            {/* Gold glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-10%",
                right: "-5%",
                width: "50%",
                height: "60%",
                background:
                  "radial-gradient(ellipse at 80% 20%, rgba(203,162,74,0.2), transparent 55%)",
              }}
            />
            <h2
              className="relative font-display font-medium text-white tracking-tight mb-4"
              style={{ fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.08 }}
            >
              Prêt à Transformer Votre Gestion RH&nbsp;?
            </h2>
            <p className="relative font-sans text-base text-white/60 leading-[1.65] max-w-105 mx-auto mb-9">
              Rejoignez les entreprises qui font confiance à WorkSync pour gérer
              leurs talents.
            </p>
            <button
              className="relative inline-flex items-center gap-2 px-8 py-3.75 rounded-[10px] text-[15px] font-bold font-sans text-ink-900 transition-all duration-200 hover:brightness-105"
              style={{
                background: "linear-gradient(140deg, #CBA24A, #947024)",
                boxShadow: "0 8px 24px rgba(180,134,47,.38)",
              }}
              onClick={openSignUp}
            >
              Créer mon compte gratuitement
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <p className="relative font-mono text-[10px] text-white/30 tracking-[.06em] mt-4">
              Aucune carte bancaire requise · Configuration en 2 minutes
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
