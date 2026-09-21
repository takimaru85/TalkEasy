import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, FormField, ScreenContainer, ScreenHeader, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SIZE_OPTION_LABELS, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { listVoices, onSpeechStatus, speakWithSettings, speechStatus, type SpeechStatus, type VoiceOption } from '@/services/speech';
import type { RotationMode, SizeOption } from '@/types/models';
import { alertMessage } from '@/utils/confirm';
import { BRAND } from '@/constants/brand';
import { Fonts } from '@/theme';

const RATE_CHOICES = [
  { value: '0.7', label: 'Slow' },
  { value: '0.9', label: 'Normal' },
  { value: '1.1', label: 'Fast' },
];
const PITCH_CHOICES = [
  { value: '0.8', label: 'Lower' },
  { value: '1', label: 'Normal' },
  { value: '1.2', label: 'Higher' },
];
const SIZE_CHOICES = (Object.keys(SIZE_OPTION_LABELS) as SizeOption[]).map((k) => ({ value: k, label: SIZE_OPTION_LABELS[k] }));

const TEST_PHRASE = 'Hello! This is how I sound.';

/** Speech, button size, text size, haptics and the parent PIN. Every change saves immediately. */
export function SettingsScreen({ navigation }: ParentScreenProps<'Settings'>) {
  const sizes = useSizes();
  const { settings, updateSetting } = useSettings();
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [showVoices, setShowVoices] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>({ ...speechStatus });
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');

  useEffect(() => onSpeechStatus(setStatus), []);
  useEffect(() => {
    listVoices().then(setVoices);
  }, []);

  const nearest = (choices: { value: string }[], n: number) =>
    choices.reduce((best, c) => (Math.abs(Number(c.value) - n) < Math.abs(Number(best.value) - n) ? c : best)).value;

  const savePin = async () => {
    if (!/^\d{4}$/.test(pin1)) return alertMessage('PIN must be exactly 4 digits.');
    if (pin1 !== pin2) return alertMessage('The two PINs do not match.');
    await updateSetting('parentPin', pin1);
    setPin1('');
    setPin2('');
    alertMessage('PIN updated.');
  };

  // Show voices in the device language first; the list can be long on Android.
  const visibleVoices = voices.slice(0, showVoices ? voices.length : 0);

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Section title="Speech">
            {!status.available ? (
              <View style={styles.warning}>
                <Icon name="alert-circle" size={28} color={Colors.danger} />
                <Text style={[styles.warningText, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  The speech engine reported an error{status.lastError ? `: ${status.lastError}` : ''}. Phrases are still
                  shown in large text. See the checklist below.
                </Text>
              </View>
            ) : null}
            <ChoiceRow label="Speed" value={nearest(RATE_CHOICES, settings.speechRate)} onChange={(v) => updateSetting('speechRate', Number(v))} choices={RATE_CHOICES} />
            <ChoiceRow label="Pitch" value={nearest(PITCH_CHOICES, settings.speechPitch)} onChange={(v) => updateSetting('speechPitch', Number(v))} choices={PITCH_CHOICES} />
            <BigButton label="Test the voice" icon="volume-high" variant="secondary" minHeight={64} onPress={() => speakWithSettings(TEST_PHRASE, settings)} />
            <SpeechDiagnostics status={status} voiceCount={voices.length} />

            <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Voice: {settings.speechVoice ? (voices.find((v) => v.identifier === settings.speechVoice)?.name ?? settings.speechVoice) : 'Device default'}
            </Text>
            {voices.length === 0 ? (
              <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                No voice list available. The device default voice will be used.
              </Text>
            ) : (
              <BigButton
                label={showVoices ? 'Hide voices' : `Choose a voice (${voices.length})`}
                icon={showVoices ? 'chevron-up' : 'chevron-down'}
                variant="secondary"
                minHeight={56}
                onPress={() => setShowVoices((s) => !s)}
              />
            )}
            {showVoices ? (
              <View style={styles.voiceList}>
                <VoiceRow name="Device default" language="" selected={!settings.speechVoice} onPress={() => updateSetting('speechVoice', null)} />
                {visibleVoices.map((v) => (
                  <VoiceRow
                    key={v.identifier}
                    name={v.name}
                    language={v.language}
                    selected={settings.speechVoice === v.identifier}
                    onPress={async () => {
                      await updateSetting('speechVoice', v.identifier);
                      speakWithSettings(TEST_PHRASE, { ...settings, speechVoice: v.identifier });
                    }}
                  />
                ))}
              </View>
            ) : null}
          </Section>

          <Section title="Size">
            <ChoiceRow label="Button size" value={settings.buttonSize} onChange={(v) => updateSetting('buttonSize', v as SizeOption)} choices={SIZE_CHOICES} />
            <ChoiceRow label="Text size" value={settings.textSize} onChange={(v) => updateSetting('textSize', v as SizeOption)} choices={SIZE_CHOICES} />
            <ChoiceRow
              label="Vibration on tap"
              value={settings.hapticsEnabled ? 'on' : 'off'}
              onChange={(v) => updateSetting('hapticsEnabled', v === 'on')}
              choices={[
                { value: 'on', label: 'On' },
                { value: 'off', label: 'Off' },
              ]}
            />
          </Section>

          <Section title="Accessibility">
            <ChoiceRow
              label="High contrast"
              value={settings.highContrast ? 'on' : 'off'}
              onChange={(v) => updateSetting('highContrast', v === 'on')}
              choices={[
                { value: 'on', label: 'On' },
                { value: 'off', label: 'Off' },
              ]}
            />
            <ChoiceRow
              label="Reduce animation"
              value={settings.reducedMotion ? 'on' : 'off'}
              onChange={(v) => updateSetting('reducedMotion', v === 'on')}
              choices={[
                { value: 'on', label: 'Reduce' },
                { value: 'off', label: 'Normal' },
              ]}
            />
            <ChoiceRow
              label="Spoken feedback (greetings, praise)"
              value={settings.soundEnabled ? 'on' : 'off'}
              onChange={(v) => updateSetting('soundEnabled', v === 'on')}
              choices={[
                { value: 'on', label: 'On' },
                { value: 'off', label: 'Off' },
              ]}
            />
            <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Communication cards always speak. This switch only affects extra feedback such as "Great job".
            </Text>
          </Section>

          <Section title="Screen rotation">
            <ChoiceRow<RotationMode>
              label="Landscape"
              value={settings.rotation}
              onChange={(v) => updateSetting('rotation', v)}
              choices={[
                { value: 'auto', label: 'Tablets only' },
                { value: 'always', label: 'Always allow' },
                { value: 'portrait', label: 'Portrait only' },
              ]}
            />
            <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              On a tablet the app can be used sideways; grids show more cards per row. Takes effect immediately.
            </Text>
          </Section>

          <Section title="Child interface">
            <ChoiceRow
              label="Open the app in School Mode"
              value={settings.schoolModeAtStart ? 'on' : 'off'}
              onChange={(v) => updateSetting('schoolModeAtStart', v === 'on')}
              choices={[
                { value: 'on', label: 'Yes' },
                { value: 'off', label: 'No, show Home' },
              ]}
            />
            <ChoiceRow
              label="Ask before marking things done"
              value={settings.confirmComplete ? 'on' : 'off'}
              onChange={(v) => updateSetting('confirmComplete', v === 'on')}
              choices={[
                { value: 'on', label: 'Ask first' },
                { value: 'off', label: 'One tap' },
              ]}
            />
            <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              "Ask first" shows a confirmation when the child ticks an assignment, routine step or activity —
              useful if accidental taps are common.
            </Text>
          </Section>

          <Section title="Parent PIN">
            <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              The PIN protects Parent Mode. The default is 1234 — please change it.
            </Text>
            <FormField label="New PIN (4 digits)" value={pin1} onChangeText={setPin1} keyboardType="number-pad" maxLength={4} secureTextEntry />
            <FormField label="Repeat new PIN" value={pin2} onChangeText={setPin2} keyboardType="number-pad" maxLength={4} secureTextEntry />
            <BigButton label="Change PIN" icon="lock" variant="secondary" minHeight={64} onPress={savePin} />
          </Section>

          <Section title="Privacy">
            <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              TalkEasy works fully offline. It has no account, no internet features, no analytics, and never
              sends any data off this device. Uninstalling the app deletes its data.
            </Text>
          </Section>

          <Section title="About">
            <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {BRAND.appName} · Version {BRAND.version}
            </Text>
            <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {BRAND.tagline} · {BRAND.website}{'\n'}{BRAND.copyright}. Built for children who communicate and learn in their own way.
            </Text>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

/**
 * Shows whether utterances are actually finishing and a platform-specific checklist for
 * the common causes of silence. All local; nothing is reported anywhere.
 */
function SpeechDiagnostics({ status, voiceCount }: { status: SpeechStatus; voiceCount: number }) {
  const sizes = useSizes();
  const silentButFinishing = status.requested > 0 && status.completed > 0;
  const neverFinishing = status.requested > 0 && status.completed === 0;
  const tips =
    Platform.OS === 'ios'
      ? [
          'Turn up the volume with the side buttons while the app is open (not the ringer volume).',
          'Check Settings → Sounds & Haptics → Silent Mode. TalkEasy asks to play through the silent switch, but if this ever fails try switching it off.',
          'Settings → Accessibility → Spoken Content → Voices → download an English voice.',
          'Disconnect Bluetooth headphones/speakers that may be receiving the audio.',
        ]
      : [
          'Turn up the MEDIA volume (press a volume button, then tap the slider icon and raise "Media"), not the ringtone volume.',
          'Settings → Accessibility (or General management → Language) → Text-to-speech output → choose an engine (e.g. Speech Services by Google) and tap its gear → Install voice data → English.',
          'Tap "Listen to an example" in that same phone settings screen. If it is silent there too, the phone has no working TTS engine yet.',
          'Disconnect Bluetooth headphones/speakers that may be receiving the audio.',
        ];

  return (
    <View style={styles.diag}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Speech check
      </Text>
      <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Voices found: {voiceCount} · Spoken: {status.completed} of {status.requested} requested
        {status.audioSessionReady ? ' · audio ready' : ' · audio not configured yet'}
      </Text>
      {neverFinishing ? (
        <Text style={[styles.hint, styles.hintStrong]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Phrases are being sent but never finish — the phone's speech engine is not producing audio.
        </Text>
      ) : null}
      {silentButFinishing ? (
        <Text style={[styles.hint, styles.hintStrong]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Phrases are playing. If you hear nothing, the sound is going somewhere else or the volume is off:
        </Text>
      ) : null}
      {tips.map((t, i) => (
        <Text key={i} style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {i + 1}. {t}
        </Text>
      ))}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const sizes = useSizes();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: sizes.heading - 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function VoiceRow({ name, language, selected, onPress }: { name: string; language: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={`${name} ${language}`}
      style={[styles.voiceRow, selected && styles.voiceRowSelected]}
    >
      <Icon name={selected ? 'check-circle' : 'checkbox-blank-circle-outline'} size={28} color={selected ? Colors.primaryDark : Colors.textMuted} />
      <Text style={[styles.voiceName, selected && styles.voiceNameSelected]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {name}
      </Text>
      {language ? <Text style={styles.voiceLang} maxFontSizeMultiplier={MAX_FONT_SCALE}>{language}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.xl, paddingBottom: SPACING.xl * 2 },
  section: { gap: SPACING.md },
  sectionTitle: { fontFamily: Fonts.extrabold, color: Colors.text },
  label: { fontFamily: Fonts.bold, color: Colors.text },
  hint: { color: Colors.textMuted, fontSize: 16, lineHeight: 22 },
  warning: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: Colors.danger,
    borderRadius: 12,
    backgroundColor: '#FFECEC',
  },
  warningText: { flex: 1, color: Colors.text },
  diag: { gap: SPACING.xs, padding: SPACING.md, borderWidth: 2, borderColor: '#CFCFCF', borderRadius: 12, backgroundColor: Colors.surface },
  hintStrong: { color: Colors.text, fontFamily: Fonts.bold },
  voiceList: { gap: SPACING.xs },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: MIN_PARENT_TARGET,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    borderRadius: 12,
  },
  voiceRowSelected: { borderColor: Colors.primaryDark, backgroundColor: '#E3ECFF' },
  voiceName: { flex: 1, fontSize: 17, color: Colors.text },
  voiceNameSelected: { fontFamily: Fonts.bold },
  voiceLang: { color: Colors.textMuted, fontSize: 15 },
});
