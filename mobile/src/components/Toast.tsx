import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  show: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const BG: Record<ToastVariant, string> = {
  success: '#0F172A',
  error: '#0F172A',
  info: '#0F172A',
};

const ICON_COLOR: Record<ToastVariant, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: '#FACC15',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastInput | null>(null);
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(120, { duration: 220, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setCurrent)(null);
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (toast: ToastInput) => {
      if (timer.current) clearTimeout(timer.current);
      setCurrent(toast);
      translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 220 });
      timer.current = setTimeout(() => dismiss(), toast.duration ?? 2400);
    },
    [dismiss, opacity, translateY],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {current ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: insets.bottom + 80,
              zIndex: 9999,
            },
            style,
          ]}
        >
          <View
            style={{
              backgroundColor: BG[current.variant ?? 'info'],
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#0F172A',
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 12 },
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Ionicons
              name={ICONS[current.variant ?? 'info']}
              size={22}
              color={ICON_COLOR[current.variant ?? 'info']}
            />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 10,
                flex: 1,
              }}
              numberOfLines={2}
            >
              {current.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // graceful fallback — shouldn't fire in practice since provider mounts at root
    return { show: () => undefined } as ToastContextValue;
  }
  return ctx;
}
