import { Directory, File, Paths } from 'expo-file-system';
import { BUNDLED_MODEL_AUDIO } from '@/speechpractice/modelAudio';
import { parseModelKey, type PronunciationSet } from '@/speechpractice/pronunciation';

/**
 * Model recordings made ON the device by a parent or therapist (Parent Mode → Model recordings).
 *
 * These are an adult's deliberate model pronunciations, kept in the app's private storage so the
 * same model plays every time, offline. They are NOT the child's practice attempts: those stay
 * temporary and are deleted after playback (useSoundRecorder). Nothing here leaves the device.
 *
 * Path: <documents>/talkeasy/model-audio/<set>/<kind>/<id>.m4a — deterministic, so no database
 * row is needed; the file existing IS the record.
 */
const ROOT = ['talkeasy', 'model-audio'];

function dirFor(set: PronunciationSet, kind: string): Directory {
  const dir = new Directory(Paths.document, ...ROOT, set, kind);
  if (!dir.exists) dir.create({ idempotent: true, intermediates: true });
  return dir;
}

function fileFor(set: PronunciationSet, key: string): File | null {
  const parsed = parseModelKey(key);
  if (!parsed) return null;
  return new File(dirFor(set, parsed.kind), `${parsed.id}.m4a`);
}

export type ModelSourceKind = 'bundled' | 'recorded' | 'none';

export const modelRecordings = {
  /** A parent recording's URI, or null. */
  recordedUri(set: PronunciationSet, key: string): string | null {
    try {
      const f = fileFor(set, key);
      return f?.exists ? f.uri : null;
    } catch {
      return null;
    }
  },

  /** Where this item's model comes from: a bundled file wins over a parent recording. */
  source(set: PronunciationSet, key: string): ModelSourceKind {
    if (BUNDLED_MODEL_AUDIO[set][key] !== undefined) return 'bundled';
    return this.recordedUri(set, key) ? 'recorded' : 'none';
  },

  /** The playable model (bundled asset id or file URI), or null when there is none. */
  resolve(set: PronunciationSet, key: string): number | string | null {
    return BUNDLED_MODEL_AUDIO[set][key] ?? this.recordedUri(set, key);
  },

  /** Keeps a just-recorded clip as the model for `key`. Returns false if it could not be saved. */
  async save(set: PronunciationSet, key: string, fromUri: string): Promise<boolean> {
    try {
      const target = fileFor(set, key);
      if (!target) return false;
      await new File(fromUri).copy(target, { overwrite: true });
      return target.exists;
    } catch {
      return false;
    }
  },

  remove(set: PronunciationSet, key: string): void {
    try {
      const f = fileFor(set, key);
      if (f?.exists) f.delete();
    } catch {
      // nothing to remove
    }
  },
};
