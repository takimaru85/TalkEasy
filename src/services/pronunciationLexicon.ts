/**
 * Pronunciation lexicon for the ENGLISH voice.
 *
 * TalkEasy's text is shown as written ("Ate", "Kuya", "Lola"), but an English text-to-speech voice
 * reads Filipino words with English rules: "Ate" (older sister, /ʔaˈtɛ/, "ah-teh") comes out as the
 * English verb "ate" (/eɪt/). Before an English voice speaks, each word below is swapped for a
 * pronunciation-safe spelling. The display text never changes — only what the engine is given.
 *
 * Not applied when a Filipino voice (fil-PH) speaks: that voice already reads these correctly.
 *
 * Adding a word: one line. `caseSensitive` is for words that are ALSO English words, so only the
 * Filipino use is changed — "Ate" (a name, always capitalised) becomes "ah-teh", while the English
 * "ate" in "I ate lunch" is left alone.
 */
interface LexiconEntry {
  /** The word as written. */
  word: string;
  /** What the English voice is given instead. */
  say: string;
  /** Match only this exact capitalisation (the word is also an English word). */
  caseSensitive?: boolean;
}

export const ENGLISH_VOICE_LEXICON: LexiconEntry[] = [
  // Family (Filipino kinship terms)
  { word: 'Ate', say: 'ah-teh', caseSensitive: true }, // older sister; lowercase "ate" is English
  { word: 'Kuya', say: 'koo-yah' }, // older brother
  { word: 'Nanay', say: 'nah-nigh' }, // mother
  { word: 'Tatay', say: 'tah-tie' }, // father
  { word: 'Lola', say: 'loh-lah' }, // grandmother
  { word: 'Lolo', say: 'loh-loh' }, // grandfather
  { word: 'Tita', say: 'tee-tah' }, // aunt
  { word: 'Tito', say: 'tee-toh' }, // uncle
];

// Whole words only ("Theater" and "Kuyas" are left alone). A capture group instead of a lookbehind
// keeps the pattern portable to every JavaScript engine the app runs on.
const LETTER = 'A-Za-z\\u00C0-\\u024F0-9';
const compiled = ENGLISH_VOICE_LEXICON.map((e) => ({
  pattern: new RegExp(`(^|[^${LETTER}])${e.word}(?![${LETTER}])`, e.caseSensitive ? 'g' : 'gi'),
  say: e.say,
}));

/** The text an ENGLISH voice should be given for `text`. Display text is never changed. */
export function forEnglishVoice(text: string): string {
  return compiled.reduce((out, e) => out.replace(e.pattern, (_m, before: string) => before + e.say), text);
}

/** Whether a voice with this BCP-47 tag (or the default voice, when none) reads with English rules. */
export function isEnglishVoice(language: string | null | undefined): boolean {
  return !language || language.toLowerCase().startsWith('en');
}
