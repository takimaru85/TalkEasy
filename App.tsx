import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { ThemeProvider, useAppFonts } from '@/theme';
import { getDb } from '@/database';
import { RootNavigator } from '@/navigation/RootNavigator';
import { prepareAudioSession } from '@/services/speech';
import { useOrientationLock } from '@/hooks/useOrientationLock';
import { Colors } from '@/constants/colors';

type BootState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

/**
 * App entry. Opens (and on first launch seeds) the local SQLite database and loads the
 * bundled font before showing the navigator, so every screen can assume data + theme are ready.
 */
export default function App() {
  const [boot, setBoot] = useState<BootState>({ status: 'loading' });
  const fontsReady = useAppFonts();

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
      {boot.status === 'ready' && fontsReady ? (
        <SettingsProvider>
          <ProfileProvider>
            <ThemeProvider>
              <NavigatorWhenLoaded />
            </ThemeProvider>
          </ProfileProvider>
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

/** Waits for settings + profile so the initial route, name and theme are right on first paint. */
function NavigatorWhenLoaded() {
  const { loaded: settingsLoaded } = useSettings();
  useOrientationLock();
  const { loaded: profileLoaded } = useProfile();
  if (!settingsLoaded || !profileLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return <RootNavigator />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  message: { fontSize: 18, color: Colors.textMuted, textAlign: 'center' },
});
