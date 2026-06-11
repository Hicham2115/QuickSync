import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Aurea HR — Gérez vos talents avec élégance",
  description:
    "Une plateforme intuitive pour le suivi du personnel, la gestion des congés et l'analyse RH — conçue pour les équipes modernes.",
};

export default function Home() {
  return <LandingPage />;
}
