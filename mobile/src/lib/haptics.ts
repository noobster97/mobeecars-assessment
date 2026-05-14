import * as Haptics from 'expo-haptics';

/**
 * Centralised haptic feedback. Each method swallows its own errors —
 * haptics shouldn't ever crash a flow if the device doesn't support them.
 */
export const haptic = {
  light: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  medium: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined),
  heavy: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined),
  select: () => Haptics.selectionAsync().catch(() => undefined),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    ),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined,
    ),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => undefined,
    ),
};
