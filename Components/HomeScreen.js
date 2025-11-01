// Components/HomeScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import RippleButton from './RippleButton';
import SplitText from './SplitTextRN';

const BG   = require('../assets/bg.webp');
const LOGO = require('../assets/Logo.webp'); // <-- квадратный логотип

// === ФИОЛЕТОВО-ЗОЛОТАЯ ПАЛИТРА (как на лого) ===
const PURPLE      = '#F4C21E';   // основной фиолетовый
const PURPLE_DARK = '#2E1065';   // тени/акценты
const GOLD        = '#F4C21E';   // насыщённый жёлтый под логотип
const GOLD_BORDER = '#D19A00';   // тёмная золотая окантовка
const TEXT        = '#150A3D';   // очень тёмный фиолетовый для контраста на золоте

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(50, insets.top);

  // плавное появление
  const o = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    StatusBar.setHidden(false, 'fade');
    Animated.parallel([
      Animated.timing(o, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [o, y]);

  // одинаковая ширина кнопок
  const BUTTON_W = Math.min(width - 48, 560);
  const LOGO_W   = Math.min(width - 48, 560);

  // безопасная навигация (если экрана нет — не падаем)
  const go = (name) => {
    const names = navigation.getState?.().routeNames ?? [];
    if (names.includes(name)) navigation.navigate(name);
    else console.warn('Screen not found:', name);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ImageBackground source={BG} resizeMode="cover" style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          styles.centerAll,
          { opacity: o, transform: [{ translateY: y }], paddingTop: topPadding },
        ]}
      >
        {/* ЛОГО по центру, без прозрачностей */}
        <View style={[styles.logoBox, { width: LOGO_W, height: LOGO_W }]}>
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
        </View>

        {/* КНОПКИ: большие и одинаковые */}
        <View style={styles.buttons}>
          {[
            ['GameSetup', 'START GAME'],
            ['GameRules', 'GAME RULES'],
            ['Statistics','STATISTICS'],
            ['Info',       'INFO'],
          ].map(([screen, label]) => (
            <RippleButton
              key={label}
              onPress={() => go(screen)}
              rippleColor="rgba(79,44,203,0.35)" // фиолетовый риппл
              duration={600}
              style={[styles.btn, { width: BUTTON_W }]}
            >
              <SplitText
                text={label}
                splitType="chars"
                delay={10}
                duration={0.26}
                from={{ opacity: 0, y: 8 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
                style={styles.btnText}
              />
            </RippleButton>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // всё строго по центру
  centerAll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 22,
  },

  // логотип: сплошной фиолетовый фон + тёмно-золотая окантовка
  logoBox: {
    backgroundColor: PURPLE,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,

    shadowColor: PURPLE_DARK,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoImg: { width: '86%', height: '86%', borderRadius: 15 },

  // кнопки
  buttons: { alignItems: 'center', gap: 16 },
  btn: {
    height: 82,                 // большой фиксированный размер
    backgroundColor: GOLD,      // жёлтый под логотип
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PURPLE_DARK,   // тень в тёмном фиолетовом
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  btnText: {
    color: TEXT,                 // очень тёмный фиолетовый текст на золоте
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
