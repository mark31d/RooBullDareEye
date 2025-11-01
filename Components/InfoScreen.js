import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Image, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG   = require('../assets/bg.webp');
// замени при наличии на иконку приложения
const APP  = require('../assets/Logo.webp');

const GOLD       = '#D4AF37';
const GRAPE      = '#5A189A';
const GRAPE_DARK = '#3C096C';
const PASTEL     = '#E9D5FF';
const TEXT       = '#FFFFFF';

export default function InfoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const headerTopPadding = insets.top + 14; // отступ для контента header, синий фон заливает весь верх
  const onShare = () => {
    // сюда позже можно подвесить Share API
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} />

      {/* header */}
      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.card}>
          <Text style={styles.text}>
            A game for friends and companies with fun tasks from Bull’a.{'\n'}
            No competition — just fun, laughter and new stories.
          </Text>

          <Image source={APP} resizeMode="containe" style={styles.appImg} />

          <TouchableOpacity onPress={onShare} style={styles.primaryBtn}>
            <Text style={styles.primaryTxt}>Share</Text>
          </TouchableOpacity>
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
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 22, fontWeight: '800' },

  card: {
    backgroundColor: GRAPE_DARK, borderRadius: 26, padding: 18,
    alignItems: 'center',top:120,
  },
  text: { color: GOLD, fontSize: 16, lineHeight: 24, alignSelf: 'stretch', marginBottom: 16 },
  appImg: { width: 260, height: 240, marginVertical: 12  , borderRadius:60,},

  primaryBtn: { backgroundColor: PASTEL, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 4 },
  primaryTxt: { color: GOLD, fontSize: 16, fontWeight: '800' },
});
