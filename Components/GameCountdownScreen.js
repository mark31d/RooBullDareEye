import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ImageBackground, Text, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = require('../assets/bg.webp');

export default function GameCountdownScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(50, insets.top);
  const { players, rounds } = route.params;
  const [num, setNum] = useState(3);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const bounce = () => {
    scale.setValue(0.6); opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, stiffness: 320, damping: 20, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    bounce();
    const t = setInterval(() => {
      setNum((n) => {
        if (n <= 1) {
          clearInterval(t);
          navigation.replace('Game', { players, rounds });
          return 0;
        }
        bounce();
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} />
      <Animated.Text style={[styles.num, { transform: [{ scale }], opacity, paddingTop: topPadding }]}>{num}</Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  num: { color: '#D4AF37', fontSize: 56, fontWeight: '900', letterSpacing: 1.5 },
});
