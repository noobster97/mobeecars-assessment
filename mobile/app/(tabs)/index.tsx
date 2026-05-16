import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
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
  getAllCars,
  getUnseenCars,
  getUnsyncedCount,
  recordSwipe,
  undoLastSwipe,
} from '@/src/lib/db';
import { haptic } from '@/src/lib/haptics';
import { describeSyncError, flushLikes, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

const { width: SCREEN_W } = Dimensions.get('window');

export default function SwipeScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [cars, setCars] = useState<CarRow[]>([]);
  const [totalCars, setTotalCars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exhausted, setExhausted] = useState(false);
  const [unsynced, setUnsynced] = useState(0);
  const [deckKey, setDeckKey] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [deckArea, setDeckArea] = useState({ height: 0, width: 0 });
  const swiperRef = useRef<Swiper<CarRow> | null>(null);
  const user = useAuthStore((s) => s.user);

  // Cards remaining in the current deck stack = total loaded minus how many
  // have been swiped so far. cars.length alone doesn't decrement because the
  // deck-swiper consumes from the front internally without mutating the array.
  const remaining = Math.max(0, cars.length - swipedCount);

  // Card height = the actual space the swiper container gets, minus a small
  // safety margin so cards never visually touch or overlap the action buttons.
  const cardHeight = Math.max(0, deckArea.height - 24);

  const refreshUnsynced = useCallback(async () => {
    setUnsynced(await getUnsyncedCount());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setExhausted(false);
    setSwipedCount(0);
    const [unseen, all] = await Promise.all([getUnseenCars(), getAllCars()]);
    setCars(unseen);
    setTotalCars(all.length);
    await refreshUnsynced();
    setLoading(false);
  }, [refreshUnsynced]);

  useEffect(() => {
    load();
  }, [load]);

  // Silent background sync on tab focus. Writes fresh inventory into
  // SQLite + drains queued likes, but does NOT reload the visible deck —
  // mid-swipe deck reloads feel like a forced refresh. Fresh data surfaces
  // when the user explicitly hits the refresh icon, finishes the deck,
  // or re-opens the app.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await syncCars();
        } catch {
          // silent — cached data still works
        }
        flushLikes()
          .then(refreshUnsynced)
          .catch(() => undefined);
      })();
    }, [refreshUnsynced]),
  );

  async function handleSwipe(cardIndex: number, liked: boolean) {
    const car = cars[cardIndex];
    if (!car) return;
    haptic.medium();
    await recordSwipe(car.id, liked, new Date().toISOString());
    setSwipedCount((c) => c + 1);
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
    setSwipedCount(0);
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
    } catch (err: any) {
      haptic.warning();
      toast.show({ variant: 'error', message: describeSyncError(err) });
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
        <Text className="mt-6 text-fg-subtle text-sm text-center">
          Settings & sign out are in the Profile tab.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-subtle">
      <View
        style={{ paddingTop: insets.top + 14, paddingHorizontal: 20 }}
        className="pb-4"
      >
        <View className="flex-row items-center justify-between">
          <Wordmark size="lg" />
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
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <Text className="flex-1 text-[18px] font-bold text-fg pr-3" numberOfLines={1}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'driver'}
          </Text>
          <View className="bg-primary-50 px-3 py-1.5 rounded-full">
            <Text className="text-[12px] font-extrabold text-primary-700 uppercase tracking-widest">
              {remaining} left
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{ flex: 1, overflow: 'hidden' }}
        onLayout={(e) => {
          const { height, width } = e.nativeEvent.layout;
          if (height !== deckArea.height || width !== deckArea.width) {
            setDeckArea({ height, width });
          }
        }}
      >
        {deckArea.height > 0 && (
        <Swiper
          key={deckKey}
          ref={swiperRef}
          cards={cars}
          renderCard={(car) => <CarCard car={car} height={cardHeight} />}
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
        )}
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

  // Pressable wraps the entire icon + label group so tapping anywhere fires.
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      {({ pressed }) => (
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
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
            }}
          >
            <Ionicons name={config.iconName} size={config.iconSize} color={config.iconColor} />
          </View>
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
      )}
    </Pressable>
  );
}


function CarCard({ car, height }: { car: CarRow; height: number }) {
  return (
    <View
      style={{
        height,
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

/**
 * Production card-swipe stamp. Bordered outline, transparent fill, matching-
 * colour text with a soft same-colour glow and hard rotation. Reads cleanly
 * over any car photo — tested on dark + light imagery.
 */
function overlayLabel(color: string, align: 'flex-start' | 'flex-end') {
  return {
    color,
    backgroundColor: 'transparent',
    fontSize: 56,
    fontWeight: '900' as const,
    borderRadius: 22,
    borderWidth: 6,
    borderColor: color,
    paddingHorizontal: 34,
    paddingTop: 14,
    paddingBottom: 16,
    overflow: 'hidden' as const,
    letterSpacing: 8,
    textAlign: 'center' as const,
    transform: [{ rotate: align === 'flex-start' ? '-22deg' : '22deg' }],
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  };
}

function overlayWrapper(align: 'flex-start' | 'flex-end') {
  return {
    flexDirection: 'column' as const,
    alignItems: align,
    justifyContent: 'flex-start' as const,
    marginTop: 64,
    marginLeft: align === 'flex-start' ? 40 : 0,
    marginRight: align === 'flex-end' ? 40 : 0,
  };
}

