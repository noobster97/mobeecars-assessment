import { create } from 'zustand';

/**
 * App-wide sync event bus. Every successful syncCars() or pullLikeHistory()
 * bumps `version`. Screens that derive UI from local SQLite (Discover) can
 * subscribe to detect "the underlying data changed somewhere else" without
 * needing to know who triggered it — Profile's Sync now button, login,
 * background AppState/NetInfo sync, etc.
 */
type SyncState = {
  version: number;
  bump: () => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
}));
