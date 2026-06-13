import type { Metadata } from "next";
import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe",
};

export default function Page() {
  return <ResetPasswordPage />;
}
