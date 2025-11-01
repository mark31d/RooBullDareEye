import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  View,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';

/**
 * Props:
 * - rippleColor   (string)   — цвет ripple (по умолчанию 'rgba(255,255,255,0.35)')
 * - duration      (number)   — длительность ripple в мс (600)
 * - borderless    (bool)     — android ripple может выходить за границы (false)
 * - radius        (number?)  — радиус ripple на Android (опц.)
 * - style         (ViewStyle) — стиль кнопки (здесь важно borderRadius и overflow: 'hidden')
 * - contentStyle  (ViewStyle) — стиль внутреннего контейнера с children
 * - onPress / onPressIn / onPressOut ... — как у Pressable
 */
export default function RippleButton({
  rippleColor = 'rgba(255,255,255,0.35)',
  duration = 600,
  borderless = false,
  radius,
  style,
  contentStyle,
  children,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}) {
  // для кастомного ripple (iOS/старый Android)
  const [ripples, setRipples] = useState([]); // { key, x, y, anim, size }
  const sizeRef = useRef({ w: 0, h: 0 });

  const onLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    sizeRef.current = { w: width, h: height };
  }, []);

  const spawnRipple = useCallback((x, y) => {
    const { w, h } = sizeRef.current;
    if (!w || !h) return;

    // радиус до самого дальнего угла
    const dx = Math.max(x, w - x);
    const dy = Math.max(y, h - y);
    const maxDist = Math.sqrt(dx * dx + dy * dy);
    const rippleSize = maxDist * 2;

    const key = Date.now() + Math.random();
    const anim = new Animated.Value(0);

    setRipples((prev) => [...prev, { key, x, y, anim, size: rippleSize }]);

    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // по завершении — удалить
      setRipples((prev) => prev.filter((r) => r.key !== key));
    });
  }, [duration]);

  const handlePressIn = useCallback((e) => {
    onPressIn?.(e);

    // на Android используем системный ripple — кастомный не нужен
    if (Platform.OS === 'android' && Platform.Version >= 21) return;

    const { locationX, locationY } = e.nativeEvent;
    spawnRipple(locationX, locationY);
  }, [onPressIn, spawnRipple]);

  const androidRipple = useMemo(() => {
    if (Platform.OS !== 'android' || Platform.Version < 21) return null;
    return {
      color: rippleColor,
      borderless,
      radius,
    };
  }, [rippleColor, borderless, radius]);

  // ВАЖНО: чтобы ripple был обрезан по радиусу, на контейнере нужен overflow: 'hidden' + borderRadius
  return (
    <Pressable
      {...rest}
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={onPressOut}
      android_ripple={androidRipple || undefined}
      style={[styles.buttonBase, style]}
    >
      {/* Контент */}
      <View style={[styles.content, contentStyle]}>{children}</View>

      {/* Кастомный ripple (iOS/старый Android) */}
      {Platform.OS !== 'android' || Platform.Version < 21 ? (
        ripples.map((r) => {
          const scale = r.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.01, 1],
          });
          const opacity = r.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.35, 0],
          });
          const half = r.size / 2;
          return (
            <Animated.View
              key={r.key}
              pointerEvents="none"
              style={[
                styles.ripple,
                {
                  backgroundColor: rippleColor,
                  width: r.size,
                  height: r.size,
                  left: r.x - half,
                  top: r.y - half,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    position: 'relative',
    overflow: 'hidden', // нужно для обрезки ripple по радиусу
    borderRadius: 16,   // под твой стиль
  },
  content: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 9999,
    zIndex: 1,
  },
});
