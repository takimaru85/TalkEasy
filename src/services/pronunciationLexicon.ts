/**
 * Pronunciation lexicon for the ENGLISH voice.
 *
 * TalkEasy's text is shown as written, but an English text-to-speech voice reads a foreign word
 * with English rules. Before an English voice speaks, each word in `ENGLISH_VOICE_LEXICON` is
 * swapped for a pronunciation-safe spelling. The display text never changes — only what the engine
 * is given.
 *
 * TalkEasy is English-only, so the lexicon is EMPTY: the Filipino entries that used to live here
 * (kinship terms, the "mga" fallback list) were removed with the rest of the Filipino feature. The
 * machinery is kept because it is language-independent — adding a word is one line:
 *
 *   { word: 'Ate', say: 'ah-teh', caseSensitive: true }
 *
 * `caseSensitive` is for a word that is ALSO an English word, so only the foreign use is changed.
 */
export interface LexiconEntry {
  /** The word as written. */
  word: string;
  /** What the English voice is given instead. */
  say: string;
  /** Match only this exact capitalisation (the word is also an English word). */
  caseSensitive?: boolean;
}

export const ENGLISH_VOICE_LEXICON: LexiconEntry[] = [];

// Whole words only. A capture group instead of a lookbehind keeps the pattern portable to every
// JavaScript engine the app runs on.
const LETTER = 'A-Za-z\\u00C0-\\u024F0-9';

function compile(entries: LexiconEntry[]) {
  return entries.map((e) => ({
    pattern: new RegExp(`(^|[^${LETTER}])${e.word}(?![${LETTER}])`, e.caseSensitive ? 'g' : 'gi'),
    say: e.say,
  }));
}

function apply(text: string, compiled: ReturnType<typeof compile>): string {
  return compiled.reduce((out, e) => out.replace(e.pattern, (_m, before: string) => before + e.say), text);
}

const globalCompiled = compile(ENGLISH_VOICE_LEXICON);

/** The text an ENGLISH voice should be given for `text`. Display text is never changed. */
export function forEnglishVoice(text: string): string {
  return apply(text, globalCompiled);
}

/** Whether a voice with this BCP-47 tag (or the default voice, when none) reads with English rules. */
export function isEnglishVoice(language: string | null | undefined): boolean {
  return !language || language.toLowerCase().startsWith('en');
}
