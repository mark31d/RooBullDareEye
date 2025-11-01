// Components/Onboarding.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  FlatList,
  Pressable,
  useWindowDimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SplitText from './SplitTextRN';

/* ===== Анимационные кирпичики ===== */
function ContainerAppear({
  visible = true,
  variant = 'fadeUp',
  duration = 450,
  delay = 0,
  distance = 16,
  spring = { stiffness: 350, damping: 28, mass: 0.9 },
  style,
  children,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(variant === 'scale' ? 0.9 : 1)).current;
  const tx      = useRef(new Animated.Value(
    variant === 'fadeLeft' ? -distance : variant === 'fadeRight' ? distance : 0
  )).current;
  const ty      = useRef(new Animated.Value(
    variant === 'fadeUp' ? distance : variant === 'fadeDown' ? -distance : 0
  )).current;

  useEffect(() => {
    if (visible) {
      const anims = [
        Animated.timing(opacity, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ];
      if (variant === 'scale') {
        anims.push(Animated.spring(scale, { toValue: 1, ...spring, useNativeDriver: true }));
      } else {
        if (tx.__getValue() !== 0) anims.push(Animated.spring(tx, { toValue: 0, ...spring, useNativeDriver: true }));
        if (ty.__getValue() !== 0) anims.push(Animated.spring(ty, { toValue: 0, ...spring, useNativeDriver: true }));
      }
      Animated.parallel(anims).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: Math.min(220, duration), useNativeDriver: true }).start();
    }
  }, [visible, variant, duration, delay, distance, spring, opacity, scale, tx, ty]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}

function Stagger({ children, baseDelay = 60, step = 90, variant = 'fadeUp', duration = 450, distance = 14 }) {
  const arr = React.Children.toArray(children);
  return (
    <>
      {arr.map((node, i) => (
        <ContainerAppear
          key={i}
          variant={variant}
          duration={duration}
          delay={baseDelay + i * step}
          distance={distance}
        >
          {node}
        </ContainerAppear>
      ))}
    </>
  );
}
/* ===== /Анимационные кирпичики ===== */

// ассеты
const BG          = require('../assets/bg.webp');
const CAR         = require('../assets/car.webp');
const BOAT        = require('../assets/boat.webp');
const PRESENT     = require('../assets/presant.webp');
const DOUBLE_TASK = require('../assets/double_task.webp');
const AVATAR      = require('../assets/avatar.webp');

// палитра
const NAVY_MAIN   = '#0D2235';   // тёмно-синий основной
const NAVY_SHADOW = '#081A25';   // контур/тени (почти чёрный, чуть холоднее)
const TEXT        = '#FFFFFF';   // белый

export default function Onboarding({ onFinish = () => {} }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    StatusBar.setHidden(true, 'fade');
    return () => StatusBar.setHidden(false, 'fade');
  }, []);

  // размеры второго экрана
  const SIZE = {
    badge: width * 0.88,
    carW:  width * 0.60,
    carH:  width * 0.42,
    boatW: width * 0.70,
    boatH: width * 0.48,
  };

  const slides = useMemo(() => [
    {
      key: 'hello',
      title: 'Hello from Bull',
      body:
        'Bull invites you to a company of easy challenges. No competition — just jokes, actions and memorable moments.',
      btn: 'Hello, BULL',
      renderTop: () => (
        <ContainerAppear variant="scale" duration={520} delay={40}>
          <View style={{ width, height: height * 0.38, overflow: 'visible', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={AVATAR}
              style={{ width: width * 1.3, height: width * 1.3, top: 150, right: 10 }}
              resizeMode="contain"
            />
          </View>
        </ContainerAppear>
      ),
    },
    {
      key: 'how',
      title: 'How it all works',
      body:
        'Bull randomly shows an object and a task. You decide how to complete it. Each move is a new story for the whole company',
      btn: 'Continue',
      renderTop: () => (
        <ContainerAppear variant="scale" duration={520} delay={40}>
          <View style={{ width, height: height * 0.38, overflow: 'visible', position: 'relative', alignItems: 'center', top:90,justifyContent: 'center' }}>
            <Image
              source={DOUBLE_TASK}
              style={{
                position: 'absolute',
                width: SIZE.badge, height: SIZE.badge,
                left: (width - SIZE.badge) / 2, top: 0,
              }}
              resizeMode="contain"
            />
            <Image
              source={CAR}
              style={{
                position: 'absolute',
                width: SIZE.carW, height: SIZE.carH,
                left: -22, bottom: -30, transform: [{ rotate: '-6deg' }],
              }}
              resizeMode="contain"
            />
            <Image
              source={BOAT}
              style={{
                position: 'absolute',
                width: SIZE.boatW, height: SIZE.boatH,
                right: -10, bottom: -82, transform: [{ rotate: '3deg' }],
              }}
              resizeMode="contain"
            />
          </View>
        </ContainerAppear>
      ),
    },
    {
      key: 'end',
      title: 'End of the game',
      body:
        'When everyone has tried their hand — Bull will count the results. Get the opportunity to choose a wish or the bull will help you!',
      btn: 'Start game!',
      renderTop: () => (
        <ContainerAppear variant="scale" duration={520} delay={40}>
          <View style={{ width, height: height * 0.58, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={PRESENT} style={{ width: width * 0.90, height: width * 0.90 }} resizeMode="contain" />
          </View>
        </ContainerAppear>
      ),
    },
  ], [width, height]);

  const onNext = () => {
    if (index < slides.length - 1) listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    else onFinish();
  };

  return (
    <View style={styles.fullscreen}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(it) => it.key}
        horizontal
        pagingEnabled
        removeClippedSubviews
        windowSize={3}
        maxToRenderPerBatch={3}
        style={styles.flex}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={{ width, height, overflow: 'hidden' }}>
            <View style={{ flex: 1 }}>{item.renderTop()}</View>

            {/* нижняя панель — тёмно-синяя */}
            <ContainerAppear
              variant="fadeUp"
              distance={20}
              duration={480}
              style={[
                styles.card,
                { width, paddingBottom: Math.max(20, insets.bottom + 16), minHeight: height * 0.42 },
              ]}
            >
              <Stagger baseDelay={60} step={90} variant="fadeUp" distance={14}>
                <SplitText
                  text={item.title}
                  splitType="chars"
                  delay={40}
                  duration={0.45}
                  from={{ opacity: 0, y: 18 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="left"
                  style={[styles.title, styles.titleCompact]}
                />

                <SplitText
                  text={item.body.replace(/\n+/g, ' ')}
                  splitType="words"
                  delay={12}
                  duration={0.35}
                  from={{ opacity: 0, y: 10 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="left"
                  style={[styles.body, styles.bodyCompact]}
                />

                {/* кнопка — тёмно-синий контур, текст белый */}
                <Pressable onPress={onNext} style={[styles.button, styles.buttonBig]}>
                  <SplitText
                    text={item.btn}
                    splitType="chars"
                    delay={16}
                    duration={0.3}
                    from={{ opacity: 0, y: 8 }}
                    to={{ opacity: 1, y: 0 }}
                    textAlign="left"
                    style={styles.buttonText}
                  />
                </Pressable>

                <View style={[styles.dots, { marginBottom: 6 }]}>
                  {slides.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        { opacity: i === index ? 1 : 0.45, transform: [{ scale: i === index ? 1.12 : 1 }] },
                      ]}
                    />
                  ))}
                </View>
              </Stagger>
            </ContainerAppear>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },

  // НИЖНИЙ КОНТЕЙНЕР: тёмно-синий
  card: {
    backgroundColor: NAVY_MAIN,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    shadowColor: NAVY_SHADOW,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  // текст
  title: { color: TEXT, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  titleCompact: { marginBottom: 8 },
  body: { color: TEXT, fontSize: 15, lineHeight: 22, marginBottom: 22, opacity: 0.95 },
  bodyCompact: { lineHeight: 20, marginBottom: 14 },

  // кнопка — тёмно-синий контур, текст белый
  button: {
    alignSelf: 'flex-start',
    backgroundColor: NAVY_SHADOW,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NAVY_MAIN,
    shadowColor: NAVY_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonBig: { paddingHorizontal: 38, paddingVertical: 28, borderRadius: 18 },
  buttonText: { color: TEXT, fontSize: 20, fontWeight: '800' },

  // индикаторы — белые
  dots: { flexDirection: 'row', gap: 8, marginTop: 18 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: TEXT },
});

export { NAVY_MAIN, NAVY_SHADOW, TEXT };
