import * as Haptics from 'expo-haptics';

/**
 * Centralised haptic feedback. Each method swallows its own errors —
 * haptics shouldn't ever crash a flow if the device doesn't support them.
 *
 * A global enable flag lets the Profile screen toggle haptics on/off
 * without every call site needing to know.
 */
let enabled = true;

export function setHapticsEnabled(v: boolean): void {
  enabled = v;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

export const haptic = {
  light: () =>
    enabled
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined)
      : undefined,
  medium: () =>
    enabled
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined)
      : undefined,
  heavy: () =>
    enabled
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined)
      : undefined,
  select: () => (enabled ? Haptics.selectionAsync().catch(() => undefined) : undefined),
  success: () =>
    enabled
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined,
        )
      : undefined,
  warning: () =>
    enabled
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
          () => undefined,
        )
      : undefined,
  error: () =>
    enabled
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => undefined,
        )
      : undefined,
};
