import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, PinPad, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { BRAND } from '@/constants/brand';
import { LOCKOUT_MS, MAX_ATTEMPTS, hasPin, isWeakPin, makePinRecord, needsUpgrade, verifyPin } from '@/services/pin';
import { Fonts } from '@/theme';

type Step = 'enter' | 'create' | 'confirm';

/**
 * PIN gate in front of Parent Mode.
 *
 * FIRST RUN: there is no PIN (and no default one), so the grown-up is asked to create one, twice, before
 * Parent Mode opens. A PIN from an older build keeps working and is quietly re-saved as a hash; the old
 * factory PIN (1234) is treated as "not set". Too many wrong entries pause the pad for a short while.
 */
export function ParentPinScreen({ navigation }: RootScreenProps<'ParentPin'>) {
  const sizes = useSizes();
  const { settings, updateSetting, loaded } = useSettings();
  const stored = settings.parentPin;
  const [step, setStep] = useState<Step>(() => (hasPin(stored) ? 'enter' : 'create'));
  const [first, setFirst] = useState('');
  const [message, setMessage] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const saving = useRef(false);

  // Settings load before this screen opens (App waits for them), but if a PIN appears late, follow it.
  useEffect(() => {
    if (loaded && step === 'create' && hasPin(stored) && !first) setStep('enter');
  }, [loaded, stored, step, first]);

  const locked = lockedUntil > now;
  useEffect(() => {
    if (!locked) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [locked]);

  const again = (msg: string) => {
    setMessage(msg);
    setResetKey((k) => k + 1);
  };

  const onComplete = async (pin: string) => {
    if (locked || saving.current) return;
    if (step === 'enter') {
      if (verifyPin(pin, stored)) {
        setMessage('');
        if (needsUpgrade(stored)) await updateSetting('parentPin', makePinRecord(pin)).catch(() => {});
        navigation.replace('Parent', { screen: 'Dashboard' });
        return;
      }
      const n = wrong + 1;
      if (n >= MAX_ATTEMPTS) {
        setWrong(0);
        setNow(Date.now());
        setLockedUntil(Date.now() + LOCKOUT_MS);
        again('Too many tries. Please wait a moment.');
      } else {
        setWrong(n);
        again('Wrong PIN. Try again.');
      }
      return;
    }
    if (step === 'create') {
      if (isWeakPin(pin)) return again('Choose a PIN that is harder to guess (not 1234 or four of the same digit).');
      setFirst(pin);
      setStep('confirm');
      again('');
      return;
    }
    // confirm
    if (pin !== first) {
      setFirst('');
      setStep('create');
      return again('The two PINs did not match. Start again.');
    }
    saving.current = true;
    try {
      await updateSetting('parentPin', makePinRecord(pin));
      navigation.replace('Parent', { screen: 'Dashboard' });
    } catch {
      saving.current = false;
      setFirst('');
      setStep('create');
      again('Could not save the PIN. Please try again.');
    }
  };

  const seconds = Math.max(1, Math.ceil((lockedUntil - now) / 1000));
  const prompt = step === 'enter' ? 'Enter the parent PIN' : step === 'create' ? 'Create a parent PIN' : 'Enter the PIN again';
  const sub = step === 'create' ? 'Choose 4 digits. You will use it to open Parent Mode.' : step === 'confirm' ? 'To make sure you typed it right.' : '';
  const shown = locked ? `Too many tries. Try again in ${seconds}s.` : message;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Parent Mode" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={[styles.prompt, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          {prompt}
        </Text>
        {sub ? (
          <Text style={[styles.sub, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {sub}
          </Text>
        ) : null}
        <View pointerEvents={locked ? 'none' : 'auto'} style={{ opacity: locked ? 0.4 : 1 }}>
          <PinPad onComplete={onComplete} resetKey={resetKey} />
        </View>
        <Text
          style={[styles.error, { fontSize: sizes.body, opacity: shown ? 1 : 0 }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="assertive"
        >
          {shown || ' '}
        </Text>
        <BigButton label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        <Text style={[styles.credit, { fontSize: sizes.body - 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {BRAND.appName} {BRAND.version} · {BRAND.tagline}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl, gap: SPACING.lg, paddingTop: SPACING.md },
  prompt: { fontFamily: Fonts.bold, color: Colors.text },
  sub: { color: Colors.textMuted, textAlign: 'center' },
  error: { color: Colors.danger, fontWeight: '700', textAlign: 'center' },
  credit: { color: Colors.textMuted, marginTop: 'auto', paddingBottom: SPACING.md },
});
