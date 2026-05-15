import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/src/components/Toast';
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

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(SCREEN_H * 0.62, 580);

export default function SwipeScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exhausted, setExhausted] = useState(false);
  const [unsynced, setUnsynced] = useState(0);
  const [deckKey, setDeckKey] = useState(0);
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
    const carId = await undoLastSwipe();
    if (!carId) {
      toast.show({ variant: 'info', message: 'Nothing to rewind yet.' });
      return;
    }
    haptic.select();
    // Reload the unseen list — the un-swiped car is now back in it.
    const fresh = await getUnseenCars();
    setCars(fresh);
    setExhausted(false);
    setDeckKey((k) => k + 1); // force the deck to remount at index 0
    await refreshUnsynced();
    toast.show({ variant: 'info', message: 'Card brought back.' });
  }

  async function onResync() {
    haptic.light();
    try {
      const total = await syncCars();
      haptic.success();
      toast.show({ variant: 'success', message: `Refreshed ${total} cars from the server.` });
      await load();
    } catch {
      haptic.warning();
      toast.show({ variant: 'error', message: "Couldn't reach the server. You're offline." });
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
        style={{ paddingTop: insets.top + 14, paddingHorizontal: 20 }}
        className="pb-4 flex-row items-center justify-between"
      >
        <View>
          <Wordmark size="lg" />
          <Text className="text-[13px] text-fg-muted mt-1">
            Hi, {user?.name ?? 'there'}
          </Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          {unsynced > 0 && (
            <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Ionicons name="cloud-upload-outline" size={14} color="#B45309" />
              <Text className="text-[13px] font-bold text-amber-700 ml-1.5">
                {unsynced}
              </Text>
            </View>
          )}
          <Pressable onPress={onResync} hitSlop={8}>
            <View className="w-11 h-11 bg-white rounded-2xl items-center justify-center border border-gray-200">
              <Ionicons name="refresh-outline" size={20} color="#475569" />
            </View>
          </Pressable>
          <Pressable onPress={logout} hitSlop={8}>
            <View className="w-11 h-11 bg-white rounded-2xl items-center justify-center border border-gray-200">
              <Ionicons name="log-out-outline" size={20} color="#475569" />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Swiper
          key={deckKey}
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
          overlayOpacityHorizontalThreshold={SCREEN_W * 0.06}
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: overlayLabel('#EF4444', 'flex-end'),
                wrapper: overlayWrapper('flex-end'),
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: overlayLabel('#10B981', 'flex-start'),
                wrapper: overlayWrapper('flex-start'),
              },
            },
          }}
        />
      </View>

      <View
        style={{ paddingBottom: 16 }}
        className="flex-row justify-center items-end gap-8 py-5 px-6"
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
      size: 72,
      bg: '#FFFFFF',
      iconColor: '#EF4444',
      iconName: 'close' as const,
      iconSize: 36,
      shadowColor: '#EF4444',
      label: 'SKIP',
      labelColor: '#EF4444',
    },
    undo: {
      size: 56,
      bg: '#FFFFFF',
      iconColor: '#475569',
      iconName: 'arrow-undo' as const,
      iconSize: 22,
      shadowColor: '#0F172A',
      label: 'REWIND',
      labelColor: '#94A3B8',
    },
    like: {
      size: 72,
      bg: '#FFFFFF',
      iconColor: '#10B981',
      iconName: 'heart' as const,
      iconSize: 32,
      shadowColor: '#10B981',
      label: 'LIKE',
      labelColor: '#10B981',
    },
  }[variant];

  return (
    <View style={{ alignItems: 'center' }}>
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
      <Text
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.2,
          color: config.labelColor,
        }}
      >
        {config.label}
      </Text>
    </View>
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
      <View style={{ height: '68%', position: 'relative' }}>
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
            top: 18,
            left: 18,
            backgroundColor: 'rgba(255,255,255,0.95)',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: '#EF4444',
              marginRight: 7,
            }}
          />
          <Text className="text-[13px] font-bold text-fg uppercase tracking-widest">
            {car.type}
          </Text>
        </View>
      </View>
      <View className="flex-1 px-6 py-5 justify-center">
        <Text className="text-[34px] font-black text-fg mb-1 tracking-tight">
          {car.brand}
        </Text>
        <Text className="text-xl text-fg-muted">{car.model}</Text>
      </View>
    </View>
  );
}

function overlayLabel(bg: string, align: 'flex-start' | 'flex-end') {
  return {
    backgroundColor: bg,
    color: 'white',
    fontSize: 38,
    fontWeight: '900' as const,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 10,
    overflow: 'hidden' as const,
    letterSpacing: 3,
    textAlign: align === 'flex-start' ? ('left' as const) : ('right' as const),
    transform: [{ rotate: align === 'flex-start' ? '-12deg' : '12deg' }],
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  };
}

function overlayWrapper(align: 'flex-start' | 'flex-end') {
  return {
    flexDirection: 'column' as const,
    alignItems: align,
    justifyContent: 'flex-start' as const,
    marginTop: 50,
    marginLeft: align === 'flex-start' ? 28 : 0,
    marginRight: align === 'flex-end' ? 28 : 0,
  };
}
