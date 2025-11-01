// Components/SettingsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG     = require('../assets/bg.webp');

const NAVY      = '#0d2235';
const NAVY_DARK = '#0b1c2c';
const ORANGE    = '#d77a2b';
const TEXT      = '#ffffff';
const MUTED     = '#a9b6c8';

const STORAGE_KEYS = {
  notifications: 'settings:notifications',
  lastRating: 'settings:lastRating',
  lastFeedback: 'settings:lastFeedback',
};

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const headerTopPadding = insets.top + 14;

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [rateOpen, setRateOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [savedRating, setSavedRating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [n, r, f] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.notifications),
          AsyncStorage.getItem(STORAGE_KEYS.lastRating),
          AsyncStorage.getItem(STORAGE_KEYS.lastFeedback),
        ]);
        if (n != null) setNotifEnabled(n === '1');
        if (r != null) setSavedRating(Number(r));
        if (f != null) setFeedback(f);
      } catch {}
    })();
  }, []);

  const toggleNotif = async () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    try { await AsyncStorage.setItem(STORAGE_KEYS.notifications, next ? '1' : '0'); } catch {}
  };

  const openRate = () => {
    setRating(savedRating || 0);
    setRateOpen(true);
  };

  const submitRate = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.lastRating, String(rating));
      await AsyncStorage.setItem(STORAGE_KEYS.lastFeedback, feedback ?? '');
      setSavedRating(rating);
    } catch {}
    setRateOpen(false);
  };

  const clearRate = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.lastRating, STORAGE_KEYS.lastFeedback]);
    } catch {}
    setSavedRating(null);
    setRating(0);
    setFeedback('');
  };

  const Stars = useMemo(
    () =>
      ({ size = 28, interactive = true }) => (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => {
            const filled = (interactive ? rating : savedRating || 0) >= i;
            return (
              <Pressable
                key={i}
                onPress={() => interactive && setRating(i)}
                hitSlop={10}
                disabled={!interactive}
                style={{ opacity: interactive ? 1 : 0.9 }}
              >
                <Text style={[styles.star, { fontSize: size, color: filled ? ORANGE : '#273650' }]}>
                  ★
                </Text>
              </Pressable>
            );
          })}
        </View>
      ),
    [rating, savedRating]
  );

  const BOTTOM_PAD = insets.bottom + 12;

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} resizeMode="cover" style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: 16, paddingBottom: BOTTOM_PAD }}>
        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>NOTIFICATIONS</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Enable notifications</Text>
            <Switch
              value={notifEnabled}
              onValueChange={toggleNotif}
              trackColor={{ false: '#24354a', true: '#2f425b' }}
              thumbColor={notifEnabled ? ORANGE : '#dfe7f5'}
            />
          </View>
          <Text style={styles.hint}>
            You can change system permissions in device settings.
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RATE THE GAME</Text>

          <View style={[styles.rowBetween, { marginTop: 6 }]}>
            <Text style={styles.label}>Your rating</Text>
            {savedRating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Stars size={20} interactive={false} />
                {/* число в таком же пилле, как "Not rated yet" */}
                <View style={styles.notRatedPill}>
                  <Text style={styles.notRatedText}>{savedRating}/5</Text>
                </View>
              </View>
            ) : (
              <View style={styles.notRatedPill}>
                <Text style={styles.notRatedText}>Not rated yet</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 14 }]} onPress={openRate}>
            <Text style={styles.primaryTxt}>{savedRating ? 'Update rating' : 'Rate now'}</Text>
          </TouchableOpacity>

          {savedRating ? (
            <TouchableOpacity style={styles.ghostBtn} onPress={clearRate}>
              <Text style={styles.ghostTxt}>Remove my rating</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Rate modal */}
      <Modal visible={rateOpen} transparent animationType="fade" onRequestClose={() => setRateOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={[styles.cardTitle, { textAlign: 'center', marginBottom: 12 }]}>
              RATE THE GAME
            </Text>

            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Stars size={34} interactive />
              <View style={[styles.notRatedPill, { marginTop: 6 }]}>
                <Text style={styles.notRatedText}>{rating ? `${rating}/5` : 'Tap a star'}</Text>
              </View>
            </View>

            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Write a short feedback (optional)"
              placeholderTextColor="#89a0b9"
              multiline
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { flex: 1 }]}
                onPress={() => setRateOpen(false)}
              >
                <Text style={styles.secondaryTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1, opacity: rating ? 1 : 0.6 }]}
                onPress={submitRate}
                disabled={!rating}
              >
                <Text style={styles.primaryTxt}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 22, marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 20, fontWeight: '800' },

  card: {
    backgroundColor: NAVY,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { color: TEXT, fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  label: { color: TEXT, fontSize: 16, fontWeight: '800' },
  hint: { color: MUTED, marginTop: 10 },

  // универсальный пилл для статуса/числа
  notRatedPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111a29',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#203149',
  },
  notRatedText: { color: MUTED, fontWeight: '700', fontSize: 12, letterSpacing: 0.2 },

  primaryBtn: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryTxt: { color: TEXT, fontSize: 16, fontWeight: '900' },

  secondaryBtn: {
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: 'rgba(215,122,43,0.8)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryTxt: { color: TEXT, fontSize: 16, fontWeight: '800' },

  ghostBtn: { paddingVertical: 10, alignItems: 'center' },
  ghostTxt: { color: '#cfe3ff', textDecorationLine: 'underline', fontWeight: '700' },

  // stars
  star: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 4 },

  // modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    backgroundColor: NAVY_DARK,
    borderRadius: 20,
    padding: 16,
  },
  input: {
    backgroundColor: '#3C096C',
    color: TEXT,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 84,
    textAlignVertical: 'top',
  },
});
