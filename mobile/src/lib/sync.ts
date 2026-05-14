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
