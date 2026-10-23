"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getCategories } from "@/lib/categories";
import { getHealthStatuses } from "@/lib/healthStatuses";
import { getLocationTypes } from "@/lib/locationTypes";

const ReferenceDataContext = createContext(undefined);

// Category, Health Status, and Location Type are admin-managed lists
// (supabase/migration_002_dynamic_lists.sql) rather than hardcoded arrays.
// Loaded once here and shared everywhere via useReferenceData() so every
// dropdown/picker in the app stays in sync without each one re-fetching.
export function ReferenceDataProvider({ children }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [healthStatuses, setHealthStatuses] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [cats, healths, locs] = await Promise.all([
      getCategories().catch(() => []),
      getHealthStatuses().catch(() => []),
      getLocationTypes().catch(() => []),
    ]);
    setCategories(cats);
    setHealthStatuses(healths);
    setLocationTypes(locs);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  return (
    <ReferenceDataContext.Provider
      value={{ categories, healthStatuses, locationTypes, loaded, refresh }}
    >
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceData() {
  const ctx = useContext(ReferenceDataContext);
  if (ctx === undefined) {
    throw new Error("useReferenceData must be used within ReferenceDataProvider");
  }
  return ctx;
}
