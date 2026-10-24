"use client";

import { createContext, useContext, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

const AddTreeModalContext = createContext(undefined);

export function AddTreeModalProvider({ children }) {
  const { user } = useAuth();
  const [openState, setOpenState] = useState(false);

  // Derived rather than synced via effect: the modal lives in the root
  // layout, so it survives the client-side navigation signOut() does, and
  // would otherwise keep showing on top of /login after a logout.
  const open = openState && !!user;

  return (
    <AddTreeModalContext.Provider
      value={{
        open,
        openModal: () => setOpenState(true),
        closeModal: () => setOpenState(false),
      }}
    >
      {children}
    </AddTreeModalContext.Provider>
  );
}

export function useAddTreeModal() {
  const ctx = useContext(AddTreeModalContext);
  if (ctx === undefined) {
    throw new Error("useAddTreeModal must be used within AddTreeModalProvider");
  }
  return ctx;
}

// A tree was added from the modal, possibly while sitting on a page other
// than the dashboard — broadcast it as a plain DOM event rather than wiring
// every page through context, so any page that cares (today: just the
// dashboard) can refresh its own list independently.
export const TREE_ADDED_EVENT = "vagdo:tree-added";

export function notifyTreeAdded() {
  window.dispatchEvent(new Event(TREE_ADDED_EVENT));
}
