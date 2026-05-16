import api from '@/src/lib/api';
import {
  CarRow,
  getUnsyncedLikes,
  markLikesSynced,
  replaceCars,
  setLastSyncAt,
} from '@/src/lib/db';

/**
 * Pull the full car inventory and replace the local SQLite snapshot.
 * Records last-sync timestamp on success.
 */
export async function syncCars(): Promise<number> {
  const { data } = await api.get<{ cars: CarRow[]; total: number }>('/cars');
  await replaceCars(data.cars);
  await setLastSyncAt(new Date().toISOString());
  return data.total;
}

/**
 * Push any locally recorded swipes that haven't been synced yet.
 * Silent no-op on failure (retried by next trigger: swipe, foreground, network reconnect).
 */
export async function flushLikes(): Promise<number> {
  const likes = await getUnsyncedLikes();
  if (likes.length === 0) return 0;

  const payload = {
    likes: likes.map((l) => ({
      car_id: l.car_id,
      liked: l.liked === 1,
      swiped_at: l.swiped_at,
    })),
  };

  await api.post('/likes/sync', payload);
  await markLikesSynced(likes.map((l) => l.car_id));
  await setLastSyncAt(new Date().toISOString());
  return likes.length;
}

/**
 * Maps a raw axios/network error to a human-readable cause so the user can
 * actually diagnose. The generic "you're offline" message hides real causes
 * like the server bound to 127.0.0.1 only, or a wrong EXPO_PUBLIC_API_URL.
 */
export function describeSyncError(err: any): string {
  if (err?.code === 'ECONNABORTED') {
    return 'Sync timed out — server is slow or unreachable.';
  }
  if (err?.message === 'Network Error' || !err?.response) {
    return "Server unreachable. Check it's started with --host=0.0.0.0 and your phone is on the same Wi-Fi.";
  }
  const status = err?.response?.status;
  if (status === 401) return 'Session expired. Sign out and back in.';
  if (status === 404) return 'API endpoint not found — check EXPO_PUBLIC_API_URL.';
  if (status >= 500) return 'Server error. Check Laravel logs.';
  return err?.response?.data?.message ?? 'Sync failed.';
}
