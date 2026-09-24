import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * Optional on-device speech-to-text.
 *
 * The native module is looked up with `requireOptionalNativeModule`, which returns null when it
 * is not in the build (Expo Go), instead of throwing — the `expo-speech-recognition` JS entry
 * point is deliberately never imported, because it throws at import time when the native side
 * is missing. Without it, `isSpeechRecognitionAvailable()` is false and the UI falls back to the
 * parent-assisted oral answer.
 *
 * Recognition is requested with `requiresOnDeviceRecognition` where supported, so audio is
 * processed on the phone and never stored — only the transcript text reaches the app, and only
 * the final answer text is saved.
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

export function isSpeechRecognitionAvailable(): boolean {
  return load() !== null;
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
      requiresOnDeviceRecognition: !!n.supportsOnDeviceRecognition?.(),
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
