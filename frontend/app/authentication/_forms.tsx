"use client";

import { useState } from "react";

/**
 * Styled form atoms shared by the authentication forms —
 * hairline glass inputs in the quiet-luxury language.
 */

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group mt-5 block">
      <span className="eyebrow text-ivory/40 transition-colors duration-500 group-focus-within:text-copper-light">
        {label}
      </span>
      <div className="mt-1.5 border-b border-ivory/20 transition-colors duration-500 group-focus-within:border-copper/70">
        {children}
      </div>
    </label>
  );
}

export function PasswordInput({
  name = "password",
  autoComplete = "current-password",
  value,
  onChange,
  required = false,
  maxLength,
}: {
  name?: string;
  autoComplete?: "current-password" | "new-password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center">
      <input
        type={visible ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className="field"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="eyebrow shrink-0 cursor-pointer py-1 text-ivory/35 transition-colors hover:text-ivory"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
