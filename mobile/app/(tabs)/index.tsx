import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/src/components/Wordmark';
import {
  CarRow,
  getUnseenCars,
  getUnsyncedCount,
  recordSwipe,
  undoLastSwipe,
} from '@/src/lib/db';
import { haptic } from '@/src/lib/haptics';
import { flushLikes, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

const { height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(SCREEN_H * 0.62, 580);

export default function SwipeScreen() {
  const insets = useSafeAreaInsets();
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exhausted, setExhausted] = useState(false);
  const [unsynced, setUnsynced] = useState(0);
  const swiperRef = useRef<Swiper<CarRow> | null>(null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const refreshUnsynced = useCallback(async () => {
    setUnsynced(await getUnsyncedCount());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setExhausted(false);
    const unseen = await getUnseenCars();
    setCars(unseen);
    await refreshUnsynced();
    setLoading(false);
  }, [refreshUnsynced]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSwipe(cardIndex: number, liked: boolean) {
    const car = cars[cardIndex];
    if (!car) return;
    haptic.medium();
    await recordSwipe(car.id, liked, new Date().toISOString());
    await refreshUnsynced();
    flushLikes()
      .then(refreshUnsynced)
      .catch(() => undefined);
  }

  async function onPressLike() {
    haptic.light();
    swiperRef.current?.swipeRight();
  }

  async function onPressSkip() {
    haptic.light();
    swiperRef.current?.swipeLeft();
  }

  async function onUndo() {
    haptic.select();
    const carId = await undoLastSwipe();
    if (!carId) return;
    swiperRef.current?.swipeBack(() => undefined);
    await refreshUnsynced();
  }

  async function onResync() {
    haptic.light();
    try {
      const total = await syncCars();
      haptic.success();
      Alert.alert('Synced', `Refreshed ${total} cars from the server.`);
      await load();
    } catch {
      haptic.warning();
      Alert.alert('Offline', 'Could not reach the server. Try again later.');
    }
  }

  if (loading) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 items-center justify-center bg-white"
      >
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (exhausted || cars.length === 0) {
    return (
      <View
        style={{ paddingTop: insets.top + 24 }}
        className="flex-1 items-center justify-center bg-white px-6"
      >
        <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-5">
          <Ionicons name="sparkles" size={36} color="#EF4444" />
        </View>
        <Text className="text-2xl font-black text-fg mb-2">All caught up</Text>
        <Text className="text-fg-muted text-center mb-8 leading-relaxed">
          You&apos;ve swiped every car in the inventory. Pull fresh listings or
          take a break.
        </Text>
        <Pressable
          onPress={onResync}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
            shadowColor: '#EF4444',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 12,
            elevation: 4,
          })}
          className="bg-primary rounded-2xl px-6 py-3.5 flex-row items-center"
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text className="text-white font-bold ml-2">Sync inventory</Text>
        </Pressable>
        <Pressable onPress={logout} className="mt-6" hitSlop={10}>
          <Text className="text-fg-subtle text-sm">Sign out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-subtle">
      <View
        style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}
        className="pb-3 flex-row items-center justify-between"
      >
        <View>
          <Wordmark size="md" showFull />
          <Text className="text-[11px] text-fg-subtle mt-0.5">
            Hi, {user?.name ?? 'there'}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {unsynced > 0 && (
            <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Ionicons name="cloud-upload-outline" size={12} color="#B45309" />
              <Text className="text-[11px] font-bold text-amber-700 ml-1">
                {unsynced}
              </Text>
            </View>
          )}
          <Pressable onPress={onResync} hitSlop={8}>
            <View className="w-9 h-9 bg-white rounded-xl items-center justify-center border border-gray-200">
              <Ionicons name="refresh-outline" size={18} color="#475569" />
            </View>
          </Pressable>
          <Pressable onPress={logout} hitSlop={8}>
            <View className="w-9 h-9 bg-white rounded-xl items-center justify-center border border-gray-200">
              <Ionicons name="log-out-outline" size={18} color="#475569" />
            </View>
          </Pressable>
        </View>
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
          cardHorizontalMargin={18}
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: overlayLabel('#EF4444'),
                wrapper: overlayWrapper('flex-end', -30),
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: overlayLabel('#10B981'),
                wrapper: overlayWrapper('flex-start', 30),
              },
            },
          }}
        />
      </View>

      <View
        style={{ paddingBottom: 12 }}
        className="flex-row justify-center items-center gap-6 py-4 px-6"
      >
        <ActionButton variant="skip" onPress={onPressSkip} />
        <ActionButton variant="undo" onPress={onUndo} />
        <ActionButton variant="like" onPress={onPressLike} />
      </View>
    </View>
  );
}

function ActionButton({
  variant,
  onPress,
}: {
  variant: 'skip' | 'undo' | 'like';
  onPress: () => void;
}) {
  const config = {
    skip: {
      size: 64,
      bg: '#FFFFFF',
      iconColor: '#EF4444',
      iconName: 'close' as const,
      iconSize: 32,
      shadowColor: '#EF4444',
    },
    undo: {
      size: 48,
      bg: '#FFFFFF',
      iconColor: '#475569',
      iconName: 'arrow-undo' as const,
      iconSize: 20,
      shadowColor: '#0F172A',
    },
    like: {
      size: 64,
      bg: '#FFFFFF',
      iconColor: '#10B981',
      iconName: 'heart' as const,
      iconSize: 28,
      shadowColor: '#10B981',
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: config.size,
        height: config.size,
        backgroundColor: config.bg,
        borderRadius: config.size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.92 : 1 }],
        shadowColor: config.shadowColor,
        shadowOpacity: variant === 'undo' ? 0.08 : 0.22,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 14,
        elevation: 5,
        borderWidth: 0.5,
        borderColor: '#E2E8F0',
      })}
    >
      <Ionicons name={config.iconName} size={config.iconSize} color={config.iconColor} />
    </Pressable>
  );
}

function CarCard({ car }: { car: CarRow }) {
  return (
    <View
      style={{
        height: CARD_HEIGHT,
        borderRadius: 28,
        backgroundColor: 'white',
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
        elevation: 10,
      }}
    >
      <View style={{ height: '70%', position: 'relative' }}>
        <Image
          source={{ uri: car.image_url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.55)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '45%',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: 'rgba(255,255,255,0.95)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#EF4444',
              marginRight: 6,
            }}
          />
          <Text className="text-[11px] font-bold text-fg uppercase tracking-widest">
            {car.type}
          </Text>
        </View>
      </View>
      <View className="flex-1 px-6 py-5 justify-center">
        <Text className="text-3xl font-black text-fg mb-1 tracking-tight">
          {car.brand}
        </Text>
        <Text className="text-lg text-fg-muted">{car.model}</Text>
      </View>
    </View>
  );
}

function overlayLabel(bg: string) {
  return {
    backgroundColor: bg,
    color: 'white',
    fontSize: 30,
    fontWeight: '900' as const,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    overflow: 'hidden' as const,
    letterSpacing: 2,
  };
}

function overlayWrapper(align: 'flex-start' | 'flex-end', marginLeft: number) {
  return {
    flexDirection: 'column' as const,
    alignItems: align,
    justifyContent: 'flex-start' as const,
    marginTop: 40,
    marginLeft,
  };
}
