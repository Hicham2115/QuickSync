import { Metadata } from "next";
import { Documents } from "@/components/dashboard/Documents";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return <Documents />;
}
