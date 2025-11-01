import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Image, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG   = require('../assets/bg.webp');
// если появится отдельный бык — замени на bull.webp
const BULL = require('../assets/avatar.webp');

const GOLD       = '#D4AF37';
const GRAPE      = '#5A189A';
const GRAPE_DARK = '#3C096C';
const PASTEL     = '#E9D5FF';
const TEXT       = '#FFFFFF';

export default function GameRulesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const headerTopPadding = insets.top + 14; // отступ для контента header, синий фон заливает весь верх
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} />

      {/* header */}
      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game rules</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.card}>
          <Text style={styles.rules}>
            Players take turns receiving tasks from Bull.{'\n'}
            If you complete them, you get points.{'\n'}
            You can play with 2 to 10 people and set the number of moves.{'\n'}
            At the end, Bull will show who was the most active and will give a surprise moment.
          </Text>

          <Image source={BULL} resizeMode="contain" style={styles.bull} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: GRAPE_DARK, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: TEXT, fontSize: 22, marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 22, fontWeight: '800' ,  },

  card: {
    backgroundColor: GRAPE_DARK, borderRadius: 26, padding: 18,
    overflow: 'hidden', top:90,
  },
  rules: {
    color: GOLD, fontSize: 16, lineHeight: 24, marginBottom: 12, top:10,
  },
  bull: { width: '100%', height: 390, marginBottom:-50, marginTop:-30, },
});
