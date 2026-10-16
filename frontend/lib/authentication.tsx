"use client";

/**
 * AETHER guest session.
 *
 * Talks to the Django / DRF authentication API (HotelSys, /api/auth/*):
 *  - the access token (≈15 min) arrives in the JSON body and is kept in
 *    memory + sessionStorage only — never in a durable cookie;
 *  - the refresh token (≈7 days) never touches JavaScript: the backend
 *    sets it as an HttpOnly cookie scoped to /api/auth/;
 *  - every call is made with credentials so that cookie can travel, and a
 *    401 silently refreshes once before the call is retried.
 *
 * Out of the box the API base is always same-origin /api (proxied to the
 * Django process in development via next.config.ts rewrites). Set
 * NEXT_PUBLIC_API_URL to talk straight to another Django origin.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ types */

export type Guest = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  email_verified: boolean;
};

/** Field errors exactly as DRF validates: {password: [..], email: [..]} */
type FieldErrors = Record<string, string[]>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const authUrl = (path: string) => `${API_BASE}/api/auth${path}`;
const meUrl = () => `${API_BASE}/api/me/`;

/* --------------------------------------------------------------- session */

let accessToken: string | null = null;

function storeAccess(token: string | null) {
  accessToken = token;
  try {
    if (token) sessionStorage.setItem("aether-access", token);
    else sessionStorage.removeItem("aether-access");
  } catch {
    /* private mode — memory-only is fine */
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Execute an authenticated request to backend API with automatic Bearer token
 * and silent 1-time refresh on 401.
 */
export async function requestWithAuth(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  if (res.status === 401 && retry) {
    const refreshed = await refreshAccess();
    if (refreshed && accessToken) {
      const retryHeaders = new Headers(options.headers || {});
      if (!retryHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${accessToken}`);
      return fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }
  return res;
}

export class ApiError extends Error {
  status: number;
  errors: FieldErrors;
  constructor(status: number, detail: string, errors: FieldErrors = {}) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/** Flatten DRF's {field: [msg]} or {detail: msg} into one readable sentence. */
export function firstMessage(errors: FieldErrors, fallback: string): string {
  const flat = Object.values(errors)
    .flat()
    .filter(Boolean);
  return flat[0] || fallback;
}

async function post(
  url: string,
  body: unknown,
  opts: { retry?: boolean } = {},
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401 && opts.retry !== false && accessToken) {
    // access token expired — renew once through the HttpOnly cookie, then retry
    if (await refreshAccess()) return post(url, body, { retry: false });
  }
  return res;
}

/** Async so the context can await it before children request the profile. */
async function refreshAccess(): Promise<boolean> {
  try {
    const res = await fetch(authUrl("/refresh/"), {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      storeAccess(null);
      try { localStorage.removeItem("aether-has-session"); } catch {}
      return false;
    }
    const data = (await res.json()) as { access?: string };
    if (!data.access) {
      storeAccess(null);
      try { localStorage.removeItem("aether-has-session"); } catch {}
      return false;
    }
    storeAccess(data.access);
    try { localStorage.setItem("aether-has-session", "1"); } catch {}
    return true;
  } catch {
    storeAccess(null);
    return false;
  }
}

/* --------------------------------------------------------- API operations */

export const auth = {
  /** Returns 202 body (registration is deliberately silent about dupes). */
  async register(input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    const res = await post(authUrl("/register/"), input, { retry: false });
    await throwIfHttpError(res, "Registration failed. Try again.");
    return (await res.json()) as { detail: string };
  },

  async login(email: string, password: string): Promise<Guest> {
    const res = await post(
      authUrl("/login/"),
      { email, password },
      { retry: false },
    );
    await throwIfHttpError(res, "Sign-in failed. Try again.");
    const data = (await res.json()) as { access: string; user: Guest };
    storeAccess(data.access);
    try { localStorage.setItem("aether-has-session", "1"); } catch {}
    return data.user;
  },

  async logout() {
    try {
      await post(authUrl("/logout/"), {}, { retry: false });
    } finally {
      storeAccess(null);
      try { localStorage.removeItem("aether-has-session"); } catch {}
    }
  },

  async me(): Promise<Guest> {
    const res = await fetch(meUrl(), {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: "include",
    });
    if (res.status === 401 && accessToken && (await refreshAccess())) {
      return auth.me();
    }
    await throwIfHttpError(res, "Could not load your profile.");
    return (await res.json()) as Guest;
  },

  /** Server asks the user to confirm their address from an emailed link. */
  async verifyEmail(token: string) {
    const res = await post(
      authUrl("/verify-email/"),
      { token },
      { retry: false },
    );
    await throwIfHttpError(res, "This confirmation link is invalid or has expired.");
    return (await res.json()) as { detail: string };
  },

  async requestPasswordReset(email: string) {
    const res = await post(
      authUrl("/password-reset/"),
      { email },
      { retry: false },
    );
    await throwIfHttpError(res, "Could not send the reset email. Try again.");
    return (await res.json()) as { detail: string };
  },

  async confirmPasswordReset(input: { uid: string; token: string; password: string }) {
    const res = await post(
      authUrl("/password-reset/confirm/"),
      input,
      { retry: false },
    );
    await throwIfHttpError(res, "This reset link is invalid or has expired.");
    return (await res.json()) as { detail: string };
  },

  /** Authenticated: a fresh verification email for the signed-in guest. */
  async resendVerification(): Promise<{ detail: string }> {
    const res = await fetch(authUrl("/resend-verification/"), {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: "include",
    });
    if (res.status === 401 && accessToken && (await refreshAccess())) {
      return auth.resendVerification();
    }
    await throwIfHttpError(res, "Could not send the email. Try again.");
    return (await res.json()) as { detail: string };
  },
};

async function throwIfHttpError(res: Response, fallback: string) {
  if (res.ok) return;
  let errors: FieldErrors = {};
  let message = fallback;
  if (res.status !== 204) {
    try {
      const data = (await res.json()) as FieldErrors & { detail?: string; error?: { message?: string } };
      if (typeof data.detail === "string") message = data.detail;
      else if (data.error && typeof data.error.message === "string") {
        if (res.status === 404 || data.error.message === "The page could not be found") {
          message = "Backend API is unreachable (404). Ensure your Django backend is deployed and NEXT_PUBLIC_API_URL or FRONTEND_API_PROXY is configured.";
        }
      }
      errors = data;
    } catch {
      /* keep the fallback */
    }
  }
  if (res.status === 401 && Object.keys(errors).length === 0)
    message = "Email or password is incorrect.";
  if (res.status === 404 && message === fallback)
    message = "Backend API is unreachable (404). Ensure your Django backend is deployed and NEXT_PUBLIC_API_URL or FRONTEND_API_PROXY is configured.";
  throw new ApiError(res.status, message, errors);
}

/* --------------------------------------------------------------- context */

type SessionState = {
  guest: Guest | null;
  /** Answers definitively once the session has been examined. */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<Guest>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        try {
          accessToken = sessionStorage.getItem("aether-access");
        } catch {
          /* private mode */
        }
        let hasSession = false;
        try {
          hasSession = localStorage.getItem("aether-has-session") === "1";
        } catch {
          /* private mode */
        }
        if (accessToken || (hasSession && (await refreshAccess()))) {
          const guest = await auth.me();
          if (!cancelled) setGuest(guest);
        }
      } catch {
        /* session expired or stale token — stay as guest */
        try { localStorage.removeItem("aether-has-session"); } catch {}
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<Guest> => {
    const user = await auth.login(email, password);
    setGuest(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await auth.logout();
    setGuest(null);
  }, []);

  const value = useMemo<SessionState>(
    () => ({ guest, ready, signIn, signOut }),
    [guest, ready, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
