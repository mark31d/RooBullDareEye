// App.js — entry point for Bull’s Dare Eye
import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Loader from './Components/Loader';
import Onboarding from './Components/Onboarding';

import HomeScreen from './Components/HomeScreen';
import GameSetupScreen     from './Components/GameSetupScreen';
import GameCountdownScreen from './Components/GameCountdownScreen';
import GameScreen          from './Components/GameScreen';
import GameResultsScreen   from './Components/GameResultsScreen';

import GameRulesScreen from './Components/GameRulesScreen';
import InfoScreen      from './Components/InfoScreen';
import StatisticsScreen  from './Components/StatisticsScreen'; 

const Stack = createNativeStackNavigator();

function LoaderScreen({ navigation }) {
  return <Loader delay={2000} fadeMs={300} onFinish={() => navigation.replace('Onboarding')} />;
}

function OnboardingScreen({ navigation }) {
  return <Onboarding onFinish={() => navigation.replace('Home')} />;
}

export default function App() {
  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#0a1826',
        card: '#0a1826',
        text: '#ffffff',
        primary: '#ff9a3e',
        border: '#0a1826',
      },
    }),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            initialRouteName="Loader"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: true,
              contentStyle: { backgroundColor: '#0a1826' },
            }}
          >
            {/* Boot flow */}
            <Stack.Screen name="Loader" component={LoaderScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />

            {/* Main */}
            <Stack.Screen name="Home"       component={HomeScreen} />
            <Stack.Screen name="GameRules"  component={GameRulesScreen} />
            <Stack.Screen name="Info"       component={InfoScreen} />
            <Stack.Screen name="Statistics" component={StatisticsScreen} /> 

            {/* Game flow */}
            <Stack.Screen name="GameSetup"     component={GameSetupScreen} />
            <Stack.Screen name="GameCountdown" component={GameCountdownScreen} />
            <Stack.Screen name="Game"          component={GameScreen} />
            <Stack.Screen name="GameResults"   component={GameResultsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
