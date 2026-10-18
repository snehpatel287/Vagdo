"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getTree, updateTree } from "@/lib/trees";
import TreeForm from "@/components/TreeForm";

export default function EditTreePage() {
  return (
    <Suspense fallback={null}>
      <EditTree />
    </Suspense>
  );
}

function EditTree() {
  const { id } = useParams();
  const router = useRouter();
  const [tree, setTree] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    setTree(getTree(id));
  }, [id]);

  async function handleSubmit(data) {
    updateTree(id, data);
    router.push("/");
  }

  if (tree === undefined) return null;

  if (tree === null) {
    return (
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-slate-800 dark:text-slate-200 font-semibold">Tree not found</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
          It may have been deleted already.
        </p>
        <Link
          href="/"
          className="focus-ring rounded text-green-700 hover:text-green-800 hover:underline text-sm font-medium"
        >
          ← Back to list
        </Link>
      </main>
    );
  }

  return (
    <TreeForm
      heading="Edit Tree"
      submitLabel="Save Changes"
      initial={tree}
      onSubmit={handleSubmit}
    />
  );
}
