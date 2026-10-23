"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { LeafIcon, SpinnerIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message || "Could not sign in with those details.");
      setLoading(false);
      return;
    }

    router.replace(searchParams.get("redirectTo") || "/");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm shadow-slate-200/60 dark:shadow-none p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 text-white mb-3">
            <LeafIcon className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sign in to VAGDO
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Use the account an admin set up for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 text-sm sm:text-base bg-white dark:bg-slate-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 text-sm sm:text-base bg-white dark:bg-slate-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-sm shadow-green-600/20 transition-colors duration-150 disabled:opacity-70"
          >
            {loading && <SpinnerIcon className="w-4 h-4" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
