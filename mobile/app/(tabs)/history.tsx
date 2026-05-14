import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLikeHistory, HistoryRow } from '@/src/lib/db';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setItems(await getLikeHistory());
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

  const liked = items.filter((i) => i.liked === 1).length;
  const skipped = items.length - liked;

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}
        className="pb-3"
      >
        <Text className="text-[28px] font-black text-fg tracking-tight">
          Your activity
        </Text>
        <Text className="text-sm text-fg-muted mt-0.5">
          {items.length} swipes · {liked} liked · {skipped} skipped
        </Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="time-outline" size={36} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-fg mb-1">No swipes yet</Text>
          <Text className="text-fg-muted text-center">
            Head to the Discover tab to start browsing cars.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.car_id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EF4444"
            />
          }
          renderItem={({ item }) => <HistoryRowCard item={item} />}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
        />
      )}
    </View>
  );
}

function HistoryRowCard({ item }: { item: HistoryRow }) {
  const isLiked = item.liked === 1;
  return (
    <View
      className="flex-row items-center bg-white rounded-2xl p-3 border border-gray-100"
      style={{
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      <Image
        source={{ uri: item.image_url }}
        style={{ width: 64, height: 64, borderRadius: 14 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View className="flex-1 ml-3">
        <Text className="text-[11px] font-bold text-primary-600 uppercase tracking-widest">
          {item.type}
        </Text>
        <Text className="text-base font-bold text-fg mt-0.5" numberOfLines={1}>
          {item.brand} {item.model}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons
            name="time-outline"
            size={11}
            color="#94A3B8"
          />
          <Text className="text-[11px] text-fg-subtle ml-1">
            {relativeTime(item.swiped_at)}
          </Text>
          {item.synced === 0 && (
            <>
              <View className="w-1 h-1 bg-fg-subtle rounded-full mx-1.5" />
              <Ionicons name="cloud-upload-outline" size={11} color="#B45309" />
              <Text className="text-[11px] text-amber-700 ml-1 font-medium">
                Pending
              </Text>
            </>
          )}
        </View>
      </View>
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${
          isLiked ? 'bg-emerald-50' : 'bg-red-50'
        }`}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'close'}
          size={isLiked ? 20 : 22}
          color={isLiked ? '#10B981' : '#EF4444'}
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
