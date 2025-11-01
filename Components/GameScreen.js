// Components/GameScreen.js
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View, StyleSheet, ImageBackground, Text, Image, ScrollView,
  TouchableOpacity, Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG   = require('../assets/bg.webp');
const BULL = require('../assets/avatar.webp');
import { ICON_DOUBLE, generateTurn } from './gameData';

const GOLD       = '#D4AF37';
const GRAPE      = '#5A189A';
const GRAPE_DARK = '#3C096C';
const PASTEL     = '#E9D5FF';
const TEXT       = '#FFFFFF';

export default function GameScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { players, rounds } = route.params;

  const headerTopPadding = insets.top + 10;

  const [round, setRound] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState(Object.fromEntries(players.map(p => [p, 0])));

  const currentTurn = useMemo(() => generateTurn(), [round, currentIdx]);

  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    translateY.setValue(20);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [round, currentIdx, translateY]);

  const player = players[currentIdx];

  const nextTurn = (completed) => {
    if (completed) {
      setScores(s => ({ ...s, [player]: s[player] + (currentTurn.double ? 2 : 1) }));
    }
    if (currentIdx < players.length - 1) {
      setCurrentIdx(i => i + 1);
    } else if (round < rounds) {
      setRound(r => r + 1);
      setCurrentIdx(0);
    } else {
      navigation.replace('GameResults', { scores });
    }
  };

  const BOTTOM_BAR_H = 170 + insets.bottom;

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTask}>
            Task for: <Text style={{ fontWeight: '900' }}>{player}</Text>
          </Text>
          <View style={styles.roundPill}>
            <Text style={styles.roundPillTxt}>Round {round}/{rounds}</Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: BOTTOM_BAR_H + 16 }}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Image source={BULL} style={styles.bull} resizeMode="contain" />

          <View style={styles.card}>
            <Text style={styles.bold}>It turned out:</Text>

            <View style={styles.tasksRow}>
              <View style={{ flex: 1, gap: 8 }}>
                {currentTurn.items.map((text, i) => (
                  <View key={`${text}-${i}`} style={styles.li}>
                    <View style={styles.dot} />
                    <Text style={styles.liTxt}>{text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.taskIconBox}>
                <Image
                  source={currentTurn.double ? ICON_DOUBLE : currentTurn.element.icon}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* BOTTOM STICKY */}
      <View style={[styles.bottomSticky, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => nextTurn(true)}>
          <Text style={styles.primaryTxt}>Task completed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => nextTurn(false)}>
          <Text style={styles.secondaryTxt}>Task not completed</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.ghostBtn}>
          <Text style={styles.ghostTxt}>Exit to menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  header: {
    backgroundColor: GRAPE_DARK,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTask: { color: TEXT, fontSize: 22, fontWeight: '800' },
  roundPill: {
    backgroundColor: PASTEL,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roundPillTxt: { color: TEXT, fontSize: 16, fontWeight: '800' },

  bull: { width: '100%', height: 400, alignSelf: 'center', marginTop: -20, marginBottom: -100 },

  card: { backgroundColor: GRAPE_DARK, borderRadius: 22, padding: 16 },
  bold: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  tasksRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  li: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#ffcf86' },
  liTxt: { color: '#e6edf6', fontSize: 14, lineHeight: 20, flexShrink: 1 },
  taskIconBox: {
    width: 84, height: 84, borderRadius: 14, backgroundColor: PASTEL,
    alignItems: 'center', justifyContent: 'center',
  },

  bottomSticky: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: GRAPE_DARK,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  primaryBtn: { backgroundColor: PASTEL, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  primaryTxt: { color: GOLD, fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    borderColor: 'rgba(212,175,55,0.85)',
    borderWidth: 1.2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryTxt: { color: GOLD, fontSize: 16, fontWeight: '700' },
  ghostBtn: { paddingVertical: 10, alignItems: 'center' },
  ghostTxt: { color: '#c9d6e6', fontSize: 14, textDecorationLine: 'underline' },
});
