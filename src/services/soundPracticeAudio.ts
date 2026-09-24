import { createAudioPlayer } from 'expo-audio';
import { ensureAudioActive, speak, speakWithSettings } from './speech';
import { modelRecordings } from './modelRecordings';
import { getSoundExercise } from '@/soundpractice/content';
import type { PracticeLevel, SoundExercise } from '@/soundpractice/types';
import { SPOKEN_OVERRIDES, syllablePronunciation, type SpokenForm } from '@/speechpractice/pronunciationDictionary';
import { modelKey, overrideKey, parseModelKey, parseOverrides } from '@/speechpractice/pronunciation';
import type { SpeechItem } from '@/speechpractice/types';
import type { AppSettings } from '@/types/models';
import { getLocale } from '@/i18n/registry';

/**
 * Sound / Speech Practice audio — the one place a model pronunciation is produced.
 *
 * A thin layer over the app's existing TTS service (`services/speech.ts`, expo-speech) and
 * expo-audio; it does not start a second audio system, and it exists so the SOURCE of a model can
 * change without touching any screen.
 *
 * The rule that shapes it: a voice engine given a raw practice target decides for itself how to
 * read it — "B" becomes the letter name "bee", "BO" may become "baw". So what the engine is given
 * is never the raw target:
 *   - syllables → the pronunciation dictionary's spoken form (speechpractice/pronunciationDictionary.ts),
 *     in its own locale, e.g. "BO" → "beau" (en-US); a grown-up's per-device choice overrides it;
 *   - isolated sounds → the sound's cue ("buh", "mmm");
 *   - words and phrases → their own text (real language), unless SPOKEN_OVERRIDES says otherwise.
 * A recording of the model (bundled or a parent's) always wins over any of these.
 */

/**
 * Recorded model pronunciations for Sound Practice, keyed by `SoundExercise.id`. Empty for now.
 * (The general registry for every practice unit is speechpractice/modelAudio.ts.)
 */
const MODEL_AUDIO: Record<string, number> = {};

/**
 * 'missing' = a syllable with no dictionary entry: nothing is played rather than letting the
 * engine guess at the raw syllable.
 */
export type ModelSource = 'recording' | 'speech' | 'unavailable' | 'missing';

/** Whether this sound has a recorded model, i.e. is not relying on text-to-speech. */
export function hasRecordedModel(soundId: string): boolean {
  return MODEL_AUDIO[soundId] !== undefined;
}

/** Plays a bundled or on-device audio file and releases the player when it finishes. */
async function playAudio(source: number | string): Promise<boolean> {
  try {
    await ensureAudioActive();
    // keepAudioSessionActive: on iOS a finished clip otherwise deactivates the whole audio
    // session, and every text-to-speech phrase after it is silent (Talk included).
    const player = createAudioPlayer(source, { keepAudioSessionActive: true });
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

/** What text-to-speech should say for one Sound Practice item. */
function speechFor(exercise: SoundExercise, level: PracticeLevel, item: string): string {
  // An isolated letter needs the cue; a syllable, word or phrase is already pronounceable.
  if (level === 'sound') return `${exercise.cue}. ${exercise.cue}. Like ${exercise.exampleWord}.`;
  return item;
}

/**
 * Speaks a spoken form in ITS locale with the parent's rate / pitch / voice. The locale is passed
 * explicitly: practice models must not be read by whatever the phone's default voice happens to be.
 */
async function speakForm(form: SpokenForm, settings: AppSettings, rate = 1): Promise<void> {
  // An English form is read in the app's own English (US / UK / Australian / NZ accent).
  const appTag = getLocale(settings.language).speechTag;
  const language = form.locale.startsWith('en') && appTag.startsWith('en') ? appTag : form.locale;
  await speak(form.text, {
    rate: settings.speechRate * rate,
    pitch: settings.speechPitch,
    voice: settings.speechVoice,
    language,
  });
}

/**
 * The pronunciation-safe spoken form of a SYLLABLE item: this device's override, else the
 * dictionary default for the selected set. `null` when the dictionary has no entry — the caller
 * then plays nothing (and a development build logs the gap) instead of sending the raw syllable.
 */
export function syllableSpokenForm(item: SpeechItem, settings: AppSettings): SpokenForm | null {
  const parsed = item.modelKey ? parseModelKey(item.modelKey) : null;
  if (!parsed || parsed.kind !== 'syllable') return null;
  const set = settings.speechPronunciationSet;
  const override = parseOverrides(settings.speechPronunciationOverrides)[overrideKey(set, item.modelKey!)];
  if (override) return override;
  const entry = syllablePronunciation(set, parsed.id);
  if (!entry && __DEV__) console.log(`[speech practice] no pronunciation entry for ${set}/${parsed.id} — not spoken`);
  return entry?.spoken ?? null;
}

/** What the engine reads for a non-syllable item. */
function spokenFormFor(item: SpeechItem): SpokenForm {
  const override = item.modelKey ? SPOKEN_OVERRIDES[item.modelKey] : undefined;
  if (override) return override;
  const sound = item.soundId ? getSoundExercise(item.soundId) : undefined;
  // An isolated sound: its cue, twice — no example word, which in Sound Matching would give the
  // answer away.
  const text = sound ? `${sound.cue}. ${sound.cue}.` : item.speak ?? item.text;
  return { text, locale: 'en-US' };
}

export const soundPracticeAudio = {
  hasRecordedModel,

  /**
   * Sound Practice: plays the model pronunciation of one sound. Returns which source was used so
   * the screen can tell a grown-up when it is hearing a synthesised approximation.
   */
  async playModel(exercise: SoundExercise, level: PracticeLevel, item: string, settings: AppSettings): Promise<ModelSource> {
    // A bundled clip in MODEL_AUDIO, or the model-audio registry (bundled per set, or a parent recording).
    const recorded =
      level === 'sound'
        ? MODEL_AUDIO[exercise.id] ?? modelRecordings.resolve(settings.speechPronunciationSet, modelKey('sound', exercise.id)) ?? undefined
        : undefined;
    if (recorded !== undefined && (await playAudio(recorded))) return 'recording';
    try {
      await speakWithSettings(speechFor(exercise, level, item), settings);
      return 'speech';
    } catch {
      return 'unavailable';
    }
  },

  /** Where an item's model comes from right now — for the practice screen and Parent Mode. */
  modelStatus(item: SpeechItem, settings: AppSettings): 'recording' | 'voice' | 'missing' {
    if (item.audio !== undefined) return 'recording';
    if (item.modelKey && modelRecordings.source(settings.speechPronunciationSet, item.modelKey) !== 'none') return 'recording';
    if (item.strict) return syllableSpokenForm(item, settings) ? 'voice' : 'missing';
    return 'voice';
  },

  /** Parent Mode (Pronunciation test): speaks one spoken form exactly as the child would hear it. */
  async trySpoken(form: SpokenForm, settings: AppSettings): Promise<void> {
    try {
      await speakForm(form, settings);
    } catch {
      // the speech panel in Settings reports engine problems
    }
  },

  /** Plays any clip (a recording in Parent Mode). */
  async playFile(source: number | string): Promise<boolean> {
    return playAudio(source);
  },

  /** Plays back what the child just recorded, from its temporary file. */
  async playAttempt(uri: string): Promise<boolean> {
    return playAudio(uri);
  },

  /**
   * Speech Practice: plays the model for one item — a recording if there is one; else, for a
   * syllable, its dictionary spoken form (never the raw syllable); else the item's own text.
   * Never throws.
   */
  async playItem(item: SpeechItem, settings: AppSettings): Promise<ModelSource> {
    if (item.audio !== undefined && (await playAudio(item.audio))) return 'recording';
    const model = item.modelKey ? modelRecordings.resolve(settings.speechPronunciationSet, item.modelKey) : null;
    if (model !== null && (await playAudio(model))) return 'recording';
    if (item.soundId && hasRecordedModel(item.soundId)) {
      const sound = getSoundExercise(item.soundId);
      if (sound) return soundPracticeAudio.playModel(sound, 'sound', sound.sound, settings);
    }
    const form = item.strict ? syllableSpokenForm(item, settings) : spokenFormFor(item);
    if (!form) return 'missing';
    try {
      await speakForm(form, settings, item.rate);
      return 'speech';
    } catch {
      return 'unavailable';
    }
  },

  /**
   * Plays several items one after another ("M … B" for Same / Different). Text-to-speech
   * cancels whatever is speaking, so spoken items in one locale are joined into one utterance
   * with a pause; anything with a recording (or a mix of locales) is played in turn instead.
   */
  async playSequence(items: SpeechItem[], settings: AppSettings): Promise<ModelSource> {
    if (items.length === 0) return 'unavailable';
    if (items.length === 1) return soundPracticeAudio.playItem(items[0], settings);
    const recorded = items.some(
      (i) =>
        i.audio !== undefined ||
        (i.modelKey && modelRecordings.source(settings.speechPronunciationSet, i.modelKey) !== 'none') ||
        (i.soundId && hasRecordedModel(i.soundId)),
    );
    const forms = items.map((i) => (i.strict ? syllableSpokenForm(i, settings) : spokenFormFor(i)));
    const oneLocale = forms.every((f) => f && f.locale === forms[0]?.locale);
    if (!recorded && oneLocale && forms[0]) {
      try {
        await speakForm({ text: forms.map((f) => f!.text).join(' ... '), locale: forms[0].locale }, settings);
        return 'speech';
      } catch {
        return 'unavailable';
      }
    }
    let source: ModelSource = 'unavailable';
    for (const [n, item] of items.entries()) {
      if (n > 0) await new Promise((r) => setTimeout(r, 1400));
      source = await soundPracticeAudio.playItem(item, settings);
    }
    return source;
  },
};
