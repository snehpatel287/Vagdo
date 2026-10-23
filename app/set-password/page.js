"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { CheckCircleIcon, LeafIcon, SpinnerIcon } from "@/components/icons";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase's invite link lands here as `#access_token=...&refresh_token=...`
  // (a hash fragment) rather than `?code=...` — fragments never reach the
  // server, so /auth/callback can't see them. Pick them up here instead,
  // client-side, and turn them into a real session.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setSessionReady(true);
      return;
    }

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setSessionReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message || "This invite link has expired. Ask an admin to resend it.");
      }
      window.history.replaceState(null, "", window.location.pathname);
      setSessionReady(true);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message || "Could not set your password.");
      setLoading(false);
      return;
    }

    router.replace("/");
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
            Welcome to VAGDO
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set a password for your account to finish signing in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 text-sm sm:text-base bg-white dark:bg-slate-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="focus-ring w-full min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 text-sm sm:text-base bg-white dark:bg-slate-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="focus-ring flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-sm shadow-green-600/20 transition-colors duration-150 disabled:opacity-70"
          >
            {loading || !sessionReady ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <CheckCircleIcon className="w-4 h-4" />
            )}
            {loading ? "Saving..." : !sessionReady ? "Verifying invite..." : "Set password & continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
