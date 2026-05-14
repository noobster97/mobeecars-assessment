import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';

import { CarRow, getUnseenCars, recordSwipe } from '@/src/lib/db';
import { flushLikes, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(SCREEN_H * 0.65, 600);

export default function SwipeScreen() {
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exhausted, setExhausted] = useState(false);
  const swiperRef = useRef<Swiper<CarRow> | null>(null);
  const logout = useAuthStore((s) => s.logout);

  const load = useCallback(async () => {
    setLoading(true);
    setExhausted(false);
    const unseen = await getUnseenCars();
    setCars(unseen);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSwipe(cardIndex: number, liked: boolean) {
    const car = cars[cardIndex];
    if (!car) return;
    await recordSwipe(car.id, liked, new Date().toISOString());
    // Best-effort background push; failure is silent and retried next swipe.
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

  if (exhausted || cars.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-6xl mb-4">🎉</Text>
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
        <TouchableOpacity onPress={logout} className="mt-6">
          <Text className="text-gray-400 text-sm">Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center px-5 pt-14 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Mobeecars</Text>
        <TouchableOpacity onPress={logout}>
          <Text className="text-sm text-gray-500">Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <Swiper
          ref={swiperRef}
          cards={cars}
          renderCard={(car) => <CarCard car={car} />}
          onSwipedLeft={(i) => handleSwipe(i, false)}
          onSwipedRight={(i) => handleSwipe(i, true)}
          onSwipedAll={() => setExhausted(true)}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={14}
          stackScale={6}
          animateCardOpacity
          verticalSwipe={false}
          cardVerticalMargin={8}
          cardHorizontalMargin={16}
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: 28,
                  fontWeight: '800',
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  overflow: 'hidden',
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontSize: 28,
                  fontWeight: '800',
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  overflow: 'hidden',
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      </View>

      <View className="flex-row justify-center items-center gap-12 py-6 px-6">
        <TouchableOpacity
          onPress={() => swiperRef.current?.swipeLeft()}
          className="bg-white w-16 h-16 rounded-full items-center justify-center shadow-md border border-gray-100"
          activeOpacity={0.7}
        >
          <Text style={{ color: '#ef4444', fontSize: 28, fontWeight: '700' }}>
            ✕
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => swiperRef.current?.swipeRight()}
          className="bg-white w-16 h-16 rounded-full items-center justify-center shadow-md border border-gray-100"
          activeOpacity={0.7}
        >
          <Text style={{ color: '#22c55e', fontSize: 30, fontWeight: '700' }}>
            ♥
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CarCard({ car }: { car: CarRow }) {
  return (
    <View
      style={{
        height: CARD_HEIGHT,
        borderRadius: 24,
        backgroundColor: 'white',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <Image
        source={{ uri: car.image_url }}
        style={{ width: '100%', height: '70%' }}
        contentFit="cover"
        transition={200}
      />
      <View className="flex-1 p-6 justify-center">
        <Text className="text-xs text-primary font-bold uppercase tracking-widest mb-2">
          {car.type}
        </Text>
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          {car.brand}
        </Text>
        <Text className="text-lg text-gray-600">{car.model}</Text>
      </View>
    </View>
  );
}
