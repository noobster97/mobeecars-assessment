import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  getMostLikedBrand,
  getMostLikedModel,
  getMostLikedType,
  getTotals,
  ReportModelRow,
  ReportRow,
} from '@/src/lib/db';

type Stats = {
  brand: ReportRow | null;
  model: ReportModelRow | null;
  type: ReportRow | null;
  likes: number;
  dislikes: number;
};

export default function ReportsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [brand, model, type, totals] = await Promise.all([
      getMostLikedBrand(),
      getMostLikedModel(),
      getMostLikedType(),
      getTotals(),
    ]);
    setStats({ brand, model, type, likes: totals.likes, dislikes: totals.dislikes });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!stats) {
    return <View className="flex-1 bg-gray-50" />;
  }

  const hasLikes = stats.likes > 0;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingTop: 56 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text className="text-3xl font-bold mb-1">Your taste</Text>
      <Text className="text-sm text-gray-500 mb-6">
        Based on {stats.likes + stats.dislikes} swipes — works offline.
      </Text>

      <View className="flex-row gap-3 mb-6">
        <StatPill label="Liked" value={stats.likes} tone="like" />
        <StatPill label="Skipped" value={stats.dislikes} tone="dislike" />
      </View>

      {!hasLikes && (
        <View className="bg-white rounded-2xl p-6 items-center">
          <Text className="text-4xl mb-3">🤷</Text>
          <Text className="text-base text-gray-600 text-center">
            Swipe right on a few cars to see your taste here.
          </Text>
        </View>
      )}

      {hasLikes && (
        <>
          <ReportCard
            label="Most liked brand"
            primary={stats.brand?.key ?? '—'}
            count={stats.brand?.count}
          />
          <ReportCard
            label="Most liked model"
            primary={
              stats.model ? `${stats.model.brand} ${stats.model.model}` : '—'
            }
            count={stats.model?.count}
          />
          <ReportCard
            label="Most liked type"
            primary={stats.type?.key ?? '—'}
            count={stats.type?.count}
          />
        </>
      )}
    </ScrollView>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'like' | 'dislike';
}) {
  const bg = tone === 'like' ? 'bg-accent-like' : 'bg-accent-dislike';
  return (
    <View className={`flex-1 ${bg} rounded-2xl p-4`}>
      <Text className="text-white/80 text-xs font-medium uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-white text-3xl font-bold mt-1">{value}</Text>
    </View>
  );
}

function ReportCard({
  label,
  primary,
  count,
}: {
  label: string;
  primary: string;
  count?: number;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
      <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
        {label}
      </Text>
      <View className="flex-row items-baseline justify-between">
        <Text className="text-2xl font-bold flex-1" numberOfLines={1}>
          {primary}
        </Text>
        {typeof count === 'number' && (
          <Text className="text-sm text-gray-500 ml-3">
            {count} like{count === 1 ? '' : 's'}
          </Text>
        )}
      </View>
    </View>
  );
}
