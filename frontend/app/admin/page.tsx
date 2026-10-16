import { Suspense } from "react";
import type { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Operations — AETHER Luxury Hotel Mbeya",
  description:
    "Restricted administrative operations, room inventory and booking command dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-charcoal text-ivory">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-copper border-t-transparent rounded-full animate-spin" />
            <p className="eyebrow text-copper-light tracking-[0.3em]">
              Securing Administrative Clearance…
            </p>
          </div>
        </div>
      }
    >
      <AdminDashboardClient />
    </Suspense>
  );
}

