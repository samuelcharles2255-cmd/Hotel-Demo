import type { Metadata } from "next";
import AuthForm from "../AuthForm";
import AuthCard from "../AuthCard";

export const metadata: Metadata = {
  title: "Sign in — AETHER",
  description: "Return to your stays, tables and the curatorial note.",
};

export default function SignInPage() {
  return (
    <AuthCard
      step="Personal — 01"
      title="Welcome back"
      lead="The door remembers you. Enter the address you stay under."
    >
      <AuthForm mode="sign-in" />
    </AuthCard>
  );
}
