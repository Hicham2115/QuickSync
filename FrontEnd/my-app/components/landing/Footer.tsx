import { Globe, Rss, GitBranch, AtSign } from "lucide-react";
import { LogoMark } from "./LogoMark";

const FOOTER_COLS = [
  { title: "Produit",     links: ["Fonctionnalités", "Tarifs", "Changelog", "Roadmap"] },
  { title: "Ressources",  links: ["Documentation", "API", "Blog", "Guides"] },
  { title: "Entreprise",  links: ["À propos", "Carrières", "Contact", "Partenaires"] },
  { title: "Légal",       links: ["Conditions d'utilisation", "Confidentialité", "RGPD", "Mentions légales"] },
];

const SOCIAL_LINKS = [
  { Icon: AtSign,    label: "X" },
  { Icon: Globe,     label: "Site" },
  { Icon: Rss,       label: "Blog" },
  { Icon: GitBranch, label: "GitHub" },
] as const;

export function Footer() {
  return (
    <footer className="bg-warm-50 px-6 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-10">
        {/* Columns grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr_1fr] gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark size={28} />
              <span className="font-display text-base font-medium text-ink-900">QuickSync</span>
            </div>
            <p className="font-sans text-[13px] text-warm-500 leading-[1.7] max-w-55 mb-5">
              La plateforme RH moderne pour les équipes ambitieuses.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label} className="text-warm-400 hover:text-ink-900 transition-colors duration-200">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="font-sans text-[13px] font-semibold text-ink-900 mb-3.5">{col.title}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <a key={link} href="#" className="font-sans text-[13px] text-warm-500 hover:text-ink-900 transition-colors duration-200">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-warm-100 pt-6 flex items-center justify-between flex-wrap gap-3">
          <span className="font-mono text-[11px] text-warm-400">© 2026 QuickSync. Tous droits réservés.</span>
          <div className="flex gap-6 flex-wrap">
            {["Confidentialité", "Conditions", "Cookies"].map((l) => (
              <a key={l} href="#" className="font-sans text-[12px] text-warm-400 underline underline-offset-2 hover:text-ink-900 transition-colors duration-200">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
