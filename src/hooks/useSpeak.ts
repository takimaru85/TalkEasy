import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/context/SettingsContext';
import { buttonsRepo } from '@/database';
import { onSpeechStatus, speakWithSettings, speechStatus, stopSpeaking } from '@/services/speech';
import type { CommunicationButton } from '@/types/models';

/**
 * Everything a communication screen needs to "say" a tile:
 * speaks the phrase with the parent's speech settings, gives haptic feedback,
 * records the tap for "most used", and remembers the last phrase for the banner.
 */
export function useSpeak() {
  const { settings } = useSettings();
  const [lastPhrase, setLastPhrase] = useState<string | null>(null);
  const [lastButtonId, setLastButtonId] = useState<number | null>(null);
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

  const speakPhrase = useCallback(
    async (phrase: string) => {
      setLastPhrase(phrase);
      await speakWithSettings(phrase, settings);
    },
    [settings],
  );

  const speakButton = useCallback(
    async (button: CommunicationButton) => {
      setLastButtonId(button.id);
      haptic();
      buttonsRepo.recordTap(button.id).catch(() => {});
      await speakPhrase(button.phrase);
    },
    [haptic, speakPhrase],
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
    await stopSpeaking();
  }, []);

  return { lastPhrase, lastButtonId, speechAvailable, speakButton, speakPhrase, repeat, clear };
}
