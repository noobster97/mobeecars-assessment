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
import { relativeTime, useNow } from '@/src/lib/time';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const now = useNow();
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
        className="pb-4"
      >
        <Text className="text-[32px] font-black text-fg tracking-tight">
          Your activity
        </Text>
        <Text className="text-base text-fg-muted mt-1">
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
          renderItem={({ item }) => <HistoryRowCard item={item} now={now} />}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
        />
      )}
    </View>
  );
}

function HistoryRowCard({ item, now }: { item: HistoryRow; now: number }) {
  const isLiked = item.liked === 1;
  return (
    <View
      className="flex-row items-center bg-white rounded-2xl p-3.5 border border-gray-100"
      style={{
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      <Image
        source={{ uri: item.image_url }}
        style={{ width: 72, height: 72, borderRadius: 14 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View className="flex-1 ml-3.5">
        <Text className="text-[12px] font-bold text-primary-600 uppercase tracking-widest">
          {item.type}
        </Text>
        <Text className="text-[17px] font-bold text-fg mt-1" numberOfLines={1}>
          {item.brand} {item.model}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="time-outline" size={13} color="#94A3B8" />
          <Text className="text-[13px] text-fg-subtle ml-1">
            {relativeTime(item.swiped_at, now)}
          </Text>
          {item.synced === 0 && (
            <>
              <View className="w-1 h-1 bg-fg-subtle rounded-full mx-2" />
              <Ionicons name="cloud-upload-outline" size={13} color="#B45309" />
              <Text className="text-[13px] text-amber-700 ml-1 font-medium">
                Pending
              </Text>
            </>
          )}
        </View>
      </View>
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${
          isLiked ? 'bg-emerald-50' : 'bg-red-50'
        }`}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'close'}
          size={isLiked ? 22 : 24}
          color={isLiked ? '#10B981' : '#EF4444'}
        />
      </View>
    </View>
  );
}

