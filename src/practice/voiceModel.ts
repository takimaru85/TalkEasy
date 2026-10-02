import { speakSegments } from '@/services/speech';
import { soundPracticeAudio } from '@/services/soundPracticeAudio';
import { getSoundExercise } from '@/soundpractice/content';
import type { AppSettings } from '@/types/models';
import { segmentsFor } from './voiceShape';
import type { VoiceLine } from './types';

/**
 * Playing a voice model on the device.
 *
 * The SHAPES live in voiceShape.ts; this file is only the part that talks to the speech engine and
 * to recorded audio. See that file for why a contour has to be built out of segments at all.
 *
 * A recorded model always wins: synthesis is an approximation of a pattern, and a real voice is
 * not. Nothing here analyses the child — there is no stored "correct" contour to compare against.
 */
export { segmentsFor } from './voiceShape';

export type ModelResult = 'recording' | 'speech' | 'unavailable';

/**
 * Plays a line's model: a real recording if the content has one, otherwise the shaped synthesis.
 * Never throws — a model that will not play must not stop a child practising.
 */
export async function playLine(line: VoiceLine, settings: AppSettings): Promise<ModelResult> {
  if (line.audio !== undefined) {
    const played = await soundPracticeAudio.playFile(line.audio).catch(() => false);
    if (played) return 'recording';
  }
  // An isolated sound is a phoneme: its recording, never the letter or a respelling through a voice.
  const sound = line.soundId ? getSoundExercise(line.soundId) : undefined;
  if (sound) {
    const source = await soundPracticeAudio.playPhoneme(sound, settings);
    return source === 'recording' ? 'recording' : source === 'unavailable' ? 'unavailable' : 'speech';
  }
  const segments = segmentsFor(line);
  if (segments.length === 0) return 'unavailable';
  try {
    await speakSegments(segments, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voice: settings.speechVoice,
    });
    return 'speech';
  } catch {
    return 'unavailable';
  }
}

/** Plays several lines in turn, with a clear gap so a comparison is hearable as two things. */
export async function playLines(lines: VoiceLine[], settings: AppSettings): Promise<ModelResult> {
  let result: ModelResult = 'unavailable';
  for (const [i, line] of lines.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 650));
    result = await playLine(line, settings);
  }
  return result;
}
