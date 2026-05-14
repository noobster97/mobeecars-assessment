import api from '@/src/lib/api';
import {
  CarRow,
  getUnsyncedLikes,
  markLikesSynced,
  replaceCars,
} from '@/src/lib/db';

/**
 * Pull the full car inventory from the server and replace the local SQLite snapshot.
 * Called on first login and via manual refresh.
 */
export async function syncCars(): Promise<number> {
  const { data } = await api.get<{ cars: CarRow[]; total: number }>('/cars');
  await replaceCars(data.cars);
  return data.total;
}

/**
 * Push any locally recorded swipes that haven't been synced yet.
 * No-op if there's nothing to push or the request fails (silent — will retry next call).
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
  return likes.length;
}
