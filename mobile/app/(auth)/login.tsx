import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { syncCars } from '@/src/lib/sync';
import { useAuthStore } from '@/src/stores/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('user@mobeecars.test');
  const [password, setPassword] = useState('password');
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const validPassword = password.length >= 6;
  const canSubmit = validEmail && validPassword && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      try {
        await syncCars();
      } catch {
        // sync failure isn't fatal — user can retry from the swipe screen
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Check your credentials and try again.';
      Alert.alert('Login failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-5xl font-bold text-primary mb-2">Mobeecars</Text>
        <Text className="text-base text-gray-500 mb-10">
          Find your next ride.
        </Text>

        <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-1 text-base"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#9ca3af"
        />
        {!validEmail && email.length > 0 && (
          <Text className="text-xs text-red-500 mb-3">Enter a valid email.</Text>
        )}
        {validEmail && <View className="mb-4" />}

        <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-1 text-base"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
        />
        {!validPassword && password.length > 0 && (
          <Text className="text-xs text-red-500 mb-3">
            At least 6 characters.
          </Text>
        )}
        {validPassword && <View className="mb-6" />}

        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            canSubmit ? 'bg-primary' : 'bg-gray-300'
          }`}
          onPress={onSubmit}
          disabled={!canSubmit}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign in</Text>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 mt-6 text-center">
          Demo: user@mobeecars.test / password
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
