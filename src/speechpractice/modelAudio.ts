import type { PronunciationSet } from './pronunciation';

/**
 * Bundled model recordings — the primary source of every Speech Practice model.
 *
 * Files live in `assets/audio/speech-practice/<set>/<kind>/<id>.m4a` (or .mp3) and are listed
 * here by model key (see pronunciation.ts `modelKey`). Metro needs a literal `require` for each
 * bundled file, which is why this is a list and not a folder scan. Bundled files ship inside
 * the app, so they work offline and sound identical every time.
 *
 * To add one, e.g. an English "BA":
 *   1. record one clear repetition, trim the silence, save as
 *      assets/audio/speech-practice/<set>/syllables/ba.m4a
 *   2. add below, under that set: 'syllable:ba': require('../../assets/audio/speech-practice/fil/syllables/ba.m4a'),
 * Nothing else changes: the syllable plays the recording on its next open.
 *
 * Until a file is bundled, a parent or therapist can record the model on the device instead
 * (Parent Mode → Speech Practice → Model recordings); a bundled file always wins.
 */
export const BUNDLED_MODEL_AUDIO: Record<PronunciationSet, Record<string, number>> = {
  fil: {},
  en: {},
};
