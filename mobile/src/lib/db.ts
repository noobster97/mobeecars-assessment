import * as SQLite from 'expo-sqlite';

export type CarRow = {
  id: number;
  brand: string;
  model: string;
  type: string;
  image_url: string;
  updated_at: string;
};

export type LikeRow = {
  car_id: number;
  liked: 0 | 1;
  swiped_at: string;
  synced: 0 | 1;
};

export type HistoryRow = {
  car_id: number;
  brand: string;
  model: string;
  type: string;
  image_url: string;
  liked: 0 | 1;
  swiped_at: string;
  synced: 0 | 1;
};

export type ReportRow = { key: string; count: number };
export type ReportModelRow = { brand: string; model: string; count: number };

let db: SQLite.SQLiteDatabase | null = null;

export async function initDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('mobeecars.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      type TEXT NOT NULL,
      image_url TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_car_likes (
      car_id INTEGER PRIMARY KEY,
      liked INTEGER NOT NULL,
      swiped_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_likes_synced ON user_car_likes(synced);
    CREATE INDEX IF NOT EXISTS idx_likes_liked ON user_car_likes(liked);
    CREATE INDEX IF NOT EXISTS idx_likes_swiped_at ON user_car_likes(swiped_at);
  `);
  return db;
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  return db ?? (await initDb());
}

/* ---------- cars ---------- */

export async function getAllCars(): Promise<CarRow[]> {
  const d = await getDb();
  return d.getAllAsync<CarRow>('SELECT * FROM cars ORDER BY id');
}

export async function getUnseenCars(): Promise<CarRow[]> {
  const d = await getDb();
  return d.getAllAsync<CarRow>(`
    SELECT cars.* FROM cars
    LEFT JOIN user_car_likes ON cars.id = user_car_likes.car_id
    WHERE user_car_likes.car_id IS NULL
    ORDER BY cars.id
  `);
}

export async function replaceCars(cars: CarRow[]): Promise<void> {
  const d = await getDb();
  await d.withTransactionAsync(async () => {
    await d.execAsync('DELETE FROM cars');
    for (const c of cars) {
      await d.runAsync(
        'INSERT INTO cars (id, brand, model, type, image_url, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [c.id, c.brand, c.model, c.type, c.image_url, c.updated_at],
      );
    }
  });
}

/* ---------- swipes ---------- */

export async function recordSwipe(
  carId: number,
  liked: boolean,
  swipedAt: string,
): Promise<void> {
  const d = await getDb();
  await d.runAsync(
    `INSERT INTO user_car_likes (car_id, liked, swiped_at, synced)
     VALUES (?, ?, ?, 0)
     ON CONFLICT(car_id) DO UPDATE SET
       liked = excluded.liked,
       swiped_at = excluded.swiped_at,
       synced = 0`,
    [carId, liked ? 1 : 0, swipedAt],
  );
}

export async function undoLastSwipe(): Promise<number | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<{ car_id: number }>(
    'SELECT car_id FROM user_car_likes ORDER BY swiped_at DESC LIMIT 1',
  );
  if (!row) return null;
  await d.runAsync('DELETE FROM user_car_likes WHERE car_id = ?', [row.car_id]);
  return row.car_id;
}

export async function getUnsyncedLikes(): Promise<LikeRow[]> {
  const d = await getDb();
  return d.getAllAsync<LikeRow>('SELECT * FROM user_car_likes WHERE synced = 0');
}

export async function getUnsyncedCount(): Promise<number> {
  const d = await getDb();
  const row = await d.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM user_car_likes WHERE synced = 0',
  );
  return row?.count ?? 0;
}

export async function markLikesSynced(carIds: number[]): Promise<void> {
  if (carIds.length === 0) return;
  const d = await getDb();
  const placeholders = carIds.map(() => '?').join(',');
  await d.runAsync(
    `UPDATE user_car_likes SET synced = 1 WHERE car_id IN (${placeholders})`,
    carIds,
  );
}

export async function getLikeHistory(): Promise<HistoryRow[]> {
  const d = await getDb();
  return d.getAllAsync<HistoryRow>(`
    SELECT
      user_car_likes.car_id,
      cars.brand,
      cars.model,
      cars.type,
      cars.image_url,
      user_car_likes.liked,
      user_car_likes.swiped_at,
      user_car_likes.synced
    FROM user_car_likes
    JOIN cars ON cars.id = user_car_likes.car_id
    ORDER BY user_car_likes.swiped_at DESC
  `);
}

/* ---------- reports ---------- */

export async function getMostLikedBrand(): Promise<ReportRow | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<ReportRow>(`
    SELECT cars.brand AS key, COUNT(*) AS count
    FROM user_car_likes
    JOIN cars ON cars.id = user_car_likes.car_id
    WHERE user_car_likes.liked = 1
    GROUP BY cars.brand
    ORDER BY count DESC, MAX(user_car_likes.swiped_at) DESC
    LIMIT 1
  `);
  return row ?? null;
}

export async function getMostLikedModel(): Promise<ReportModelRow | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<ReportModelRow>(`
    SELECT cars.brand AS brand, cars.model AS model, COUNT(*) AS count
    FROM user_car_likes
    JOIN cars ON cars.id = user_car_likes.car_id
    WHERE user_car_likes.liked = 1
    GROUP BY cars.brand, cars.model
    ORDER BY count DESC, MAX(user_car_likes.swiped_at) DESC
    LIMIT 1
  `);
  return row ?? null;
}

export async function getMostLikedType(): Promise<ReportRow | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<ReportRow>(`
    SELECT cars.type AS key, COUNT(*) AS count
    FROM user_car_likes
    JOIN cars ON cars.id = user_car_likes.car_id
    WHERE user_car_likes.liked = 1
    GROUP BY cars.type
    ORDER BY count DESC, MAX(user_car_likes.swiped_at) DESC
    LIMIT 1
  `);
  return row ?? null;
}

export async function getBrandDistribution(limit = 3): Promise<ReportRow[]> {
  const d = await getDb();
  return d.getAllAsync<ReportRow>(
    `
    SELECT cars.brand AS key, COUNT(*) AS count
    FROM user_car_likes
    JOIN cars ON cars.id = user_car_likes.car_id
    WHERE user_car_likes.liked = 1
    GROUP BY cars.brand
    ORDER BY count DESC
    LIMIT ?
  `,
    [limit],
  );
}

export async function getTypeDistribution(limit = 3): Promise<ReportRow[]> {
  const d = await getDb();
  return d.getAllAsync<ReportRow>(
    `
    SELECT cars.type AS key, COUNT(*) AS count
    FROM user_car_likes
    JOIN cars ON cars.id = user_car_likes.car_id
    WHERE user_car_likes.liked = 1
    GROUP BY cars.type
    ORDER BY count DESC
    LIMIT ?
  `,
    [limit],
  );
}

export async function getTotals(): Promise<{ likes: number; dislikes: number }> {
  const d = await getDb();
  const likes =
    (await d.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM user_car_likes WHERE liked = 1',
    ))?.count ?? 0;
  const dislikes =
    (await d.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM user_car_likes WHERE liked = 0',
    ))?.count ?? 0;
  return { likes, dislikes };
}

export async function clearUserData(): Promise<void> {
  const d = await getDb();
  await d.execAsync('DELETE FROM user_car_likes');
}

/**
 * Restore the authoritative swipe history from the backend into local SQLite.
 * Used on login so the device shows the same liked/skipped state regardless
 * of which device the user previously swiped on — and so a tampered local
 * SQLite cannot diverge from server truth.
 *
 * Server rows arrive with synced=1 (already on server) and overwrite any
 * conflicting local rows.
 */
export async function restoreLikesFromServer(
  rows: { car_id: number; liked: boolean; swiped_at: string }[],
): Promise<number> {
  const d = await getDb();
  await d.withTransactionAsync(async () => {
    for (const r of rows) {
      await d.runAsync(
        `INSERT INTO user_car_likes (car_id, liked, swiped_at, synced)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(car_id) DO UPDATE SET
           liked     = excluded.liked,
           swiped_at = excluded.swiped_at,
           synced    = 1`,
        [r.car_id, r.liked ? 1 : 0, r.swiped_at],
      );
    }
  });
  return rows.length;
}

/* ---------- meta (kv) ---------- */

export async function setMeta(key: string, value: string): Promise<void> {
  const d = await getDb();
  await d.runAsync(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export async function getMeta(key: string): Promise<string | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function setLastSyncAt(iso: string): Promise<void> {
  await setMeta('last_sync_at', iso);
}

export async function getLastSyncAt(): Promise<string | null> {
  return getMeta('last_sync_at');
}
