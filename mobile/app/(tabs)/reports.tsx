import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getBrandDistribution,
  getLastSyncAt,
  getMostLikedBrand,
  getMostLikedModel,
  getMostLikedType,
  getTotals,
  getTypeDistribution,
  getUnsyncedCount,
  ReportModelRow,
  ReportRow,
} from '@/src/lib/db';

type Stats = {
  brand: ReportRow | null;
  model: ReportModelRow | null;
  type: ReportRow | null;
  brandDistribution: ReportRow[];
  typeDistribution: ReportRow[];
  likes: number;
  dislikes: number;
  lastSyncAt: string | null;
  unsynced: number;
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [
      brand,
      model,
      type,
      brandDistribution,
      typeDistribution,
      totals,
      lastSyncAt,
      unsynced,
    ] = await Promise.all([
      getMostLikedBrand(),
      getMostLikedModel(),
      getMostLikedType(),
      getBrandDistribution(3),
      getTypeDistribution(3),
      getTotals(),
      getLastSyncAt(),
      getUnsyncedCount(),
    ]);
    setStats({
      brand,
      model,
      type,
      brandDistribution,
      typeDistribution,
      likes: totals.likes,
      dislikes: totals.dislikes,
      lastSyncAt,
      unsynced,
    });
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
    return <View className="flex-1 bg-white" />;
  }

  const hasLikes = stats.likes > 0;
  const total = stats.likes + stats.dislikes;
  const likeRate = total > 0 ? Math.round((stats.likes / total) * 100) : 0;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 24,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#EF4444"
        />
      }
    >
      <Text className="text-[28px] font-black text-fg tracking-tight">
        Insights
      </Text>
      <SyncStatusLine
        lastSyncAt={stats.lastSyncAt}
        unsynced={stats.unsynced}
      />

      <View className="flex-row gap-3 mt-5 mb-2">
        <StatCard
          label="Liked"
          value={stats.likes}
          tone="like"
          icon="heart"
        />
        <StatCard
          label="Skipped"
          value={stats.dislikes}
          tone="dislike"
          icon="close"
        />
      </View>

      <View
        className="bg-primary-50 rounded-2xl p-4 mb-6 mt-1 flex-row items-center"
      >
        <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
          <Ionicons name="analytics" size={20} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-primary-700 uppercase tracking-wider">
            Match rate
          </Text>
          <Text className="text-2xl font-black text-fg mt-0.5">
            {likeRate}%
            <Text className="text-sm font-normal text-fg-muted"> of {total} swipes</Text>
          </Text>
        </View>
      </View>

      {!hasLikes && (
        <View className="bg-surface-subtle rounded-2xl p-8 items-center">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="sparkles-outline" size={28} color="#EF4444" />
          </View>
          <Text className="text-lg font-bold text-fg mb-1">
            Swipe to discover
          </Text>
          <Text className="text-sm text-fg-muted text-center">
            Like a few cars to see your taste breakdown here.
          </Text>
        </View>
      )}

      {hasLikes && (
        <>
          <SectionLabel text="Top picks" />
          <TopPickCard
            rank={1}
            iconName="trophy"
            iconColor="#F59E0B"
            label="Brand"
            value={stats.brand?.key ?? '—'}
            count={stats.brand?.count}
          />
          <TopPickCard
            rank={2}
            iconName="ribbon"
            iconColor="#EF4444"
            label="Model"
            value={
              stats.model
                ? `${stats.model.brand} ${stats.model.model}`
                : '—'
            }
            count={stats.model?.count}
          />
          <TopPickCard
            rank={3}
            iconName="medal"
            iconColor="#8B5CF6"
            label="Type"
            value={stats.type?.key ?? '—'}
            count={stats.type?.count}
          />

          {stats.brandDistribution.length > 1 && (
            <>
              <SectionLabel text="Brand distribution" />
              <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                {stats.brandDistribution.map((row, idx) => (
                  <DistributionBar
                    key={row.key}
                    label={row.key}
                    value={row.count}
                    max={stats.brandDistribution[0].count}
                    last={idx === stats.brandDistribution.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {stats.typeDistribution.length > 1 && (
            <>
              <SectionLabel text="Type distribution" />
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                {stats.typeDistribution.map((row, idx) => (
                  <DistributionBar
                    key={row.key}
                    label={row.key}
                    value={row.count}
                    max={stats.typeDistribution[0].count}
                    last={idx === stats.typeDistribution.length - 1}
                  />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="text-[11px] font-bold text-fg-muted uppercase tracking-widest mt-2 mb-2.5">
      {text}
    </Text>
  );
}

function SyncStatusLine({
  lastSyncAt,
  unsynced,
}: {
  lastSyncAt: string | null;
  unsynced: number;
}) {
  return (
    <View className="flex-row items-center mt-0.5">
      <Ionicons
        name={unsynced > 0 ? 'cloud-upload-outline' : 'cloud-done-outline'}
        size={13}
        color={unsynced > 0 ? '#B45309' : '#94A3B8'}
      />
      <Text className="text-xs text-fg-subtle ml-1.5">
        {lastSyncAt ? `Synced ${relativeTime(lastSyncAt)}` : 'Not yet synced'}
        {unsynced > 0 ? ` · ${unsynced} pending` : ''}
      </Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'like' | 'dislike';
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const bg = tone === 'like' ? 'bg-emerald-500' : 'bg-red-500';
  return (
    <View className={`flex-1 ${bg} rounded-2xl p-4`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white/90 text-[11px] font-bold uppercase tracking-widest">
          {label}
        </Text>
        <Ionicons name={icon} size={16} color="rgba(255,255,255,0.85)" />
      </View>
      <Text className="text-white text-4xl font-black">{value}</Text>
    </View>
  );
}

function TopPickCard({
  rank,
  iconName,
  iconColor,
  label,
  value,
  count,
}: {
  rank: number;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  count?: number;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-2.5 flex-row items-center border border-gray-100"
      style={{
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}1A` }}
      >
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-bold text-fg-muted uppercase tracking-widest">
          Most liked {label.toLowerCase()}
        </Text>
        <Text className="text-lg font-bold text-fg mt-0.5" numberOfLines={1}>
          {value}
        </Text>
      </View>
      {typeof count === 'number' && (
        <View className="bg-primary-50 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-bold text-primary-700">
            {count}
          </Text>
        </View>
      )}
    </View>
  );
}

function DistributionBar({
  label,
  value,
  max,
  last,
}: {
  label: string;
  value: number;
  max: number;
  last: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View className={last ? '' : 'mb-3'}>
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-sm font-semibold text-fg">{label}</Text>
        <Text className="text-sm font-bold text-fg-muted">{value}</Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.round(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
