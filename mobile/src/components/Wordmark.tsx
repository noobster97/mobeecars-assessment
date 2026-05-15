import { Image } from 'expo-image';

const LOGO = require('../../assets/images/logo.png');

// Logo natural aspect ratio is ~3.6:1 (wide wordmark)
const ASPECT = 3.6;

type Size = 'sm' | 'md' | 'lg' | 'xl';

const HEIGHTS: Record<Size, number> = {
  sm: 18,
  md: 26,
  lg: 38,
  xl: 56,
};

/**
 * Real Mobee Cars logo (red ///M mark + dark wordmark).
 * Renders the official PNG asset at the requested height; width scales by aspect.
 */
export function Wordmark({ size = 'md' }: { size?: Size }) {
  const h = HEIGHTS[size];
  const w = h * ASPECT;
  return (
    <Image
      source={LOGO}
      style={{ width: w, height: h }}
      contentFit="contain"
    />
  );
}
