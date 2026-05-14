import { Text, View } from 'react-native';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { slashes: number; name: number; gap: number; weight: string }> = {
  sm: { slashes: 16, name: 16, gap: 4, weight: '900' },
  md: { slashes: 20, name: 20, gap: 5, weight: '900' },
  lg: { slashes: 28, name: 28, gap: 7, weight: '900' },
  xl: { slashes: 40, name: 40, gap: 10, weight: '900' },
};

/**
 * "///mobee" lockup — three red slashes + black wordmark.
 * Matches the real Mobee Cars brand identity.
 */
export function Wordmark({
  size = 'md',
  showFull = false,
}: {
  size?: Size;
  showFull?: boolean;
}) {
  const s = SIZES[size];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        style={{
          fontSize: s.slashes,
          fontWeight: s.weight as '900',
          color: '#EF4444',
          fontStyle: 'italic',
          letterSpacing: -1,
        }}
      >
        ///
      </Text>
      <Text
        style={{
          fontSize: s.name,
          fontWeight: s.weight as '900',
          color: '#0F172A',
          marginLeft: s.gap,
          letterSpacing: -0.5,
        }}
      >
        mobee{showFull ? ' cars' : ''}
      </Text>
    </View>
  );
}
