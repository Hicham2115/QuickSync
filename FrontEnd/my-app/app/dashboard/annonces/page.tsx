import { Metadata } from "next";
import { Annonces } from "@/components/dashboard/Annonces";

export const metadata: Metadata = { title: "Annonces" };

export default function AnnoncesPage() {
  return <Annonces />;
}
