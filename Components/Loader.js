// Components/Loader.js
import React, { useEffect, useMemo, useRef } from 'react';
import { ImageBackground, StyleSheet, Animated, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const defaultBgWebp = require('../assets/bg.webp');
let defaultBg = defaultBgWebp;

export default function Loader({
  delay = 2000,
  fadeMs = 300,
  onFinish = () => {},
  bgSource,
  loaderSize = 96,
  // было: '#ff9a3e' (оранжевый). Сделал синим по умолчанию:
  color = '#0d2235', // синий
  useFallbackPng = false,
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  const html = useMemo(
    () => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>
  html, body { margin:0; padding:0; background:transparent; width:100%; height:100%; overflow:hidden; }
  .wrap { display:flex; align-items:center; justify-content:center; width:100%; height:100%; background:transparent; }
  /* From Uiverse.io by bociKond (адапт.) */
  .loader { width:44.8px; height:44.8px; color:${color}; position:relative; background:radial-gradient(11.2px,currentColor 94%,#0000); }
  .loader:before{
    content:'';
    position:absolute; inset:0; border-radius:50%;
    background:
      radial-gradient(10.08px at bottom right,#0000 94%,currentColor) top left,
      radial-gradient(10.08px at bottom left ,#0000 94%,currentColor) top right,
      radial-gradient(10.08px at top    right,#0000 94%,currentColor) bottom left,
      radial-gradient(10.08px at top    left ,#0000 94%,currentColor) bottom right;
    background-size:22.4px 22.4px; background-repeat:no-repeat;
    animation:loader 1.5s infinite cubic-bezier(0.3,1,0,1);
  }
  @keyframes loader{
    33%{ inset:-11.2px; transform:rotate(0deg); }
    66%{ inset:-11.2px; transform:rotate(90deg); }
    100%{ inset:0; transform:rotate(90deg); }
  }
</style>
</head>
<body><div class="wrap"><div class="loader"></div></div></body>
</html>`,
    [color]
  );

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: fadeMs, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: fadeMs, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, delay);
    return () => clearTimeout(t);
  }, [delay, fadeMs, onFinish, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <ImageBackground
        source={bgSource || defaultBg}
        style={styles.bg}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.center}>
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            style={[styles.webview, { width: loaderSize, height: loaderSize, backgroundColor: 'transparent' }]}
            androidLayerType={Platform.select({ android: 'hardware', default: 'none' })}
            scrollEnabled={false}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            setSupportMultipleWindows={false}
          />
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, width: '100%', height: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  webview: { borderWidth: 0 },
});
