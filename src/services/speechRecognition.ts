/**
 * Optional on-device speech-to-text.
 *
 * Uses `expo-speech-recognition` when its native module is present (development / EAS builds).
 * In Expo Go the module is missing, so `isAvailable()` returns false and the UI offers the
 * parent-assisted oral answer instead. Recognition is requested with
 * `requiresOnDeviceRecognition` so audio is processed on the phone and never stored — only
 * the transcript text reaches the app, and only the final answer text is saved.
 */
type Listener = (event: { transcript: string; isFinal: boolean }) => void;
type ErrorListener = (message: string) => void;

interface Native {
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  abort: () => void;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  isRecognitionAvailable: () => boolean;
  supportsOnDeviceRecognition: () => boolean;
  addListener: (event: string, fn: (payload: unknown) => void) => { remove: () => void };
}

let native: Native | null | undefined;

function load(): Native | null {
  if (native !== undefined) return native;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-speech-recognition') as { ExpoSpeechRecognitionModule?: Native };
    native = mod.ExpoSpeechRecognitionModule ?? null;
    if (native && !native.isRecognitionAvailable()) native = null;
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
 * Starts listening. Resolves to a stop function. `onResult` receives partial transcripts
 * (isFinal=false) and then the final one. The session ends by itself after the child stops
 * speaking; call the returned function to end it early.
 */
export function startListening(lang: string, onResult: Listener, onError: ErrorListener, onEnd: () => void): () => void {
  const n = load();
  if (!n) {
    onError('Speech recognition is not available in this build.');
    return () => {};
  }
  const subs = [
    n.addListener('result', (payload) => {
      const ev = payload as { isFinal: boolean; results: { transcript: string }[] };
      const transcript = ev.results?.[0]?.transcript ?? '';
      onResult({ transcript, isFinal: !!ev.isFinal });
    }),
    n.addListener('error', (payload) => {
      const ev = payload as { error?: string; message?: string };
      onError(ev.message || ev.error || 'Could not hear you.');
    }),
    n.addListener('end', () => onEnd()),
  ];
  try {
    n.start({
      lang,
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: n.supportsOnDeviceRecognition(),
      addsPunctuation: false,
    });
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Could not start listening.');
  }
  return () => {
    try {
      n.stop();
    } catch {
      // ignore
    }
    subs.forEach((s) => s.remove());
  };
}
