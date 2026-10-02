import { CONTENT_LANGUAGES, normalizeContentLanguage } from '@/services/contentLanguage';

/**
 * The language a scanned assignment is written in.
 *
 * This is the SAME axis as a lesson's language (services/contentLanguage.ts) and deliberately reuses
 * it: a scanned Filipino worksheet and a seeded Filipino lesson must be read aloud by the same
 * voice, through the same code, or the two drift apart and one of them starts saying "Mga" as the
 * letters M, G, A again.
 *
 * '' means English, which is what almost every scan will be.
 */
export type ScanLanguage = string;

/** What a grown-up can pick on the review screen. English first, then the content languages. */
export const SCAN_LANGUAGES: readonly { tag: ScanLanguage; label: string }[] = [
  { tag: '', label: 'English' },
  ...CONTENT_LANGUAGES.map((l) => ({ tag: l.tag, label: l.label })),
];

/** A stored or passed-in tag, normalised. Anything unknown becomes English. */
export function normalizeScanLanguage(raw: string | null | undefined): ScanLanguage {
  return normalizeContentLanguage(raw);
}

/**
 * The SCRIPT the text-recognition engine should look for.
 *
 * ML Kit recognises by script, not by language: one Latin model reads English, Filipino, Spanish and
 * most of Europe, and the separate models are for Chinese, Devanagari, Japanese and Korean. Every
 * language TalkEasy currently offers is Latin, so this returns 'Latin' for all of them — the mapping
 * exists so that adding a language with another script is a line HERE rather than a change to the
 * OCR service or to a screen.
 *
 * Whatever comes back is shown exactly as the engine read it. TalkEasy does not translate, correct
 * or rewrite a child's assignment.
 */
export function scriptFor(language: ScanLanguage): 'Latin' | 'Chinese' | 'Devanagari' | 'Japanese' | 'Korean' {
  const tag = normalizeScanLanguage(language);
  switch (tag) {
    // Every current content language is written in Latin script.
    case '':
    case 'fil-PH':
    case 'es-ES':
    default:
      return 'Latin';
  }
}
