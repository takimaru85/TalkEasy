import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

/**
 * Optional on-device speech-to-text.
 *
 * The native module is looked up with `requireOptionalNativeModule`, which returns null when it
 * is not in the build (Expo Go), instead of throwing — the `expo-speech-recognition` JS entry
 * point is deliberately never imported, because it throws at import time when the native side
 * is missing. Without it, `isSpeechRecognitionAvailable()` is false and the UI falls back to the
 * parent-assisted oral answer.
 *
 * ON-DEVICE ONLY, AND ENFORCED HERE. Recognition is offered only where on-device recognition can be
 * guaranteed, and is always started with `requiresOnDeviceRecognition: true`. It never falls back to the
 * network. The library itself CANNOT be trusted to refuse: on iOS it sets the on-device flag only if the
 * recogniser for the requested language supports it and otherwise silently goes online, and its
 * `supportsOnDeviceRecognition()` checks the phone's own region language, not the requested one; on
 * Android older than 13 it ignores the flag and uses the networked recogniser. So the guard below
 * refuses to start unless it is sure:
 *  - Android: API 33+ AND the on-device recogniser is installed.
 *  - iOS: the on-device check passes AND the requested language is the phone's own language, because that
 *    is the recogniser the check actually asked.
 * Otherwise `isSpeechRecognitionAvailable(lang)` is false and the UI offers the grown-up-confirmed
 * answer instead. TalkEasy itself never stores or sends the audio — only the transcript text reaches the
 * app, and only the final answer text is saved.
 */
interface SpeechNativeModule {
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  abort: () => void;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  isRecognitionAvailable: () => boolean;
  supportsOnDeviceRecognition: () => boolean;
  addListener: (event: string, fn: (payload: never) => void) => { remove: () => void };
}

type Listener = (event: { transcript: string; isFinal: boolean }) => void;
type ErrorListener = (message: string) => void;

let native: SpeechNativeModule | null | undefined;

function load(): SpeechNativeModule | null {
  if (native !== undefined) return native;
  try {
    const mod = requireOptionalNativeModule<SpeechNativeModule>('ExpoSpeechRecognition');
    native = mod && typeof mod.start === 'function' && mod.isRecognitionAvailable?.() ? mod : null;
  } catch {
    native = null;
  }
  return native;
}

/** The phone's own language tag ("en-US"), or '' when it cannot be read. */
function deviceLanguageTag(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? '';
  } catch {
    return '';
  }
}

const sameTag = (a: string, b: string) => !!a && !!b && a.replace(/_/g, '-').toLowerCase() === b.replace(/_/g, '-').toLowerCase();

/**
 * Whether recognition for `lang` is guaranteed to run on the phone. False means "do not start it":
 * see the file comment for why this is stricter than asking the library.
 */
function onDeviceGuaranteed(n: SpeechNativeModule, lang: string): boolean {
  try {
    if (!n.supportsOnDeviceRecognition?.()) return false;
    if (Platform.OS === 'android') return typeof Platform.Version === 'number' && Platform.Version >= 33;
    if (Platform.OS === 'ios') return sameTag(lang, deviceLanguageTag());
    return false;
  } catch {
    return false;
  }
}

/** Whether speech-to-text can be offered for `lang` (default: the phone's own language) with on-device processing guaranteed. */
export function isSpeechRecognitionAvailable(lang?: string): boolean {
  const n = load();
  if (!n) return false;
  return onDeviceGuaranteed(n, lang ?? deviceLanguageTag());
}

export async function requestSpeechPermission(): Promise<boolean> {
  const n = load();
  if (!n) return false;
  try {
    const res = await n.requestPermissionsAsync();
    return !!res.granted;
  } catch {
    return false;
  }
}

/**
 * Starts listening. Returns a function that stops the session early; it ends by itself once the
 * child stops speaking. `onResult` receives partial transcripts and then the final one.
 */
export function startListening(lang: string, onResult: Listener, onError: ErrorListener, onEnd: () => void): () => void {
  const n = load();
  if (!n) {
    onError('Speech recognition is not available in this build.');
    return () => {};
  }
  if (!onDeviceGuaranteed(n, lang)) {
    onError('Offline speech recognition is not supported on this device.');
    return () => {};
  }
  const subs: { remove: () => void }[] = [];
  try {
    subs.push(
      n.addListener('result', (payload) => {
        const ev = payload as unknown as { isFinal: boolean; results?: { transcript: string }[] };
        onResult({ transcript: ev.results?.[0]?.transcript ?? '', isFinal: !!ev.isFinal });
      }),
      n.addListener('error', (payload) => {
        const ev = payload as unknown as { error?: string; message?: string };
        onError(ev.message || ev.error || 'Could not hear you.');
      }),
      n.addListener('end', () => onEnd()),
    );
    n.start({
      lang,
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: true,
      addsPunctuation: false,
    });
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Could not start listening.');
  }
  return () => {
    try {
      n.stop();
    } catch {
      // already stopped
    }
    subs.forEach((s) => s.remove());
  };
}
