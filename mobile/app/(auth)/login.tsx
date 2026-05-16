import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/src/components/Wordmark';
import { haptic } from '@/src/lib/haptics';
import { pullLikeHistory, syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('user@mobeecars.test');
  const [password, setPassword] = useState('password');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const validPassword = password.length >= 6;
  const canSubmit = validEmail && validPassword && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    haptic.medium();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      try {
        await syncCars();
        await pullLikeHistory();
      } catch {
        // sync failure isn't fatal — swipe screen will offer manual retry
      }
      haptic.success();
      router.replace('/(tabs)');
    } catch (err: any) {
      haptic.error();
      const message =
        err?.response?.data?.message ?? 'Check your credentials and try again.';
      Alert.alert('Login failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <LinearGradient
          colors={['#FEE2E2', '#FFFFFF']}
          locations={[0, 0.6]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 380,
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <View
            style={{ paddingTop: insets.top + 72, paddingBottom: insets.bottom + 32 }}
            className="px-7 flex-1"
          >
            <View className="items-start mb-10">
              <View className="mb-6">
                <Wordmark size="xl" />
              </View>
              <Text className="text-[32px] font-black text-fg leading-tight tracking-tight">
                Welcome back.
              </Text>
              <Text className="text-base text-fg-muted mt-1.5">
                Find your next ride in seconds.
              </Text>
            </View>

            <Text className="text-[11px] font-bold text-fg-muted uppercase tracking-widest mb-2">
              Email
            </Text>
            <View
              className={`flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-4 border ${
                !validEmail && email.length > 0
                  ? 'border-accent-dislike'
                  : 'border-gray-200'
              }`}
              style={{
                shadowColor: '#0F172A',
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Ionicons name="mail-outline" size={18} color="#94A3B8" />
              <TextInput
                className="flex-1 ml-3 text-base text-fg"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                returnKeyType="next"
              />
            </View>

            <Text className="text-[11px] font-bold text-fg-muted uppercase tracking-widest mb-2">
              Password
            </Text>
            <View
              className={`flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-8 border ${
                !validPassword && password.length > 0
                  ? 'border-accent-dislike'
                  : 'border-gray-200'
              }`}
              style={{
                shadowColor: '#0F172A',
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
              <TextInput
                className="flex-1 ml-3 text-base text-fg"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <Pressable
                onPress={() => {
                  haptic.select();
                  setShowPwd((s) => !s);
                }}
                hitSlop={10}
              >
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => ({
                opacity: canSubmit ? 1 : 0.5,
                transform: [{ scale: pressed && canSubmit ? 0.98 : 1 }],
                shadowColor: '#EF4444',
                shadowOpacity: canSubmit ? 0.35 : 0,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 16,
                elevation: canSubmit ? 6 : 0,
              })}
              className="bg-primary rounded-2xl py-4 items-center"
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-bold text-base mr-2">
                    Sign in
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )}
            </Pressable>

            <View className="mt-auto pt-6 items-center">
              <Text className="text-xs text-fg-subtle">
                Demo · user@mobeecars.test · password
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
