import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from '@/context/SettingsContext';
import { getDb } from '@/database';
import { RootNavigator } from '@/navigation/RootNavigator';
import { prepareAudioSession } from '@/services/speech';
import { Colors } from '@/constants/colors';

type BootState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

/**
 * App entry. Opens (and on first launch seeds) the local SQLite database before showing
 * the navigator, so every screen can assume the data layer is ready.
 */
export default function App() {
  const [boot, setBoot] = useState<BootState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    prepareAudioSession(); // iOS: allow speech through the silent switch; Android: media stream
    getDb()
      .then(() => !cancelled && setBoot({ status: 'ready' }))
      .catch((err: unknown) => !cancelled && setBoot({ status: 'error', message: err instanceof Error ? err.message : String(err) }));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {boot.status === 'ready' ? (
        <SettingsProvider>
          <RootNavigator />
        </SettingsProvider>
      ) : boot.status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.title}>TalkEasy could not start</Text>
          <Text style={styles.message}>{boot.message}</Text>
          <Text style={styles.message}>Please close and reopen the app. If this keeps happening, reinstall it.</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.title}>TalkEasy</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  message: { fontSize: 18, color: Colors.textMuted, textAlign: 'center' },
});
