"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/** Dashboard has been merged into the user profile page. */
export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(`/users/${user.id}`);
    } else {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
    </div>
  );
}
