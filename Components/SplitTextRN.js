// Components/SplitTextRN.js
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Text, View, StyleSheet } from 'react-native';

/**
 * Props (похожие на веб-версию):
 * text: string
 * className: (игнорируется, но оставлен для совместимости)
 * delay: задержка между буквами, мс (по умолчанию 100)
 * duration: длительность анимации одной буквы, сек (по умолчанию 0.6)
 * ease: строка (игнорируется), используем cubic для RN
 * splitType: 'chars' | 'words' | 'lines' (реализованы chars|words)
 * from/to: начальные/конечные стили { opacity?: number, y?: number, scale?: number }
 * textAlign: 'left'|'center'|'right'
 * onLetterAnimationComplete: () => void
 */
export default function SplitTextRN({
  text,
  delay = 100,
  duration = 0.6,
  splitType = 'chars',
  from = { opacity: 0, y: 40, scale: 1 },
  to = { opacity: 1, y: 0,   scale: 1 },
  textAlign = 'left',
  onLetterAnimationComplete,
  tag = 'p', // для совместимости
  style,     // RN-стиль текста
}) {
  const items = useMemo(() => {
    if (splitType === 'words') {
      // сохраняем пробелы как отдельные элементы, чтобы не слепались
      const parts = text.split(/(\s+)/);
      return parts.length ? parts : [text];
    }
    // по умолчанию — посимвольно
    return Array.from(text);
  }, [text, splitType]);

  const opacities = useRef(items.map(() => new Animated.Value(from.opacity ?? 0))).current;
  const translateYs = useRef(items.map(() => new Animated.Value(from.y ?? 0))).current;
  const scales     = useRef(items.map(() => new Animated.Value(from.scale ?? 1))).current;

  useEffect(() => {
    const anims = items.map((_, i) =>
      Animated.timing(opacities[i], {
        toValue: to.opacity ?? 1,
        duration: duration * 1000,
        delay: i * delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    const animsY = items.map((_, i) =>
      Animated.timing(translateYs[i], {
        toValue: to.y ?? 0,
        duration: duration * 1000,
        delay: i * delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    const animsS = items.map((_, i) =>
      Animated.timing(scales[i], {
        toValue: to.scale ?? 1,
        duration: duration * 1000,
        delay: i * delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      Animated.stagger(0, anims),
      Animated.stagger(0, animsY),
      Animated.stagger(0, animsS),
    ]).start(() => {
      onLetterAnimationComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, duration, from.opacity, from.y, from.scale, to.opacity, to.y, to.scale]);

  return (
    <View style={[styles.lineWrap, { justifyContent: alignToFlex(textAlign) }]}>
      {items.map((ch, i) => (
        <Animated.Text
          key={`${ch}-${i}`}
          style={[
            style,
            styles.inline,
            {
              opacity: opacities[i],
              transform: [{ translateY: translateYs[i] }, { scale: scales[i] }],
            },
          ]}
        >
          {ch}
        </Animated.Text>
      ))}
    </View>
  );
}

function alignToFlex(align) {
  switch (align) {
    case 'center': return 'center';
    case 'right':  return 'flex-end';
    default:       return 'flex-start';
  }
}

const styles = StyleSheet.create({
  lineWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  inline:   { includeFontPadding: false, textAlignVertical: 'center' },
});
