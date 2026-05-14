import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

/**
 * Thin banner that shows when the device loses internet.
 * Reinforces the offline-first promise — user always knows data is saved locally.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected && state.isInternetReachable !== false);
    });
    return () => unsubscribe();
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
