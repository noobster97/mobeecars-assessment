import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/src/components/Toast';
import {
  clearUserData,
  getLastSyncAt,
  getTotals,
  getUnsyncedCount,
} from '@/src/lib/db';
import {
  haptic,
  isHapticsEnabled,
  setHapticsEnabled,
} from '@/src/lib/haptics';
import { describeSyncError, flushLikes, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

const HAPTICS_KEY = 'mobeecars_haptics_enabled';

type Snapshot = {
  liked: number;
  skipped: number;
  unsynced: number;
  lastSyncAt: string | null;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [hapticsOn, setHapticsOnState] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const [totals, unsynced, lastSyncAt] = await Promise.all([
      getTotals(),
      getUnsyncedCount(),
      getLastSyncAt(),
    ]);
    setSnapshot({
      liked: totals.likes,
      skipped: totals.dislikes,
      unsynced,
      lastSyncAt,
    });
  }, []);

  // Restore haptics pref on mount
  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(HAPTICS_KEY);
      const on = stored !== 'false';
      setHapticsEnabled(on);
      setHapticsOnState(on);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onToggleHaptics(value: boolean) {
    setHapticsEnabled(value);
    setHapticsOnState(value);
    await SecureStore.setItemAsync(HAPTICS_KEY, value ? 'true' : 'false');
    if (value) haptic.select();
  }

  async function onSyncNow() {
    if (syncing) return;
    setSyncing(true);
    haptic.light();
    try {
      const [total] = await Promise.all([syncCars(), flushLikes()]);
      haptic.success();
      toast.show({
        variant: 'success',
        message: `Synced ${total} cars. Likes uploaded.`,
      });
      await load();
    } catch (err: any) {
      haptic.warning();
      toast.show({ variant: 'error', message: describeSyncError(err) });
    } finally {
      setSyncing(false);
    }
  }

  function onClearCache() {
    Alert.alert(
      'Clear local data?',
      "This removes your swipe history from this device. Next sync will keep it on the server.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            haptic.warning();
            await clearUserData();
            await load();
            toast.show({ variant: 'info', message: 'Local swipes cleared.' });
          },
        },
      ],
    );
  }

  function onSignOut() {
    Alert.alert(
      'Sign out?',
      `You'll be signed out of ${user?.email ?? 'this account'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            haptic.medium();
            logout();
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 32,
      }}
    >
      <Text className="text-[32px] font-black text-fg tracking-tight">Profile</Text>

      {/* Account card */}
      <View className="bg-primary-50 rounded-2xl p-5 mt-5 flex-row items-center">
        <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mr-4">
          <Text className="text-white text-2xl font-black">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-fg" numberOfLines={1}>
            {user?.name ?? 'Driver'}
          </Text>
          <Text className="text-sm text-fg-muted" numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
        </View>
      </View>

      {/* Mini stats */}
      {snapshot && (
        <View className="flex-row gap-3 mt-5">
          <View className="flex-1 bg-emerald-500 rounded-2xl p-4">
            <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
              Liked
            </Text>
            <Text className="text-white text-3xl font-black mt-1 tabular-nums">
              {snapshot.liked}
            </Text>
          </View>
          <View className="flex-1 bg-red-500 rounded-2xl p-4">
            <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
              Skipped
            </Text>
            <Text className="text-white text-3xl font-black mt-1 tabular-nums">
              {snapshot.skipped}
            </Text>
          </View>
        </View>
      )}

      {/* Sync status line */}
      {snapshot && (
        <View className="flex-row items-center mt-5 px-1">
          <Ionicons
            name={snapshot.unsynced > 0 ? 'cloud-upload-outline' : 'cloud-done-outline'}
            size={15}
            color={snapshot.unsynced > 0 ? '#B45309' : '#94A3B8'}
          />
          <Text className="text-[13px] text-fg-muted ml-2 flex-1">
            {snapshot.lastSyncAt
              ? `Synced ${relativeTime(snapshot.lastSyncAt)}`
              : 'Not yet synced'}
            {snapshot.unsynced > 0 ? ` · ${snapshot.unsynced} pending` : ''}
          </Text>
        </View>
      )}

      {/* Settings section */}
      <SectionLabel text="Settings" />

      <View className="bg-white rounded-2xl border border-gray-100">
        <Row
          icon="phone-portrait-outline"
          label="Haptics"
          sublabel="Vibration feedback on swipes & buttons"
        >
          <Switch
            value={hapticsOn}
            onValueChange={onToggleHaptics}
            trackColor={{ true: '#EF4444', false: '#E2E8F0' }}
            thumbColor="#FFFFFF"
          />
        </Row>

        <Divider />

        <ActionRow
          icon="refresh-outline"
          label="Sync now"
          sublabel="Refresh inventory & upload pending likes"
          onPress={onSyncNow}
          loading={syncing}
        />

        <Divider />

        <ActionRow
          icon="trash-outline"
          label="Clear local cache"
          sublabel="Reset swipe history on this device"
          danger
          onPress={onClearCache}
        />
      </View>

      {/* Sign out */}
      <View className="mt-6">
        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
          className="bg-red-50 border border-red-100 rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#B91C1C" />
          <Text className="text-red-700 font-bold ml-2">Sign out</Text>
        </Pressable>
      </View>

      <Text className="text-center text-[11px] text-fg-subtle mt-6">
        Mobee Cars · v1.0
      </Text>
    </ScrollView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="text-[11px] font-bold text-fg-muted uppercase tracking-widest mt-7 mb-2.5 px-1">
      {text}
    </Text>
  );
}

function Row({
  icon,
  label,
  sublabel,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <View className="w-9 h-9 bg-primary-50 rounded-xl items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#EF4444" />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-fg">{label}</Text>
        {sublabel && (
          <Text className="text-[12px] text-fg-muted mt-0.5">{sublabel}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

function ActionRow({
  icon,
  label,
  sublabel,
  onPress,
  loading,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        opacity: pressed && !loading ? 0.7 : 1,
      })}
    >
      <View className="flex-row items-center px-4 py-3.5">
        <View
          className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
            danger ? 'bg-red-50' : 'bg-primary-50'
          }`}
        >
          <Ionicons
            name={icon}
            size={18}
            color={danger ? '#B91C1C' : '#EF4444'}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`text-[15px] font-semibold ${
              danger ? 'text-red-700' : 'text-fg'
            }`}
          >
            {label}
          </Text>
          {sublabel && (
            <Text className="text-[12px] text-fg-muted mt-0.5">{sublabel}</Text>
          )}
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        )}
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-gray-100 ml-16" />;
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
