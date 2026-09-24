import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton, Icon } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { isSpeechRecognitionAvailable, requestSpeechPermission, startListening } from '@/services/speechRecognition';
import { Fonts, Radius, useTheme } from '@/theme';
import { useI18n } from '@/i18n';

interface Props {
  /** Called with the transcript the child confirmed. */
  onUseAnswer: (text: string) => void;
  /** Parent-assisted fallback: a grown-up confirms the spoken answer was right / needs another try. */
  onAssistedResult: (correct: boolean) => void;
  /** BCP-47 tag. Defaults to the language chosen in Settings. */
  lang?: string;
  /** What to ask the child to say (spoken aloud by the caller). */
  prompt?: string;
}

type Phase = 'idle' | 'listening' | 'review' | 'error';

/**
 * 🎤 Tap to speak → on-device transcript → child/parent confirms [✓ Use answer] [🔄 Try again].
 * Speaking is always optional. When speech-to-text is not available on this build/device the
 * panel becomes the "tell a grown-up" flow so the child can still answer orally.
 */
export function SpeechAnswer({ onUseAnswer, onAssistedResult, lang, prompt }: Props) {
  const { t, speechTag } = useI18n();
  const listenLang = lang ?? speechTag;
  const theme = useTheme();
  const available = isSpeechRecognitionAvailable();
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('');
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => stopRef.current(), []);

  const listen = async () => {
    const ok = await requestSpeechPermission();
    if (!ok) {
      setPhase('error');
      setMessage('Microphone not allowed. A grown-up can allow it in the phone settings, or tap ✓ below after you say the answer.');
      return;
    }
    setTranscript('');
    setPhase('listening');
    stopRef.current = startListening(
      listenLang,
      ({ transcript: t, isFinal }) => {
        setTranscript(t);
        if (isFinal) setPhase('review');
      },
      (msg) => {
        setPhase('error');
        setMessage(msg.includes('no-speech') || msg.toLowerCase().includes('no match') ? "I didn't hear anything. Try again." : msg);
      },
      () => setPhase((p) => (p === 'listening' ? (transcript ? 'review' : 'idle') : p)),
    );
  };

  const stop = () => {
    stopRef.current();
    setPhase(transcript ? 'review' : 'idle');
  };

  return (
    <View style={styles.wrap}>
      {prompt ? (
        <Text style={[styles.prompt, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {prompt}
        </Text>
      ) : null}

      {available ? (
        <>
          <Pressable
            onPress={phase === 'listening' ? stop : listen}
            accessibilityRole="button"
            accessibilityLabel={phase === 'listening' ? 'Stop listening' : t('tapToSpeak')}
            style={({ pressed }) => [
              styles.mic,
              theme.shadow,
              { backgroundColor: phase === 'listening' ? theme.colors.danger : theme.colors.primary, borderColor: phase === 'listening' ? theme.colors.danger : theme.colors.primaryDark },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Icon name={phase === 'listening' ? 'stop' : 'microphone'} size={44} color="#FFFFFF" />
            <Text style={styles.micText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {phase === 'listening' ? t('listening') : t('tapToSpeak')}
            </Text>
          </Pressable>

          <View style={[styles.transcript, { backgroundColor: theme.colors.surface, borderColor: transcript ? theme.colors.primary : theme.colors.borderSoft }]} accessibilityLiveRegion="polite">
            <Text style={[styles.transcriptText, { color: transcript ? theme.colors.text : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={3} adjustsFontSizeToFit>
              {transcript || (phase === 'listening' ? '…' : phase === 'error' ? message : 'Your words will show here')}
            </Text>
          </View>

          {phase === 'review' && transcript ? (
            <View style={styles.actions}>
              <BigButton label="Use answer" icon="check-bold" variant="success" minHeight={72} onPress={() => onUseAnswer(transcript)} style={styles.half} />
              <BigButton label={t('actionTryAgain')} icon="replay" variant="outline" minHeight={72} onPress={listen} style={styles.half} />
            </View>
          ) : null}
          {phase === 'error' ? <BigButton label={t('actionTryAgain')} icon="replay" variant="secondary" minHeight={64} onPress={listen} /> : null}
        </>
      ) : (
        <View style={[styles.transcript, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
          <Text style={[styles.transcriptText, { color: theme.colors.text, fontSize: 20 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            🎤 Say your answer out loud.
          </Text>
          <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Speech-to-text is not available in this version, so a grown-up taps the answer below.
          </Text>
        </View>
      )}

      <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Grown-up: was the spoken answer right?
      </Text>
      <View style={styles.actions}>
        <BigButton label="Yes, correct" icon="check-bold" variant={available ? 'secondary' : 'success'} minHeight={64} onPress={() => onAssistedResult(true)} style={styles.half} />
        <BigButton label="Not yet" icon="replay" variant="outline" minHeight={64} onPress={() => onAssistedResult(false)} style={styles.half} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  prompt: { fontFamily: Fonts.bold, fontSize: 18, textAlign: 'center' },
  mic: { minHeight: 96, borderRadius: Radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg },
  micText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 22 },
  transcript: { minHeight: 80, borderRadius: Radius.md, borderWidth: 2.5, padding: SPACING.md, justifyContent: 'center', gap: 6 },
  transcriptText: { fontFamily: Fonts.black, fontSize: 28, textAlign: 'center' },
  note: { fontFamily: Fonts.semibold, fontSize: 15, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
});
