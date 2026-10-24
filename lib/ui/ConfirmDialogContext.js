"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ConfirmDialogContext = createContext(undefined);

export function ConfirmDialogProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolveRef = useRef(null);

  const confirmAction = useCallback(
    ({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false }) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setRequest({ title, message, confirmLabel, cancelLabel, danger });
      });
    },
    []
  );

  function settle(result) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setRequest(null);
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirmAction, request, settle }}>
      {children}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialogState() {
  const ctx = useContext(ConfirmDialogContext);
  if (ctx === undefined) {
    throw new Error("useConfirmDialogState must be used within ConfirmDialogProvider");
  }
  return ctx;
}

export function useConfirm() {
  return useConfirmDialogState().confirmAction;
}
