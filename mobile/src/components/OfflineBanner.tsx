import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Top-anchored offline banner. Pushes screen content down when visible,
 * vanishes entirely when online.
 *
 * isInternetReachable is intentionally NOT checked — that prop pings a public
 * host and returns false on LAN-only / dev / corporate networks even when our
 * API works perfectly. isConnected is the right signal here.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
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
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: '#FEE2E2',
        borderBottomColor: '#FECACA',
        borderBottomWidth: 1,
      }}
    >
      <View className="px-4 py-2.5 flex-row items-center justify-center">
        <Ionicons name="cloud-offline-outline" size={16} color="#B91C1C" />
        <Text className="text-[13px] text-red-700 ml-2 font-semibold">
          You&apos;re offline · Changes saved locally
        </Text>
      </View>
    </View>
  );
}
