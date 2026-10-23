"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTree } from "@/lib/trees";
import TreeForm from "@/components/TreeForm";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LockIcon } from "@/components/icons";

export default function AddTree() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  async function handleSubmit(data) {
    await addTree(data);
    router.push("/");
  }

  if (loading) return null;

  if (profile && profile.role !== "admin" && !profile.can_add_tree) {
    return (
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-16 text-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto mb-4">
          <LockIcon className="w-6 h-6" />
        </span>
        <p className="text-slate-800 dark:text-slate-200 font-semibold">
          You don&apos;t have permission to add trees
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
          Ask an admin to turn on &quot;Can add tree&quot; for your account.
        </p>
        <Link
          href="/"
          className="focus-ring rounded text-green-700 dark:text-green-400 hover:underline text-sm font-medium"
        >
          ← Back to your trees
        </Link>
      </main>
    );
  }

  return (
    <TreeForm
      heading="Add a Tree"
      submitLabel="Save Tree"
      onSubmit={handleSubmit}
    />
  );
}
