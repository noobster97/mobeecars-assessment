import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CarRow, getUnseenCars, recordSwipe } from '@/src/lib/db';
import { flushLikes, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

/**
 * Phase 3 placeholder — single-card view with like / dislike buttons.
 * Phase 4 replaces this with a react-native-deck-swiper gesture deck.
 */
export default function SwipeScreen() {
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const logout = useAuthStore((s) => s.logout);

  const load = useCallback(async () => {
    setLoading(true);
    setCars(await getUnseenCars());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSwipe(liked: boolean) {
    if (cars.length === 0) return;
    const car = cars[0];
    await recordSwipe(car.id, liked, new Date().toISOString());
    setCars((prev) => prev.slice(1));
    // Best-effort background push; ignored if offline.
    flushLikes().catch(() => undefined);
  }

  async function onResync() {
    try {
      const total = await syncCars();
      Alert.alert('Synced', `Refreshed ${total} cars from the server.`);
      await load();
    } catch {
      Alert.alert('Offline', 'Could not reach the server. Try again later.');
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (cars.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-5xl mb-4">🎉</Text>
        <Text className="text-2xl font-bold mb-2">All caught up</Text>
        <Text className="text-gray-500 text-center mb-8">
          You&apos;ve swiped every car in the inventory.
        </Text>
        <TouchableOpacity
          onPress={onResync}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text className="text-white font-semibold">Sync inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} className="mt-4">
          <Text className="text-gray-400 text-sm">Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const car = cars[0];
  const remaining = cars.length;

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-12 pb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xs text-gray-500 uppercase tracking-wider">
          {remaining} left
        </Text>
        <TouchableOpacity onPress={logout}>
          <Text className="text-xs text-gray-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-white rounded-3xl shadow-lg overflow-hidden">
        <Image
          source={{ uri: car.image_url }}
          style={{ width: '100%', height: '65%' }}
          contentFit="cover"
          transition={150}
        />
        <View className="p-6 flex-1 justify-center">
          <Text className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
            {car.type}
          </Text>
          <Text className="text-3xl font-bold mb-1">{car.brand}</Text>
          <Text className="text-xl text-gray-700">{car.model}</Text>
        </View>
      </View>

      <View className="flex-row justify-center items-center gap-12 mt-6">
        <TouchableOpacity
          onPress={() => onSwipe(false)}
          className="bg-accent-dislike w-20 h-20 rounded-full items-center justify-center shadow-md"
          activeOpacity={0.8}
        >
          <Text className="text-white text-4xl">✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSwipe(true)}
          className="bg-accent-like w-20 h-20 rounded-full items-center justify-center shadow-md"
          activeOpacity={0.8}
        >
          <Text className="text-white text-4xl">♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
