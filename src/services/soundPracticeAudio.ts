import { createAudioPlayer } from 'expo-audio';
import { prepareAudioSession, speakWithSettings } from './speech';
import type { PracticeLevel, SoundExercise } from '@/soundpractice/types';
import type { AppSettings } from '@/types/models';

/**
 * Sound Practice audio — the one place a model pronunciation is produced.
 *
 * This is a thin layer over the app's existing audio/TTS service (`services/speech.ts`); it does
 * not start a second audio system. It exists so the *source* of the model can change without
 * touching any screen.
 *
 * Why it is not simply text-to-speech: an engine given "B" says the letter name ("bee"), and
 * given "M" says "em" — neither is the sound a child is practising. So an isolated sound is
 * spoken from its cue ("buh", "mmm") and anchored with an example word. That is the best a
 * general-purpose engine can do, and it is deliberately a fallback:
 *
 *   drop a recorded file into MODEL_AUDIO and that sound plays the recording instead,
 *   with no screen changes at all.
 *
 * Recorded clips are the right long-term answer for isolated phonemes. The architecture is
 * ready for them; the files themselves need a speech-language pathologist, not a developer.
 */

/**
 * Recorded model pronunciations, keyed by `SoundExercise.id`.
 *
 * Empty for now — every sound falls back to the spoken cue. To add one:
 *   1. put the clip in `assets/sounds/` (m4a or mp3, one clear repetition),
 *   2. add `b: require('../../assets/sounds/b.m4a'),`
 * Nothing else changes. Bundled assets ship inside the app, so this stays offline.
 */
const MODEL_AUDIO: Record<string, number> = {};

export type ModelSource = 'recording' | 'speech' | 'unavailable';

/** Whether this sound has a recorded model, i.e. is not relying on text-to-speech. */
export function hasRecordedModel(soundId: string): boolean {
  return MODEL_AUDIO[soundId] !== undefined;
}

/** Plays a bundled or on-device audio file and releases the player when it finishes. */
async function playAudio(source: number | string): Promise<boolean> {
  try {
    await prepareAudioSession();
    const player = createAudioPlayer(source);
    player.play();
    // Release once the clip has had time to finish; these are all short.
    setTimeout(() => {
      try {
        player.remove();
      } catch {
        // already released
      }
    }, 8000);
    return true;
  } catch {
    return false;
  }
}

/** What text-to-speech should say for one practice item. */
function speechFor(exercise: SoundExercise, level: PracticeLevel, item: string): string {
  // An isolated letter needs the cue; a syllable, word or phrase is already pronounceable.
  if (level === 'sound') return `${exercise.cue}. ${exercise.cue}. Like ${exercise.exampleWord}.`;
  return item;
}

export const soundPracticeAudio = {
  hasRecordedModel,

  /**
   * Plays the model pronunciation. Returns which source was used so the screen can tell a
   * grown-up when it is hearing a synthesised approximation rather than a recording.
   * Never throws — if audio is unavailable the child still sees the letter.
   */
  async playModel(
    exercise: SoundExercise,
    level: PracticeLevel,
    item: string,
    settings: AppSettings,
  ): Promise<ModelSource> {
    const recorded = level === 'sound' ? MODEL_AUDIO[exercise.id] : undefined;
    if (recorded !== undefined && (await playAudio(recorded))) return 'recording';
    try {
      await speakWithSettings(speechFor(exercise, level, item), settings);
      return 'speech';
    } catch {
      return 'unavailable';
    }
  },

  /** Plays back what the child just recorded, from its temporary file. */
  async playAttempt(uri: string): Promise<boolean> {
    return playAudio(uri);
  },
};
