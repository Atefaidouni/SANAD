"use client";

import { useEffect, useSyncExternalStore } from "react";
import { store } from "./store";
import type { Session } from "@/lib/types";

let didHydrate = false;

/** Subscribe a component to the store; re-renders on every commit. */
export function useStore() {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return store;
}

/** Convenience: current session, reactive. */
export function useSession(): Session | null {
  const s = useStore();
  return s.getSession();
}

/** Whether the store has finished loading persisted state. */
export function useHydrated(): boolean {
  const s = useStore();
  return s.isHydrated();
}

/** Call once high in the tree to load persisted localStorage state. */
export function useHydrateStore() {
  useEffect(() => {
    if (!didHydrate) {
      didHydrate = true;
      store.hydrate();
    }
  }, []);
}
