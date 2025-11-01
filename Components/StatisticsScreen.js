// Components/StatisticsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/bg.webp');

const GOLD       = '#D4AF37';
const GRAPE_DARK = '#3C096C';
const PASTEL     = '#E9D5FF';
const TEXT       = '#FFFFFF';

const STORAGE_KEY_RESULTS = 'stats:results';

/* helpers */
const toFixed1 = (n) => Math.round(n * 10) / 10;
const bar = (value = 0, max = 1, width = 10) => {
  const safeMax = Math.max(max, 1e-9);
  const filled = Math.round(Math.min(1, value / safeMax) * width);
  return '▌'.repeat(filled) + ' '.repeat(Math.max(0, width - filled));
};

export default function StatisticsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const headerTopPadding = insets.top + 14;

  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_RESULTS);
        setResults(raw ? JSON.parse(raw) : []);
      } catch {}
    })();
  }, []);

  const {
    games, numPlayers, totalPoints,
    avgPointsPerGame, avgPlayersPerGame, avgWinningMargin, medianPointsPerGame,
    bestScore, bestStreak, currentStreak,
    biggestBlowout, closestFinish, recordAttendance,
    topWinners, topWinRates, leaderboard, perPlayer, lastGamesCompact,
  } = useMemo(() => {
    const games = results.length;
    const playersSet = new Set();
    const appearancesCount = {};
    const winnersCount = {};
    const perGameTotals = [];
    let totalPoints = 0;
    let bestScore = { player: null, points: 0, at: null };

    // for blowouts & closest finishes & attendance
    let biggestBlowout = null; // {at, margin, winner}
    let closestFinish  = null; // {at, margin, winner}
    let recordAttendance = { at: null, players: 0 };

    // for streaks (overall)
    const byTime = [...results].sort((a, b) => (a.at || 0) - (b.at || 0));

    // per-player aggregates
    const perPlayer = {}; // name -> {games,wins,points,avgPoints,best,form: [W/L], last5: [...]}

    for (const r of results) {
      const names = Object.keys(r.scores || {});
      const values = Object.values(r.scores || {});
      // attendance
      if (names.length > recordAttendance.players) {
        recordAttendance = { at: r.at, players: names.length };
      }
      // per-game total points
      const gameTotal = values.reduce((a, b) => a + b, 0);
      totalPoints += gameTotal;
      perGameTotals.push(gameTotal);

      // players aggregation
      for (const name of names) {
        playersSet.add(name);
        appearancesCount[name] = (appearancesCount[name] || 0) + 1;

        const pts = r.scores[name] || 0;
        if (!perPlayer[name]) {
          perPlayer[name] = {
            games: 0, wins: 0, points: 0, best: 0, form: [], last5: [],
          };
        }
        perPlayer[name].games += 1;
        perPlayer[name].points += pts;
        if (pts > perPlayer[name].best) perPlayer[name].best = pts;
        if (pts > bestScore.points) bestScore = { player: name, points: pts, at: r.at };
      }

      // winner
      if (r.winner) {
        winnersCount[r.winner] = (winnersCount[r.winner] || 0) + 1;
        if (perPlayer[r.winner]) perPlayer[r.winner].wins += 1;
      }

      // margins
      const sorted = [...values].sort((a, b) => b - a);
      if (sorted.length >= 2) {
        const margin = sorted[0] - sorted[1];
        if (!biggestBlowout || margin > biggestBlowout.margin) {
          biggestBlowout = { at: r.at, margin, winner: r.winner || '-' };
        }
        if (!closestFinish || margin < closestFinish.margin) {
          closestFinish = { at: r.at, margin, winner: r.winner || '-' };
        }
      }
    }

    // per-player derived
    for (const name of Object.keys(perPlayer)) {
      const p = perPlayer[name];
      p.avgPoints = p.games ? toFixed1(p.points / p.games) : 0;
    }

    // compute last 5 results form (W/L) per player across time
    const last5Window = 5;
    for (const name of Object.keys(perPlayer)) perPlayer[name].form = [];
    for (const r of byTime) {
      const names = Object.keys(r.scores || {});
      for (const name of names) {
        const res = r.winner === name ? 'W' : 'L';
        perPlayer[name].form.push(res);
      }
    }
    for (const name of Object.keys(perPlayer)) {
      const arr = perPlayer[name].form.slice(-last5Window);
      perPlayer[name].last5 = arr;
    }

    // average metrics
    const avgPointsPerGame = games ? toFixed1(totalPoints / games) : 0;
    const avgPlayersPerGame = games
      ? toFixed1(results.reduce((acc, r) => acc + Object.keys(r.scores || {}).length, 0) / games)
      : 0;

    // avg winning margin (over all games)
    let winningMarginSum = 0; let winningMarginCount = 0;
    for (const r of results) {
      const vals = Object.values(r.scores || {}).sort((a, b) => b - a);
      if (vals.length >= 2) {
        winningMarginSum += (vals[0] - vals[1]);
        winningMarginCount += 1;
      }
    }
    const avgWinningMargin = winningMarginCount ? toFixed1(winningMarginSum / winningMarginCount) : 0;

    // median points per game
    const medianPointsPerGame = (() => {
      if (perGameTotals.length === 0) return 0;
      const arr = [...perGameTotals].sort((a, b) => a - b);
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 ? arr[mid] : toFixed1((arr[mid - 1] + arr[mid]) / 2);
    })();

    // longest overall win streak & current streak
    let bestStreak = { player: null, len: 0 };
    let currentStreak = { player: null, len: 0 };
    let curPlayer = null; let curLen = 0;
    for (const r of byTime) {
      const w = r.winner || null;
      if (!w) { curPlayer = null; curLen = 0; continue; }
      if (w === curPlayer) curLen += 1; else { curPlayer = w; curLen = 1; }
      if (curLen > bestStreak.len) bestStreak = { player: curPlayer, len: curLen };
    }
    // current streak — от конца временной шкалы
    curPlayer = null; curLen = 0;
    for (let i = byTime.length - 1; i >= 0; i--) {
      const w = byTime[i].winner || null;
      if (!w) break;
      if (curPlayer == null) { curPlayer = w; curLen = 1; }
      else if (w === curPlayer) curLen += 1;
      else break;
    }
    currentStreak = curPlayer ? { player: curPlayer, len: curLen } : { player: null, len: 0 };

    // top winners
    const topWinners = Object.entries(winnersCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // win rates (min 2 games)
    const winRates = Object.keys(perPlayer).map((name) => ({
      name,
      wins: perPlayer[name].wins,
      games: perPlayer[name].games,
      rate: perPlayer[name].games ? perPlayer[name].wins / perPlayer[name].games : 0,
      avgPoints: perPlayer[name].avgPoints,
    }));
    const topWinRates = winRates
      .filter((x) => x.games >= 2)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    // composite leaderboard score: wins weight + avg points weight
    // score = wins*2 + avgPoints
    const leaderboard = [...winRates]
      .map((x) => ({ ...x, score: x.wins * 2 + x.avgPoints }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // most active
    let mostActive = { player: '-', games: 0 };
    for (const [name, c] of Object.entries(appearancesCount)) {
      if (c > mostActive.games) mostActive = { player: name, games: c };
    }

    // compact last games
    const lastGamesCompact = results.slice(-10).map((r) => ({
      at: r.at, winner: r.winner || '-', players: Object.keys(r.scores || {}).length,
    })).reverse();

    return {
      games, numPlayers, totalPoints,
      avgPointsPerGame, avgPlayersPerGame, avgWinningMargin, medianPointsPerGame,
      bestScore, mostActive, bestStreak, currentStreak,
      biggestBlowout, closestFinish, recordAttendance,
      topWinners, topWinRates, leaderboard, perPlayer, lastGamesCompact,
    };
  }, [results]);

  const reset = async () => {
    Alert.alert('Reset statistics', 'Are you sure you want to clear all stats?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          try { await AsyncStorage.removeItem(STORAGE_KEY_RESULTS); setResults([]); } catch {}
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: headerTopPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {/* Overview */}
        <View style={styles.card}>
          <Text style={styles.title}>Overview</Text>
          <View style={styles.row}><Text style={styles.label}>Games played</Text><Text style={styles.value}>{games}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Unique players</Text><Text style={styles.value}>{numPlayers}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Total points</Text><Text style={styles.value}>{totalPoints}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Avg points / game</Text><Text style={styles.value}>{avgPointsPerGame}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Avg players / game</Text><Text style={styles.value}>{avgPlayersPerGame}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Median points / game</Text><Text style={styles.value}>{medianPointsPerGame}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Avg winning margin</Text><Text style={styles.value}>{avgWinningMargin}</Text></View>
           <View style={styles.row}><Text style={styles.label}>Best single score</Text><Text style={styles.value}>{bestScore.points || 0}{bestScore.player ? ` — ${bestScore.player}` : ''}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Record attendance</Text><Text style={styles.value}>{recordAttendance.players || 0}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Longest win streak</Text><Text style={styles.value}>{bestStreak.len || 0}{bestStreak.player ? ` — ${bestStreak.player}` : ''}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Current win streak</Text><Text style={styles.value}>{currentStreak.len || 0}{currentStreak.player ? ` — ${currentStreak.player}` : ''}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Biggest blowout</Text><Text style={styles.value}>{biggestBlowout?.margin ?? 0}{biggestBlowout?.winner ? ` — ${biggestBlowout.winner}` : ''}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Closest finish</Text><Text style={styles.value}>{closestFinish?.margin ?? 0}{closestFinish?.winner ? ` — ${closestFinish.winner}` : ''}</Text></View>
        </View>

        {/* Leaderboards */}
        <View style={styles.card}>
          <Text style={styles.title}>Top winners</Text>
          {topWinners?.length ? topWinners.map(([name, count]) => (
            <View key={name} style={styles.row}>
              <Text style={styles.label}>{name}</Text>
              <Text style={styles.value}>{count}</Text>
            </View>
          )) : <Text style={styles.muted}>No data yet</Text>}

          <Text style={[styles.title, { marginTop: 16 }]}>Win rate (min 2 games)</Text>
          {topWinRates?.length ? topWinRates.map((x) => (
            <View key={x.name} style={styles.row}>
              <Text style={styles.label}>{x.name}</Text>
              <Text style={styles.value}>{Math.round(x.rate * 100)}%</Text>
            </View>
          )) : <Text style={styles.muted}>No data yet</Text>}

          <Text style={[styles.title, { marginTop: 16 }]}>Composite leaderboard</Text>
          {leaderboard?.length ? leaderboard.map((x, idx) => (
            <View key={x.name} style={styles.row}>
              <Text style={styles.label}>{idx + 1}. {x.name}</Text>
              <Text style={styles.value}>{toFixed1(x.score)}</Text>
            </View>
          )) : <Text style={styles.muted}>No data yet</Text>}
        </View>

        {/* Player Insights */}
        <View style={styles.card}>
          <Text style={styles.title}>Player insights (last 5)</Text>
          {Object.keys(perPlayer).length ? Object.entries(perPlayer)
            .sort((a, b) => b[1].wins - a[1].wins || b[1].avgPoints - a[1].avgPoints)
            .slice(0, 8)
            .map(([name, p]) => {
              const form = p.last5.join(' ');
              // спарклайн по средним очкам
              const maxAvg = Math.max(...Object.values(perPlayer).map(pp => pp.avgPoints || 0), 1);
              return (
                <View key={name} style={{ marginBottom: 10 }}>
                  <View style={styles.row}>
                    <Text style={styles.label}>{name}</Text>
                    <Text style={styles.value}>{p.wins}/{p.games} wins</Text>
                  </View>
                  <View style={styles.miniRow}>
                    <Text style={styles.small}>Avg pts</Text>
                    <Text style={styles.smallGold}>{p.avgPoints}</Text>
                    <Text style={styles.spark}>[{bar(p.avgPoints, maxAvg, 12)}]</Text>
                  </View>
                  <View style={styles.miniRow}>
                    <Text style={styles.small}>Best</Text>
                    <Text style={styles.smallGold}>{p.best}</Text>
                    <Text style={styles.small}>Form</Text>
                    <Text style={[styles.smallGold, { letterSpacing: 1 }]}>{form || '-'}</Text>
                  </View>
                </View>
              );
            })
          : <Text style={styles.muted}>No data yet</Text>}
        </View>

        {/* Last games */}
        <View style={styles.card}>
          <Text style={styles.title}>Last games</Text>
          {lastGamesCompact.length ? lastGamesCompact.map((r, idx) => (
            <View
              key={`${r.at}-${idx}`}
              style={[styles.resultRow, idx !== 0 && { borderTopWidth: 1, borderTopColor: 'rgba(233,213,255,0.2)' }]}
            >
              <Text style={styles.small}>{new Date(r.at).toLocaleString()}</Text>
              <Text style={styles.small}>
                Winner: <Text style={{ color: GOLD, fontWeight: '800' }}>{r.winner}</Text> • Players: {r.players}
              </Text>
            </View>
          )) : <Text style={styles.muted}>No games yet</Text>}
        </View>

        <TouchableOpacity onPress={reset} style={styles.clearBtn}>
          <Text style={styles.clearTxt}>Clear statistics</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: GRAPE_DARK,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: TEXT, fontSize: 22, marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 22, fontWeight: '800' },

  card: { backgroundColor: GRAPE_DARK, borderRadius: 22, padding: 16, marginBottom: 16 },
  title: { color: TEXT, fontSize: 18, fontWeight: '900', marginBottom: 10 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },

  label: { color: TEXT, fontSize: 16, fontWeight: '700' },
  value: { color: GOLD, fontSize: 16, fontWeight: '900' },
  muted: { color: PASTEL, opacity: 0.85 },

  small: { color: '#EEDCFF', fontSize: 12, opacity: 0.9 },
  smallGold: { color: GOLD, fontSize: 12, fontWeight: '900' },
  spark: { color: GOLD, fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },

  resultRow: { paddingVertical: 8 },

  clearBtn: { backgroundColor: PASTEL, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  clearTxt: { color: GRAPE_DARK, fontSize: 16, fontWeight: '800' },
});
