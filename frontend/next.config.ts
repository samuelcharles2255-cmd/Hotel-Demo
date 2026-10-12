import type { NextConfig } from "next";

/*
 * API origin.
 *
 * Development: NEXT_PUBLIC_API_URL is unset, so /api/* is proxied to the
 * local Django process — auth then runs same-origin (the HttpOnly refresh
 * cookie needs no CORS at all).
 *
 * Production: set NEXT_PUBLIC_API_URL to the API origin (e.g.
 * https://api.yourhotel.com) and the frontend talks to it directly — the
 * cookie still flows because it is SameSite=Lax and the two hosts share
 * one registrable domain. Remember to add this origin to the Django
 * CORS_ALLOWED_ORIGINS in that setup.
 */
const djangoOrigin = process.env.FRONTEND_API_PROXY ?? "http://127.0.0.1:8000";
const sameOriginApi = !process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  // DRF endpoints are slash-suffixed (/api/auth/login/); keep the slash on
  // proxied API calls instead of Next's canonical 308 to the slash-less URL.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    if (!sameOriginApi) return [];
    // :path* normalizes segments (dropping the trailing slash), so the
    // literal "/" after it restores DRF's slash-suffixed endpoints.
    return [{ source: "/api/:path*", destination: `${djangoOrigin}/api/:path*/` }];
  },
};

export default nextConfig;
