"use client";

import { useRouter } from "next/navigation";
import { addTree } from "@/lib/trees";
import TreeForm from "@/components/TreeForm";

export default function AddTree() {
  const router = useRouter();

  async function handleSubmit(data) {
    addTree(data);
    router.push("/");
  }

  return (
    <TreeForm
      heading="Add a Tree"
      submitLabel="Save Tree"
      onSubmit={handleSubmit}
    />
  );
}
