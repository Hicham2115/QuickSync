import type { Metadata } from "next";
import { Presence } from "@/components/dashboard/Presence";

export const metadata: Metadata = { title: "Présence" };

export default function PresencePage() {
  return <Presence />;
}
