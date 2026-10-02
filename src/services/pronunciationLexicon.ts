/**
 * Pronunciation lexicons for the ENGLISH voice.
 *
 * TalkEasy's text is shown as written ("Ate", "Mga hayop"), but an English text-to-speech voice
 * reads other languages with English rules: "Ate" (older sister, /ʔaˈtɛ/, "ah-teh") comes out as
 * the English verb "ate" (/eɪt/), and "mga" — a whole Filipino word, /maˈŋa/ — is read as the three
 * letters M-G-A. Before an English voice speaks, each word below is swapped for a
 * pronunciation-safe spelling. The display text never changes — only what the engine is given.
 *
 * There are TWO lexicons, because they have different reach:
 *
 * - GLOBAL (`ENGLISH_VOICE_LEXICON`): Filipino words that appear inside otherwise-English TalkEasy
 *   content — the kinship terms on the Talk tiles ("I want Ate"). Applied to every English-voice
 *   utterance in the app, so it may only hold words that are distinctive enough to be safe there.
 *
 * - FILIPINO FALLBACK (`FILIPINO_FALLBACK_LEXICON`): applied ONLY to Filipino content that an
 *   English voice is having to read because the device has no Filipino voice installed. That scope
 *   is what lets it carry "ang", "sa" and "ano" — words which, applied app-wide, would mangle
 *   ordinary English sentences.
 *
 * Neither is applied when a real Filipino voice speaks: that voice reads these correctly as
 * written, and respelling them for it would make the pronunciation worse.
 *
 * Adding a word: one line. `caseSensitive` is for words that are ALSO English words, so only the
 * Filipino use is changed — "Ate" (a name, always capitalised) becomes "ah-teh", while the English
 * "ate" in "I ate lunch" is left alone.
 */
export interface LexiconEntry {
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

/**
 * Filipino read by an English voice, when the device has no Filipino one.
 *
 * A LAST RESORT, not the plan: a Filipino lesson asks for a Filipino voice first (see
 * `voiceCatalog.ts`), and these respellings only run when the device cannot supply one. They make
 * the word recognisable to a child who knows it — they do not make an English engine sound
 * Filipino, and nothing here should be mistaken for a Filipino voice.
 *
 * "ng" is the sticking point: Filipino /ŋ/ is a single sound that English spells only in the middle
 * or at the end of a word, so each respelling CLOSES the preceding syllable with it ("mahng-ah")
 * rather than opening the next one with "nga", which an English engine reads as /n/+/g/.
 */
export const FILIPINO_FALLBACK_LEXICON: LexiconEntry[] = [
  // The plural marker. One word, never the letters M-G-A.
  { word: 'mga', say: 'mahng-ah' }, // /maˈŋa/
  { word: 'ng', say: 'nahng' }, // /naŋ/ — the linker, likewise not a pair of letters
  // Animals lesson
  { word: 'hayop', say: 'hah-yop' },
  { word: 'aso', say: 'ah-soh' },
  { word: 'pusa', say: 'poo-sah' },
  { word: 'ibon', say: 'ee-bohn' },
  { word: 'isda', say: 'ees-dah' },
  // Everyday function words (safe here because this lexicon only touches Filipino content)
  { word: 'ang', say: 'ahng' },
  { word: 'sa', say: 'sah' },
  { word: 'tawag', say: 'tah-wahg' },
  { word: 'ano', say: 'ah-noh' },
  { word: 'alin', say: 'ah-leen' },
  { word: 'bata', say: 'bah-tah' },
  { word: 'bahay', say: 'bah-high' },
  { word: 'tubig', say: 'too-big' },
  { word: 'araw', say: 'ah-row' },
  { word: 'salamat', say: 'sah-lah-maht' },
];

// Whole words only ("Theater" and "Kuyas" are left alone). A capture group instead of a lookbehind
// keeps the pattern portable to every JavaScript engine the app runs on.
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
const filipinoCompiled = compile(FILIPINO_FALLBACK_LEXICON);

/** The text an ENGLISH voice should be given for `text`. Display text is never changed. */
export function forEnglishVoice(text: string): string {
  return apply(text, globalCompiled);
}

/**
 * The text an ENGLISH voice should be given for FILIPINO `text`, when no Filipino voice exists.
 *
 * Runs the Filipino fallback first and the global lexicon after it, so a word listed in both
 * (the kinship terms appear in Filipino sentences too) is respelled once, by the more specific
 * list, and the already-respelled result contains no whole word for the second pass to match.
 */
export function forEnglishVoiceSpeakingFilipino(text: string): string {
  return apply(apply(text, filipinoCompiled), globalCompiled);
}

/** Whether a voice with this BCP-47 tag (or the default voice, when none) reads with English rules. */
export function isEnglishVoice(language: string | null | undefined): boolean {
  return !language || language.toLowerCase().startsWith('en');
}
