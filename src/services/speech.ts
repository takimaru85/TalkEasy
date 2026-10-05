import * as Speech from 'expo-speech';
import { setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { DEFAULT_LOCALE_CODE, getLocale } from '@/i18n/registry';
import type { AppSettings } from '@/types/models';
import { contentLanguage } from './contentLanguage';
import { forEnglishVoice, isEnglishVoice } from './pronunciationLexicon';
import { bestEnglishVoice, voiceFor } from './voiceCatalog';

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
 * Makes sure the shared audio session is ACTIVE before anything is played.
 *
 * iOS: when an expo-audio clip finishes (or is paused) the module deactivates the app's audio
 * session. Text-to-speech uses the same session, so after one recorded clip every phrase went
 * silent — Talk included. Re-activating before each utterance and each clip makes sound recover
 * on the very next tap, whatever deactivated it. Cheap, idempotent, never throws.
 */
export async function ensureAudioActive(): Promise<void> {
  await prepareAudioSession();
  if (Platform.OS !== 'ios') return;
  try {
    await setIsAudioActiveAsync(true);
  } catch (err) {
    if (__DEV__) console.log('[speech] activate session', err);
  }
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
  // Back from recording: playback must be live again straight away (see ensureAudioActive).
  if (!enabled) await ensureAudioActive();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  /** 0..1. Only Voice & Communication's loud / soft models use anything but 1. */
  volume?: number;
  voice?: string | null;
  /** BCP-47 tag for the engine, e.g. 'en-GB'. Ignored when an explicit voice is chosen. */
  language?: string | null;
  /**
   * Text already respelled for the chosen voice; skips the lexicon pass.
   *
   * Set by `speakText`, which knows both the content language and which voice the device actually
   * found, and so can pick the right lexicon. Every other caller leaves it unset and keeps the
   * previous behaviour exactly.
   */
  spoken?: string;
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
    await ensureAudioActive();
    await Speech.stop();
    if (seq !== utteranceSeq) return; // a newer phrase was requested while we awaited
    speechStatus.requested += 1;
    let language = options.voice ? undefined : options.language ?? Platform.select({ ios: 'en-US', default: undefined });
    // No voice chosen by the parent: use the most natural installed offline English voice, named
    // explicitly (see voicePick.ts). Null keeps the engine default exactly as before.
    let voice = options.voice ?? undefined;
    if (!voice && language && language.toLowerCase().startsWith('en')) {
      const best = await bestEnglishVoice(language).catch(() => null);
      if (seq !== utteranceSeq) return;
      if (best) {
        voice = best;
        language = undefined;
      }
    }
    // An English voice reads other-language words with English rules; the lexicon gives it a
    // pronunciation-safe spelling for the ones listed there (see pronunciationLexicon.ts).
    const englishVoice = options.voice ? !/(^|[^a-z])(es|fr|de|it)([-_]|$)/i.test(options.voice) : isEnglishVoice(language);
    Speech.speak(options.spoken ?? (englishVoice ? forEnglishVoice(trimmed) : trimmed), {
      rate: clamp(options.rate ?? 1, 0.5, 1.5),
      pitch: clamp(options.pitch ?? 1, 0.5, 2),
      volume: clamp(options.volume ?? 1, 0.1, 1),
      voice,
      // Only pass a language when no explicit voice is chosen; some Android engines
      // refuse to speak if they have no voice for the requested language.
      language,
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

/** One piece of an utterance, spoken with its own voice settings. */
export interface SpeakSegment {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Silence after this segment, in ms. How a phrase gets its rhythm. */
  gapMs?: number;
}

/**
 * Speaks segments one after another, each with its own pitch, rate and loudness, and RESOLVES
 * WHEN THE LAST ONE FINISHES.
 *
 * Why this exists: `speak` resolves immediately and every call cancels the one before it, which
 * is right for tapping Talk cards and wrong for building a shape out of a sentence. Voice &
 * Communication needs to say "you are going" level and then "home" a third higher, because that
 * is the only way an off-the-shelf engine can demonstrate a rising or falling ending at all —
 * expo-speech has no pitch contour, only a pitch per utterance.
 *
 * That makes these models an APPROXIMATION of the pattern, and they are only ever the model. The
 * app still never analyses the child's voice, so there is nothing here to compare an attempt
 * against; a real recording, when one exists, is always preferred over this.
 *
 * Cancellation is not an error: starting another model mid-sequence stops this one, and the
 * promise simply resolves.
 */
export async function speakSegments(segments: SpeakSegment[], options: SpeakOptions = {}): Promise<void> {
  const seq = ++utteranceSeq;
  try {
    await ensureAudioActive();
    await Speech.stop();
  } catch {
    // A failure to stop is not a reason to stay silent.
  }

  for (const segment of segments) {
    if (seq !== utteranceSeq) return; // superseded
    const text = segment.text.trim();
    if (!text) continue;
    const language = options.voice ? undefined : options.language ?? Platform.select({ ios: 'en-US', default: undefined });
    const englishVoice = options.voice ? !/(^|[^a-z])(es|fr|de|it)([-_]|$)/i.test(options.voice) : isEnglishVoice(language);

    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      try {
        speechStatus.requested += 1;
        Speech.speak(englishVoice ? forEnglishVoice(text) : text, {
          rate: clamp((options.rate ?? 1) * (segment.rate ?? 1), 0.5, 1.5),
          pitch: clamp((options.pitch ?? 1) * (segment.pitch ?? 1), 0.5, 2),
          volume: clamp(segment.volume ?? options.volume ?? 1, 0.1, 1),
          voice: options.voice ?? undefined,
          language,
          onStart: () => {
            if (speechStatus.available) return;
            speechStatus.available = true;
            speechStatus.lastError = null;
            emit();
          },
          onDone: () => {
            speechStatus.completed += 1;
            emit();
            done();
          },
          onStopped: done,
          onError: (err: Error) => {
            const message = err?.message ?? '';
            if (seq === utteranceSeq && !isCancellation(message)) setError(message.trim());
            done();
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Speech unavailable');
        done();
      }
    });

    if (segment.gapMs && seq === utteranceSeq) {
      await new Promise((r) => setTimeout(r, segment.gapMs));
    }
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

/**
 * THE ONE WAY TO SPEAK CONTENT, in the language that content is written in.
 *
 * Every screen that reads a lesson, a word or a question aloud goes through here, passing the
 * language the content carries. A lesson in another language is read by a voice for it; an English
 * one is unchanged. Nothing guesses from the text itself.
 *
 * What it does, in order:
 *   1. English (or no language): hands straight to `speak`, so existing screens behave identically.
 *   2. Otherwise asks the DEVICE which voice it really has for that language (voiceCatalog).
 *   3. A real voice exists -> name it explicitly and speak the text exactly as written, because a
 *      voice for the language reads its spelling correctly and respelling it would make it worse.
 *   4. No such voice -> keep the app's own voice and give it a pronunciation-safe respelling
 *      (pronunciationLexicon). This is a fallback and is never presented as the real thing; the
 *      `[voices]` line in development says plainly which of the two happened.
 *
 * The display text is never changed — only what the engine is handed.
 */
export async function speakText(text: string, language: string | null | undefined, options: SpeakOptions = {}): Promise<void> {
  const lang = contentLanguage(language);
  if (!lang) return speak(text, options); // English content: unchanged, including the caller's voice

  const trimmed = text.trim();
  if (!trimmed) return;
  const choice = await voiceFor(lang.tag);

  if (choice.matched) {
    return speak(trimmed, { ...options, voice: choice.voice, language: choice.language, spoken: trimmed });
  }
  // No voice for this language on this device. The app's configured voice reads a respelling,
  // which at least makes the word recognisable to a child who knows it.
  return speak(trimmed, { ...options, spoken: forEnglishVoice(trimmed) });
}

/**
 * `speakText` with the parent's rate, pitch and voice from Settings.
 *
 * The content language wins over the app language: the app is English-only, and a lesson written
 * in another language is read in it whatever the interface is set to.
 */
export function speakContent(text: string, language: string | null | undefined, settings: AppSettings): Promise<void> {
  const locale = getLocale(settings.language);
  return speakText(text, language, {
    rate: settings.speechRate,
    pitch: settings.speechPitch,
    voice: settings.speechVoice,
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
