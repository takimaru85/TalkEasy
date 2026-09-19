import * as Speech from 'expo-speech';
import { setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import type { AppSettings } from '@/types/models';

/**
 * Thin wrapper around expo-speech.
 *
 * Text-to-speech uses the device's built-in engine and works offline. Every call is guarded:
 * if the engine is missing or errors, the app keeps working — the phrase is still shown in
 * large text — and `speechStatus` records what happened so Parent Settings can explain.
 *
 * iOS note: by default an app's speech is muted by the ring/silent switch. We configure the
 * audio session with `playsInSilentMode` so the child is heard even when the switch is on.
 */
export interface SpeechStatus {
  available: boolean;
  lastError: string | null;
  /** How many utterances actually finished playing (onDone fired). */
  completed: number;
  /** How many were requested. If this grows but `completed` stays 0, audio is not reaching the speaker. */
  requested: number;
  audioSessionReady: boolean;
}

export const speechStatus: SpeechStatus = {
  available: true,
  lastError: null,
  completed: 0,
  requested: 0,
  audioSessionReady: false,
};

type StatusListener = (status: SpeechStatus) => void;
const statusListeners = new Set<StatusListener>();

export function onSpeechStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function emit(): void {
  statusListeners.forEach((l) => l({ ...speechStatus }));
}

function setError(message: string): void {
  speechStatus.available = false;
  speechStatus.lastError = message;
  if (__DEV__) console.warn('[speech]', message);
  emit();
}

let audioSessionPromise: Promise<void> | null = null;

/**
 * Configures the audio session once. Safe to call repeatedly; runs at app start and again
 * lazily before the first utterance in case startup configuration failed.
 */
export function prepareAudioSession(): Promise<void> {
  if (!audioSessionPromise) {
    audioSessionPromise = setAudioModeAsync({
      playsInSilentMode: true, // iOS: speak even when the ring/silent switch is on
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: 'duckOthers', // lower music/video while a phrase is spoken
    })
      .then(() => {
        speechStatus.audioSessionReady = true;
        emit();
      })
      .catch((err: unknown) => {
        audioSessionPromise = null; // retry next time
        if (__DEV__) console.warn('[speech] audio session', err);
      });
  }
  return audioSessionPromise;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: string | null;
}

/**
 * Speaks `text`, stopping anything currently being spoken first so taps never queue up.
 * Resolves immediately; errors are reported via speechStatus, never thrown to the UI.
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  try {
    await prepareAudioSession();
    await Speech.stop();
    speechStatus.requested += 1;
    Speech.speak(trimmed, {
      rate: clamp(options.rate ?? 1, 0.5, 1.5),
      pitch: clamp(options.pitch ?? 1, 0.5, 2),
      volume: 1,
      voice: options.voice ?? undefined,
      // Only pass a language when no explicit voice is chosen; some Android engines
      // refuse to speak if they have no voice for the requested language.
      language: options.voice ? undefined : Platform.select({ ios: 'en-US', default: undefined }),
      onStart: () => {
        if (!speechStatus.available) {
          speechStatus.available = true;
          speechStatus.lastError = null;
          emit();
        }
      },
      onDone: () => {
        speechStatus.completed += 1;
        emit();
      },
      onError: (err: Error) => setError(err?.message ?? 'Speech error'),
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Speech unavailable');
  }
}

export function speakWithSettings(text: string, settings: AppSettings): Promise<void> {
  return speak(text, {
    rate: settings.speechRate,
    pitch: settings.speechPitch,
    voice: settings.speechVoice,
  });
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // ignore — nothing to stop or engine unavailable
  }
}

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
}

/**
 * Lists installed voices. Returns [] when the engine cannot be queried
 * (on some Android devices the list is empty until the TTS engine has warmed up).
 */
export async function listVoices(): Promise<VoiceOption[]> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices
      .map((v) => ({ identifier: v.identifier, name: v.name, language: v.language }))
      .sort((a, b) => a.language.localeCompare(b.language) || a.name.localeCompare(b.name));
  } catch (err) {
    if (__DEV__) console.warn('[speech] getAvailableVoicesAsync', err);
    return [];
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
