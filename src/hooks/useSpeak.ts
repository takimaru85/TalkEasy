import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/context/SettingsContext';
import { useI18n } from '@/i18n';
import { useProfile } from '@/context/ProfileContext';
import { buttonsRepo } from '@/database';
import { onSpeechStatus, speakWithSettings, speechStatus, stopSpeaking } from '@/services/speech';
import type { CommunicationButton } from '@/types/models';

/** "I want..." → "I want"; "Water" → "water" ; join → "I want water." */
function composeSentence(starter: string, endingLabel: string): string {
  const head = starter.replace(/\.\.\.$/, '').trim();
  const tail = endingLabel.trim().replace(/[.!?]+$/, '');
  const lowered = tail.charAt(0).toLowerCase() + tail.slice(1);
  return `${head} ${lowered}.`;
}

/**
 * Everything a communication screen needs to "say" a tile:
 * - speaks the phrase with the parent's speech settings (communication always speaks,
 *   even when feedback sound is off — talking is the point),
 * - haptic feedback, tap recording for Recent / most-used,
 * - the sentence builder: a starter tile ("I want...") waits for the next tile and
 *   composes "I want water."
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

  const speakButton = useCallback(
    async (button: CommunicationButton) => {
      setLastButtonId(button.id);
      haptic();
      buttonsRepo.recordTap(button.id).catch(() => {});

      const phrase = tContent(button.phrase);
      const label = tContent(button.label);
      const isStarter = phrase.trim().endsWith('...');
      if (profile.communication.sentenceBuilder) {
        if (isStarter) {
          setPendingStarter(phrase);
          setLastPhrase(null);
          await speakWithSettings(phrase.replace(/\.\.\.$/, ''), settings);
          return;
        }
        if (pendingStarter) {
          const sentence = composeSentence(pendingStarter, label);
          setPendingStarter(null);
          await speakPhrase(sentence);
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

  return { lastPhrase, lastButtonId, pendingStarter, speechAvailable, speakButton, speakPhrase, speakFeedback, repeat, clear, cancelStarter };
}
