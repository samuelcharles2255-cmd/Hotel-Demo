"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, PasswordInput } from "./_forms";
import { ArrowRight } from "@/components/ui";
import { ApiError, firstMessage, useSession } from "@/lib/authentication";

type Mode = "sign-in" | "sign-up";

/**
 * Sign-in / sign-up form against the Django API.
 * Field errors from DRF are rendered inline; transient errors as a line
 * above the button. Success moves to the next room (home or /verify-email).
 */
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn } = useSession();

  const [busy, setBusy] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const signUp = mode === "sign-up";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setTopError(null);
    setFieldErrors({});

    try {
      if (signUp) {
        await fetchSessions(authInput());
        router.push("/verify-email/pending");
      } else {
        await signIn(email.trim().toLowerCase(), password);
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setTopError(firstMessage(err.errors, err.message));
        setFieldErrors(err.errors);
      } else {
        setTopError(
          "The house is unreachable for a moment — try again.",
        );
      }
      setBusy(false);
    }

    function authInput() {
      return {
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      };
    }

    async function fetchSessions(input: ReturnType<typeof authInput>) {
      const { auth } = await import("@/lib/authentication");
      await auth.register(input);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-9" noValidate>
      {signUp && (
        <div className="grid grid-cols-2 gap-5">
          <Field label="First name">
            <input
              className="field"
              autoComplete="given-name"
              value={firstName}
              required
              maxLength={150}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Last name">
            <input
              className="field"
              autoComplete="family-name"
              value={lastName}
              required
              maxLength={150}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
        </div>
      )}

      <Field label="Email">
        <input
          className="field"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      {fieldErrors.email && <FieldError errors={fieldErrors.email} />}

      <Field label="Password">
        <PasswordInput
          autoComplete={signUp ? "new-password" : "current-password"}
          value={password}
          required
          maxLength={128}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {fieldErrors.password && <FieldError errors={fieldErrors.password} />}

      {signUp && (
        <>
          <Field label="Phone (optional)">
            <input
              className="field"
              type="tel"
              autoComplete="tel"
              value={phone}
              maxLength={32}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          {fieldErrors.phone && <FieldError errors={fieldErrors.phone} />}
        </>
      )}

      <div className="mt-3 min-h-[1.4rem]">
        {topError && (
          <p
            role="alert"
            className="text-[0.85rem] font-light leading-relaxed text-red-400"
          >
            {topError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="btn btn-copper btn-sheen mt-4 w-full disabled:opacity-60"
      >
        {busy
          ? signUp
            ? "Opening your room…"
            : "Unlocking…"
          : signUp
            ? "Create account"
            : "Enter"}
        {!busy && <ArrowRight />}
      </button>

      <p className="mt-6 text-center text-[0.83rem] font-light text-ivory/45">
        {signUp ? "Already staying with us? " : "First time here? "}
        <Link
          href={
            signUp ? "/authentication/sign-in" : "/authentication/sign-up"
          }
          className="link-line text-copper-light"
        >
          {signUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

function FieldError({ errors }: { errors: string[] }) {
  return (
    <p className="mt-1.5 text-[0.78rem] font-light text-red-400/90">
      {errors.join(" ")}
    </p>
  );
}
