import { createAudioPlayer } from 'expo-audio';
import { ensureAudioActive, speak, speakWithSettings } from './speech';
import { modelRecordings } from './modelRecordings';
import { getSoundExercise, phonemeAssetPath, phonemeModelKey } from '@/soundpractice/content';
import type { SoundExercise } from '@/soundpractice/types';
import { SPOKEN_OVERRIDES, syllablePronunciation, type SpokenForm } from '@/speechpractice/pronunciationDictionary';
import { overrideKey, parseModelKey, parseOverrides } from '@/speechpractice/pronunciation';
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
 * read it — "G" becomes the letter name "gee", "BO" may become "baw". So what the engine is given
 * is never the raw target, and there are separate calls for separate jobs:
 *   - playPhoneme      an isolated speech sound (/ɡ/) — from a RECORDING only (see below);
 *   - playExampleWord  the sound's example word ("Goat") — a real word, so the voice reads it;
 *   - playInstruction  a spoken instruction or encouragement — ordinary speech;
 *   - playLetterName   the letter's NAME ("gee"), only where the name itself is what is meant;
 *   - syllables        the pronunciation dictionary's spoken form (speechpractice/pronunciationDictionary.ts),
 *                      in its own locale, e.g. "BO" → "beau" (en-US); a grown-up's choice overrides it;
 *   - words, phrases   their own text, unless SPOKEN_OVERRIDES says otherwise.
 * A recording of the model always wins over any of these.
 *
 * WHY A PHONEME IS NEVER SYNTHESISED. expo-speech hands the engine plain text (iOS
 * AVSpeechUtterance(string:), Android TextToSpeech.speak) — no IPA, no SSML phoneme tags — and an
 * engine only ever reads text as words. "G" is read as the letter name; any respelling that gets a
 * sound out of it ("guh") puts a vowel after the consonant, /ɡə/ instead of /ɡ/, and a child copies
 * the vowel. Engines also differ between Android and iOS. So an isolated phoneme comes from ONE
 * recording, identical on every device.
 */

/**
 * 'missing' = a syllable with no dictionary entry: nothing is played rather than letting the
 * engine guess at the raw syllable.
 * 'fallback' = DEVELOPMENT FALLBACK: a sound has no phoneme recording yet, so its example word was
 * played instead (see playPhoneme). The screen tells a grown-up which recording is missing.
 */
export type ModelSource = 'recording' | 'speech' | 'unavailable' | 'missing' | 'fallback';

/**
 * The recording of a sound's isolated phoneme: bundled in the family's set, else bundled in
 * English (phonemes are English targets), else one a grown-up recorded on this device. Null when
 * there is none yet.
 */
function phonemeClip(soundId: string, settings: AppSettings): number | string | null {
  const key = phonemeModelKey(soundId);
  return modelRecordings.resolve(settings.speechPronunciationSet, key) ?? modelRecordings.resolve('en', key);
}

/** Whether this sound's phoneme has a recording, i.e. plays the true isolated sound. */
export function hasPhonemeRecording(soundId: string, settings: AppSettings): boolean {
  return phonemeClip(soundId, settings) !== null;
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

/** What the engine reads for a non-syllable, non-sound item (a word or a phrase). */
function spokenFormFor(item: SpeechItem): SpokenForm {
  const override = item.modelKey ? SPOKEN_OVERRIDES[item.modelKey] : undefined;
  if (override) return override;
  return { text: item.speak ?? item.text, locale: 'en-US' };
}

/** The sound behind a practice item, when the item IS an isolated sound. */
function soundOf(item: SpeechItem): SoundExercise | undefined {
  return item.soundId ? getSoundExercise(item.soundId) : undefined;
}

/**
 * Plays a sound's isolated PHONEME (/ɡ/) — what "Play sound" means everywhere in the app.
 *
 * Only a recording is the phoneme. Until one exists for a sound, this is a DEVELOPMENT FALLBACK:
 * it plays the example word ("Goat"), where a voice engine does say a true /ɡ/ — at the start of a
 * real word, with that word's own vowel — and returns 'fallback' so the screen can tell a grown-up
 * that the recording is missing. It never speaks the letter ("gee") and never a respelling
 * ("guh"). Adding the recording at phonemeAssetPath(id) replaces the fallback with no code change.
 */
export async function playPhoneme(sound: SoundExercise, settings: AppSettings): Promise<ModelSource> {
  const clip = phonemeClip(sound.id, settings);
  if (clip !== null && (await playAudio(clip))) return 'recording';
  if (__DEV__) {
    console.warn(
      `[sound practice] no recording of ${sound.phoneme} ("${sound.letter}") — development fallback plays "${sound.exampleWord}". ` +
        `Add ${phonemeAssetPath(sound.id)} and register '${phonemeModelKey(sound.id)}' in speechpractice/modelAudio.ts.`,
    );
  }
  const spoken = await playExampleWord(sound, settings);
  return spoken === 'speech' ? 'fallback' : spoken;
}

/** Plays a sound's example word ("Goat") as a whole word: a real word, so the voice reads it naturally. */
export async function playExampleWord(sound: SoundExercise, settings: AppSettings): Promise<ModelSource> {
  try {
    await speakForm({ text: sound.exampleWord, locale: 'en-US' }, settings);
    return 'speech';
  } catch {
    return 'unavailable';
  }
}

/** Speaks an instruction or encouragement ("Your turn!") with the parent's voice settings. */
export async function playInstruction(text: string, settings: AppSettings): Promise<void> {
  try {
    await speakWithSettings(text, settings);
  } catch {
    // speech problems are reported in Settings; an instruction is never essential
  }
}

/**
 * Speaks a letter's NAME ("gee"). Only for teaching the alphabet — never as the model of a sound,
 * which is what playPhoneme is for.
 */
export async function playLetterName(letter: string, settings: AppSettings): Promise<void> {
  await playInstruction(letter, settings);
}

export const soundPracticeAudio = {
  hasPhonemeRecording,
  playPhoneme,
  playExampleWord,
  playInstruction,
  playLetterName,

  /** Where an item's model comes from right now — for the practice screen and Parent Mode. */
  modelStatus(item: SpeechItem, settings: AppSettings): 'recording' | 'voice' | 'missing' {
    if (item.audio !== undefined) return 'recording';
    if (item.soundId) return hasPhonemeRecording(item.soundId, settings) ? 'recording' : 'voice';
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
   * Speech Practice: plays the model for one item — a recording if there is one; else, for an
   * isolated sound, playPhoneme; for a syllable, its dictionary spoken form (never the raw
   * syllable); else the item's own text. Never throws.
   */
  async playItem(item: SpeechItem, settings: AppSettings): Promise<ModelSource> {
    if (item.audio !== undefined && (await playAudio(item.audio))) return 'recording';
    const sound = soundOf(item);
    if (sound) return playPhoneme(sound, settings);
    const model = item.modelKey ? modelRecordings.resolve(settings.speechPronunciationSet, item.modelKey) : null;
    if (model !== null && (await playAudio(model))) return 'recording';
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
    // An isolated sound always goes through playPhoneme on its own, never into a joined utterance.
    const recorded = items.some(
      (i) =>
        i.audio !== undefined ||
        soundOf(i) !== undefined ||
        (i.modelKey && modelRecordings.source(settings.speechPronunciationSet, i.modelKey) !== 'none'),
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
