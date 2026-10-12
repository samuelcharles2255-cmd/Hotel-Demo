import type { Metadata } from "next";
import AuthForm from "../AuthForm";
import AuthCard from "../AuthCard";

export const metadata: Metadata = {
  title: "Create account — AETHER",
  description:
    "One account for your stays, tables and the Thursday curatorial note.",
};

export default function SignUpPage() {
  return (
    <AuthCard
      step="Personal — 02"
      title="Join the house"
      lead="An address and a password. Your stays, tables and notes gather in one quiet place."
    >
      <AuthForm mode="sign-up" />
    </AuthCard>
  );
}
