"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function NavbarAuth() {
  const { agent, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-24" />;
  }

  if (agent) {
    return (
      <>
        <span className="text-sm text-gray-600 dark:text-gray-400">{agent.name}</span>
        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          Log out
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        Log in
      </Link>
      <Link
        href="/auth/signup"
        className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        Sign up
      </Link>
    </>
  );
}
