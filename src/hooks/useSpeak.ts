import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/context/SettingsContext';
import { useI18n } from '@/i18n';
import { useProfile } from '@/context/ProfileContext';
import { buttonsRepo } from '@/database';
import { onSpeechStatus, speakContent, speakWithSettings, speechStatus, stopSpeaking } from '@/services/speech';
import { generatePhrase, isStarterPhrase, starterHead } from '@/talk/phraseEngine';
import type { CommunicationButton } from '@/types/models';

/**
 * Everything a communication screen needs to "say" a tile:
 * - speaks the phrase with the parent's speech settings (communication always speaks,
 *   even when feedback sound is off — talking is the point),
 * - haptic feedback, tap recording for Recent / most-used,
 * - the sentence builder: a starter tile ("I want...") waits for the next tile, and the two
 *   become ONE natural sentence via talk/phraseEngine — "I want water.", but "I am hungry.",
 *   never "I want hungry." The banner shows exactly the sentence that is spoken.
 */
export function useSpeak() {
  const { settings } = useSettings();
  const { profile } = useProfile();
  // Tiles are stored in English; they are translated as they are spoken and shown (src/i18n).
  const { tContent } = useI18n();
  const [lastPhrase, setLastPhrase] = useState<string | null>(null);
  const [lastButtonId, setLastButtonId] = useState<number | null>(null);
  const [pendingStarter, setPendingStarter] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(speechStatus.available);

  useEffect(() => onSpeechStatus((s) => setSpeechAvailable(s.available)), []);

  const haptic = useCallback(async () => {
    if (!settings.hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // haptics unsupported on this device — ignore
    }
  }, [settings.hapticsEnabled]);

  /** Speaks a communication phrase (always audible). */
  const speakPhrase = useCallback(
    async (phrase: string) => {
      setLastPhrase(phrase);
      await speakWithSettings(phrase, settings);
    },
    [settings],
  );

  /** Speaks app feedback (greetings, "great job") — silenced by the Sound setting. */
  const speakFeedback = useCallback(
    async (text: string) => {
      if (!settings.soundEnabled) return;
      await speakWithSettings(text, settings);
    },
    [settings],
  );

  /**
   * Speaks text that belongs to CONTENT, in the language that content is written in.
   *
   * Same silencing rule as speakFeedback, but the voice follows the material rather than the app:
   * a lesson titled "Mga hayop" is Filipino wherever it is read out, including from a list of
   * lessons, and an English voice reads that title as the letters M, G, A. Pass '' (or nothing)
   * for English and this behaves exactly like speakFeedback.
   */
  const speakInLanguage = useCallback(
    async (text: string, language: string | null | undefined) => {
      if (!settings.soundEnabled) return;
      await speakContent(text, language, settings);
    },
    [settings],
  );

  const speakButton = useCallback(
    async (button: CommunicationButton) => {
      setLastButtonId(button.id);
      haptic();
      buttonsRepo.recordTap(button.id).catch(() => {});

      const phrase = tContent(button.phrase);
      const label = tContent(button.label);
      if (profile.communication.sentenceBuilder) {
        if (isStarterPhrase(phrase)) {
          setPendingStarter(phrase);
          setLastPhrase(null);
          await speakWithSettings(starterHead(phrase), settings);
          return;
        }
        if (pendingStarter) {
          // The tile's PHRASE carries its grammar ("I'm hungry.", "I want a snack."); its label does not.
          const sentence = generatePhrase({ starter: pendingStarter, label, phrase });
          setPendingStarter(null);
          await speakPhrase(sentence.speech);
          return;
        }
      }
      await speakPhrase(profile.communication.speakFullPhrase ? phrase : label);
    },
    [haptic, speakPhrase, settings, profile.communication, pendingStarter, tContent],
  );

  const repeat = useCallback(async () => {
    if (lastPhrase) {
      haptic();
      await speakWithSettings(lastPhrase, settings);
    }
  }, [lastPhrase, settings, haptic]);

  const clear = useCallback(async () => {
    setLastPhrase(null);
    setLastButtonId(null);
    setPendingStarter(null);
    await stopSpeaking();
  }, []);

  const cancelStarter = useCallback(() => setPendingStarter(null), []);

  return { lastPhrase, lastButtonId, pendingStarter, speechAvailable, speakButton, speakPhrase, speakFeedback, speakInLanguage, repeat, clear, cancelStarter };
}
