// Components/AnimatedListRN.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

export function AnimatedListItem({ children, duration = 550, stiffness = 350, damping = 24 }) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        stiffness,
        damping,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, duration, stiffness, damping]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      {children}
    </Animated.View>
  );
}

/**
 * Props:
 * - children: ReactNode[]  — элементы списка
 * - delay: number          — задержка между появлением элементов (мс), по умолчанию 1000
 * - maxItems: number       — максимальное число одновременно видимых элементов (опц.)
 * - gap: number            — отступ между элементами (px), по умолчанию 12
 * - containerStyle         — стиль контейнера
 */
export default function AnimatedListRN({
  children,
  delay = 1000,
  maxItems,
  gap = 12,
  containerStyle,
}) {
  const nodes = useMemo(() => React.Children.toArray(children), [children]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (nodes.length === 0) return;
    const t = setTimeout(() => {
      setIndex((prev) => (prev < nodes.length - 1 ? prev + 1 : prev));
    }, delay);
    return () => clearTimeout(t);
  }, [index, delay, nodes.length]);

  const visible = useMemo(() => {
    const arr = nodes.slice(0, index + 1).reverse();
    return maxItems ? arr.slice(0, maxItems) : arr;
  }, [nodes, index, maxItems]);

  return (
    <View style={[styles.col, { gap }, containerStyle]}>
      {visible.map((child, i) => (
        <AnimatedListItem key={(child)?.key ?? `ani-${i}`}>
          {child}
        </AnimatedListItem>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  col: { flexDirection: 'column', alignItems: 'center' },
});
