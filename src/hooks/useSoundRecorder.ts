import { useCallback, useEffect, useRef, useState } from 'react';
import { File } from 'expo-file-system';
import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from 'expo-audio';
import { setRecordingMode } from '@/services/speech';
import { soundPracticeAudio } from '@/services/soundPracticeAudio';

/**
 * Microphone recording for Sound Practice.
 *
 * PRIVACY — the rule this hook exists to enforce: the child's voice is written to the OS cache
 * directory, played back to them, and deleted. It is never copied into app storage, never
 * written to the database, never transcribed and never leaves the device. `discard()` runs on
 * every new attempt and on unmount, so at most one temporary clip exists at a time.
 *
 * Everything degrades instead of throwing: if the microphone is missing, permission is refused
 * or recording fails, `phase` says so and the screen keeps working — the child can still listen
 * to the model and practise out loud, which is most of the value.
 */
export type RecorderPhase =
  /** Microphone not available on this device/build (e.g. Expo Go without the module). */
  | 'unsupported'
  /** Never asked yet — the screen should explain before requesting. */
  | 'needsPermission'
  /** The grown-up said no, or the OS refused. */
  | 'denied'
  /** Ready to record. */
  | 'idle'
  | 'recording'
  /** A clip is waiting to be played back. */
  | 'recorded'
  | 'error';

export interface SoundRecorder {
  phase: RecorderPhase;
  /** Length of the last attempt, in ms. */
  durationMs: number;
  /** Non-fatal explanation for 'denied' / 'error', for a grown-up. */
  message: string;
  /** True once a permission request has been made in this session. */
  canRecord: boolean;
  requestPermission: () => Promise<boolean>;
  start: () => Promise<void>;
  /** Stops and returns the length of the attempt in ms (0 if nothing was captured). */
  stop: () => Promise<number>;
  playBack: () => Promise<void>;
  /** Deletes the temporary clip and returns to 'idle'. */
  discard: () => void;
}

export function useSoundRecorder(): SoundRecorder {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [phase, setPhase] = useState<RecorderPhase>('needsPermission');
  const [durationMs, setDurationMs] = useState(0);
  const [message, setMessage] = useState('');
  const uriRef = useRef<string | null>(null);
  const startedAt = useRef(0);
  const mounted = useRef(true);

  /** Removes the temporary clip. Safe to call repeatedly. */
  const deleteClip = useCallback(() => {
    const uri = uriRef.current;
    uriRef.current = null;
    if (!uri) return;
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // The OS clears its own cache; a failure here is not worth interrupting a child for.
    }
  }, []);

  // Decide the starting phase without prompting: asking for the microphone out of nowhere is
  // exactly what the permission explainer is there to avoid.
  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const current = await getRecordingPermissionsAsync();
        if (!mounted.current) return;
        setPhase(current.granted ? 'idle' : current.canAskAgain ? 'needsPermission' : 'denied');
      } catch {
        if (mounted.current) setPhase('unsupported');
      }
    })();
    return () => {
      mounted.current = false;
      deleteClip();
      setRecordingMode(false);
    };
  }, [deleteClip]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const res = await requestRecordingPermissionsAsync();
      if (!mounted.current) return res.granted;
      if (res.granted) {
        setPhase('idle');
        setMessage('');
        return true;
      }
      setPhase('denied');
      setMessage('The microphone is turned off for TalkEasy. A grown-up can turn it on in the phone settings.');
      return false;
    } catch {
      if (mounted.current) {
        setPhase('unsupported');
        setMessage('This device or this build has no microphone available.');
      }
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    deleteClip();
    try {
      await setRecordingMode(true);
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      if (mounted.current) {
        setDurationMs(0);
        setPhase('recording');
        setMessage('');
      }
    } catch {
      await setRecordingMode(false);
      if (mounted.current) {
        setPhase('error');
        setMessage('The microphone could not start. You can still say the sound out loud.');
      }
    }
  }, [recorder, deleteClip]);

  const stop = useCallback(async (): Promise<number> => {
    const elapsed = startedAt.current > 0 ? Date.now() - startedAt.current : 0;
    try {
      await recorder.stop();
      uriRef.current = recorder.uri ?? null;
      if (mounted.current) {
        setDurationMs(elapsed);
        setPhase(uriRef.current ? 'recorded' : 'idle');
      }
      return elapsed;
    } catch {
      if (mounted.current) {
        setPhase('error');
        setMessage('That attempt was not saved. Tap to try again.');
      }
      return 0;
    } finally {
      // Back to normal playback so speaking a phrase keeps working everywhere else.
      await setRecordingMode(false);
    }
  }, [recorder]);

  const playBack = useCallback(async () => {
    if (uriRef.current) await soundPracticeAudio.playAttempt(uriRef.current);
  }, []);

  const discard = useCallback(() => {
    deleteClip();
    if (mounted.current) setPhase((p) => (p === 'recorded' ? 'idle' : p));
  }, [deleteClip]);

  return {
    phase,
    durationMs,
    message,
    canRecord: phase === 'idle' || phase === 'recording' || phase === 'recorded',
    requestPermission,
    start,
    stop,
    playBack,
    discard,
  };
}
