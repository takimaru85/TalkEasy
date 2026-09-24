import type { ContentMap, Locale, Strings } from '../types';
import { en } from './en';

/**
 * English (UK), English (Australia) and English (New Zealand).
 *
 * All three are US English plus Commonwealth spelling ("practise" as a verb, "Favourites",
 * "individualised") and "Mum" instead of "Mom" on the seeded Talk cards. Everything else is shared
 * with `en`, so a string added to US English is automatically present in every variant — only
 * genuine differences are listed here. `speechTag` gives each variant its own voice accent.
 *
 * `content` translates the English text seeded into SQLite at render time (see i18n/types.ts): the
 * database keeps "Mom", the child sees and hears "Mum". A parent's own cards pass through unchanged.
 */
const COMMONWEALTH_STRINGS: Partial<Strings> = {
  sectionFavorites: 'Favourites',
  soundPracticeSubtitle: 'Practise sounds, syllables and simple words',
  soundChooseSound: 'Choose a sound to practise',
  soundPracticeCta: 'Practise',
  soundKeepPracticing: 'Keep practising!',
  soundStatSounds: 'Sounds practised',
  soundMicExplain:
    'TalkEasy needs access to the microphone so you can practise speaking. Your recording stays on this device and is deleted right after you hear it.',
  soundGrownUpNote: 'TalkEasy Sound Practice provides simple activities for practising sounds, syllables and words at home.',
  spSubtitle: 'Practise sounds, words, language and communication',
  spPracticeAgain: 'Practise again',
  spStatWords: 'Words practised',
  spNoWords: 'Nothing to practise here yet. A grown-up can add words in Parent Mode.',
  spNotice:
    'TalkEasy provides general communication and speech-practice activities. It is not a substitute for assessment or individualised therapy from a licensed speech-language pathologist.',
};

/** Seeded Talk-card text: "Mum" in UK, Australian and New Zealand English. */
const MUM: ContentMap = {
  'Mom': 'Mum',
  'I want Mom.': 'I want Mum.',
  'Call Mom': 'Call Mum',
  'Please call Mom.': 'Please call Mum.',
};

function variant(code: Locale['code'], name: string, flag: string): Locale {
  return {
    code,
    name,
    flag,
    speechTag: code,
    letterStyle: 'standard',
    strings: { ...en.strings, ...COMMONWEALTH_STRINGS },
    content: MUM,
  };
}

export const enGB = variant('en-GB', 'English (UK)', '🇬🇧');
export const enAU = variant('en-AU', 'English (Australia)', '🇦🇺');
export const enNZ = variant('en-NZ', 'English (New Zealand)', '🇳🇿');
