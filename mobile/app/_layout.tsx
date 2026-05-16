import NetInfo from '@react-native-community/netinfo';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import '../global.css';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ToastProvider } from '@/src/components/Toast';
import { getLastSyncAt, initDb } from '@/src/lib/db';
import { flushLikes, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

const AUTO_SYNC_TTL_MS = 60 * 1000; // skip syncCars if last sync was within 60 seconds

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Pulls fresh inventory if last sync is stale, AND drains queued local swipes.
 * Silent on failure — retried on next trigger (next foreground or network reconnect).
 */
async function autoSync() {
  try {
    const last = await getLastSyncAt();
    const fresh = last && Date.now() - new Date(last).getTime() < AUTO_SYNC_TTL_MS;
    if (!fresh) {
      await syncCars();
    }
  } catch {
    // ignore — silent background sync
  }
  flushLikes().catch(() => undefined);
}

export default function RootLayout() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const segments = useSegments();
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    (async () => {
      await initDb();
      await hydrate();
      await SplashScreen.hideAsync();
    })();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === '(auth)';
    if (!token && !inAuth) {
      router.replace('/(auth)/login');
    } else if (token && inAuth) {
      router.replace('/(tabs)');
    }
  }, [hydrated, token, segments, router]);

  useEffect(() => {
    if (!token) return;

    const appSub = AppState.addEventListener('change', (next) => {
      const prev = appState.current;
      appState.current = next;
      if (prev.match(/inactive|background/) && next === 'active') {
        autoSync();
      }
    });

    const netSub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        autoSync();
      }
    });

    return () => {
      appSub.remove();
      netSub();
    };
  }, [token]);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {token ? <OfflineBanner /> : null}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FFFFFF' },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </ToastProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
