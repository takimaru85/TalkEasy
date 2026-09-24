import * as Speech from 'expo-speech';
import { setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { DEFAULT_LOCALE_CODE, getLocale } from '@/i18n/registry';
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

/**
 * Android reports a stopped or interrupted utterance through onError, very often with no
 * message at all. Cancelling is something this app does on purpose every time a new phrase
 * starts, so those must not be treated as engine failures.
 */
function isCancellation(message: string): boolean {
  const m = message.trim().toLowerCase();
  return m === '' || m.includes('interrupt') || m.includes('cancel') || m.includes('stopped');
}

/**
 * Records a real speech failure. Deliberately logs rather than warns: console.warn raises a
 * LogBox overlay, which in this app lands on top of the child's buttons. Failures are
 * reported properly through `speechStatus` - Parent Settings shows the message, the
 * requested/completed counts and a platform checklist.
 */
function setError(message: string): void {
  speechStatus.available = false;
  speechStatus.lastError = message;
  if (__DEV__) console.log('[speech]', message);
  emit();
}

/**
 * Counts utterances so a phrase can tell whether it is still the current one. Starting a new
 * phrase (or stopping on purpose) cancels whatever is speaking, and Android reports that
 * cancellation as an error - callbacks from a superseded utterance must be ignored.
 */
let utteranceSeq = 0;

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
        if (__DEV__) console.log('[speech] audio session', err);
      });
  }
  return audioSessionPromise;
}

/**
 * Switches the shared audio session in and out of recording mode.
 *
 * Sound Practice is the only caller: both platforms need `allowsRecording` while the
 * microphone is open, and the app's normal playback mode restored afterwards so that
 * speaking a phrase keeps working everywhere else. Never throws.
 */
export async function setRecordingMode(enabled: boolean): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: enabled,
      interruptionMode: 'duckOthers',
    });
  } catch (err) {
    if (__DEV__) console.log('[speech] recording mode', err);
  }
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: string | null;
  /** BCP-47 tag for the engine, e.g. 'fil-PH'. Ignored when an explicit voice is chosen. */
  language?: string | null;
}

/**
 * Speaks `text`, stopping anything currently being spoken first so taps never queue up.
 * Resolves immediately; errors are reported via speechStatus, never thrown to the UI.
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  // This call supersedes anything already speaking.
  const seq = ++utteranceSeq;
  try {
    await prepareAudioSession();
    await Speech.stop();
    if (seq !== utteranceSeq) return; // a newer phrase was requested while we awaited
    speechStatus.requested += 1;
    Speech.speak(trimmed, {
      rate: clamp(options.rate ?? 1, 0.5, 1.5),
      pitch: clamp(options.pitch ?? 1, 0.5, 2),
      volume: 1,
      voice: options.voice ?? undefined,
      // Only pass a language when no explicit voice is chosen; some Android engines
      // refuse to speak if they have no voice for the requested language.
      language: options.voice ? undefined : options.language ?? Platform.select({ ios: 'en-US', default: undefined }),
      onStart: () => {
        if (seq !== utteranceSeq) return;
        if (!speechStatus.available) {
          speechStatus.available = true;
          speechStatus.lastError = null;
          emit();
        }
      },
      onDone: () => {
        if (seq !== utteranceSeq) return;
        speechStatus.completed += 1;
        emit();
      },
      // Tapping another card, or a screen speaking its next prompt, stops the previous
      // phrase on purpose. Android surfaces that through onError, so a superseded or
      // cancelled utterance must never mark speech unavailable.
      onError: (err: Error) => {
        const message = err?.message ?? '';
        if (seq !== utteranceSeq || isCancellation(message)) return;
        setError(message.trim());
      },
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Speech unavailable');
  }
}

export function speakWithSettings(text: string, settings: AppSettings): Promise<void> {
  const locale = getLocale(settings.language);
  return speak(text, {
    rate: settings.speechRate,
    pitch: settings.speechPitch,
    voice: settings.speechVoice,
    // US English keeps the previous behaviour exactly (no tag on Android, where an engine can
    // refuse a language it has no voice for). A parent who picks another language has opted in,
    // so its tag is passed through and the engine speaks it properly.
    language: settings.language === DEFAULT_LOCALE_CODE ? undefined : locale.speechTag,
  });
}

export async function stopSpeaking(): Promise<void> {
  utteranceSeq += 1; // stopping on purpose - ignore the cancelled utterance's callbacks
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
    if (__DEV__) console.log('[speech] getAvailableVoicesAsync', err);
    return [];
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
