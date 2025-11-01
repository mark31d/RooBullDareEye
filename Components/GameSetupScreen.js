// Components/GameSetupScreen.js
import React, { useMemo, useState } from 'react';
import {
  View, StyleSheet, ImageBackground, Text, TextInput,
  TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = require('../assets/bg.webp');
const GOLD       = '#D4AF37';
const GRAPE      = '#5A189A';
const GRAPE_DARK = '#3C096C';
const PASTEL     = '#E9D5FF';
const TEXT       = '#FFFFFF';

export default function GameSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const headerTopPadding = insets.top + 14;

  // Шаги: 1 — игроки, 2 — раунды
  const [step, setStep] = useState(1);

  const [players, setPlayers] = useState(['', '', '', '', '']);
  const [rounds, setRounds]   = useState(1);

  const anyNameFilled = useMemo(
    () => players.some(p => p.trim().length > 0),
    [players]
  );

  const setName = (i, v) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[i] = v;
      return copy;
    });
  };

  const addSlot = () => setPlayers(p => (p.length < 10 ? [...p, ''] : p));
  const remSlot = (i) => setPlayers(p => p.filter((_, idx) => idx !== i));

  const goNextStepFromPlayers = () => {
    const filtered = players.map(p => p.trim()).filter(Boolean);
    if (filtered.length === 0) return;
    setStep(2);
  };

  const startGame = () => {
    const filtered = players.map(p => p.trim()).filter(Boolean);
    if (filtered.length === 0) return;
    navigation.navigate('GameCountdown', { players: filtered, rounds });
  };

  const bottomPad = insets.bottom + 16;

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} resizeMode="cover" style={StyleSheet.absoluteFill} />

      {/* header */}
      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <TouchableOpacity onPress={() => (step === 1 ? navigation.goBack() : setStep(1))} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Start Game' : 'Number of Rounds'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {step === 1 ? (
          // ===== ШАГ 1: ИГРОКИ =====
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: (anyNameFilled ? (88 + bottomPad) : 16) }}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>ADD PLAYERS</Text>

              {players.map((p, i) => {
                const trimmed = p.trim();
                const firstEmptyIndex = players.findIndex(x => !x.trim());
                const showPlusHere = trimmed.length === 0 && i === firstEmptyIndex;

                return (
                  <View key={i} style={styles.row}>
                    <TextInput
                      value={p}
                      onChangeText={(v) => setName(i, v)}
                      placeholder={`P${i + 1}`}
                      placeholderTextColor="#8b93a1"
                      style={styles.input}
                      returnKeyType="next"
                    />

                    {trimmed ? (
                      <TouchableOpacity onPress={() => remSlot(i)} style={styles.plus}>
                        <Text style={styles.plusTxt}>−</Text>
                      </TouchableOpacity>
                    ) : showPlusHere ? (
                      <TouchableOpacity onPress={addSlot} style={styles.plus}>
                        <Text style={styles.plusTxt}>+</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.plus, { backgroundColor: 'transparent' }]} />
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          // ===== ШАГ 2: РАУНДЫ (увеличенный контейнер) =====
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 88 + bottomPad }}>
            <View style={[styles.card, styles.cardLarge]}>
              <Text style={[styles.sectionTitle, styles.sectionTitleCenter]}>
                NUMBER OF ROUNDS
              </Text>

              <View style={styles.roundsRowLarge}>
                <TouchableOpacity
                  onPress={() => setRounds(r => Math.max(1, r - 1))}
                  style={styles.roundBtnLarge}
                >
                  <Text style={styles.plusTxtLarge}>−</Text>
                </TouchableOpacity>

                <View style={styles.roundValueLarge}>
                  <Text style={styles.roundTxtLarge}>{rounds}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setRounds(r => Math.min(100, r + 1))}
                  style={styles.roundBtnLarge}
                >
                  <Text style={styles.plusTxtLarge}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.hintLarge}>max 100</Text>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* липкая нижняя панель */}
      {step === 1 ? (
        anyNameFilled && (
          <View style={[styles.bottomSticky, { paddingBottom: bottomPad }]}>
            <TouchableOpacity onPress={goNextStepFromPlayers} style={styles.primaryBtn}>
              <Text style={styles.primaryTxt}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={[styles.bottomSticky, { paddingBottom: bottomPad }]}>
          <TouchableOpacity onPress={startGame} style={styles.primaryBtn}>
            <Text style={styles.primaryTxt}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  header: {
    backgroundColor: GRAPE_DARK,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: TEXT, fontSize: 22, marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 20, fontWeight: '800' },

  // Карточки
  card: { backgroundColor: GRAPE_DARK, borderRadius: 22, padding: 18, marginBottom: 18 },

  // — Игроки
  sectionTitle: { color: TEXT, fontSize: 14, fontWeight: '800', marginBottom: 12, letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  input: {
    flex: 1, backgroundColor: PASTEL, color: '#2E1065', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
  },
  plus: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: PASTEL,
    alignItems: 'center', justifyContent: 'center',
  },
  plusTxt: { color: '#3C096C', fontSize: 20, fontWeight: '900' },

  // — РАУНДЫ (увеличенные размеры)
  cardLarge: {
    top:200,
    paddingVertical: 68,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitleCenter: { textAlign: 'center', fontSize: 16, marginBottom: 18 },

  roundsRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 2,
  },
  roundBtnLarge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: PASTEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusTxtLarge: { color: '#3C096C', fontSize: 28, fontWeight: '900', marginTop: -2 },

  roundValueLarge: {
    minWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 18,
    backgroundColor: PASTEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundTxtLarge: { color: '#fff', fontSize: 28, fontWeight: '900' },
  hintLarge: { color: '#9fb0c5', marginTop: 14, textAlign: 'center', fontSize: 14 },

  // sticky bottom
  bottomSticky: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: GRAPE_DARK,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  primaryBtn: {
    backgroundColor: PASTEL,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryTxt: { color: GOLD, fontSize: 18, fontWeight: '900' },
});
