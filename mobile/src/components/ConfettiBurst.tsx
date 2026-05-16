import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const COLORS = [
  '#EF4444', // brand red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#A855F7', // purple
  '#FB923C', // orange
  '#EC4899', // pink
];
const PARTICLE_COUNT = 18;
const DURATION_MS = 900;

/**
 * Tiny celebration burst when the user likes a car. Lightweight — no extra
 * dependency, uses RN Animated. Pass `trigger` (a counter that increments
 * each time you want it to fire); the component re-mounts on key change.
 */
export function ConfettiBurst({ trigger }: { trigger: number }) {
  if (trigger === 0) return null;
  return <ConfettiInstance key={trigger} />;
}

type Particle = {
  x: Animated.Value;
  y: Animated.Value;
  rot: Animated.Value;
  opacity: Animated.Value;
  color: string;
  angle: number;
  distance: number;
  size: number;
};

function ConfettiInstance() {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rot: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      distance: 110 + Math.random() * 90,
      size: 6 + Math.random() * 5,
    })),
  ).current;

  useEffect(() => {
    Animated.parallel(
      particles.map((p) => {
        const dx = Math.cos(p.angle) * p.distance;
        const dy = Math.sin(p.angle) * p.distance;
        return Animated.parallel([
          Animated.timing(p.x, {
            toValue: dx,
            duration: DURATION_MS,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            // upward shoot then gravity drag
            toValue: dy + 220,
            duration: DURATION_MS,
            useNativeDriver: true,
          }),
          Animated.timing(p.rot, {
            toValue: (Math.random() - 0.5) * 4,
            duration: DURATION_MS,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: DURATION_MS,
            delay: DURATION_MS * 0.35,
            useNativeDriver: true,
          }),
        ]);
      }),
    ).start();
  }, [particles]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '38%',
        left: '50%',
        zIndex: 10,
      }}
    >
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            borderRadius: 2,
            opacity: p.opacity,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              {
                rotate: p.rot.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-360deg', '360deg'],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
