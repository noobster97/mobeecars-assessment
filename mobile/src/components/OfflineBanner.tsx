import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

/**
 * Thin banner shown only when the device has no network at all.
 *
 * We deliberately do NOT gate on isInternetReachable — that prop has NetInfo
 * try to hit a public host, which fails on LAN-only / corporate / dev networks
 * even when our API is perfectly reachable. isConnected is the right signal
 * for the offline-first guarantee we make to the user.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((state) => {
      if (mounted) setOnline(state.isConnected ?? true);
    });
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (mounted) setOnline(state.isConnected ?? true);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (online) return null;

  return (
    <View className="bg-red-50 border-b border-red-100 px-4 py-2 flex-row items-center justify-center">
      <Ionicons name="cloud-offline-outline" size={14} color="#B91C1C" />
      <Text className="text-[12px] text-red-700 ml-2 font-semibold">
        Offline · Changes saved locally
      </Text>
    </View>
  );
}
