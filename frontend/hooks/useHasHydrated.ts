import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * True once the persisted auth store has been rehydrated from localStorage.
 * Without this, route guards see `isAuthenticated: false` on first render
 * and wrongly redirect logged-in users to /login on every page load.
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
