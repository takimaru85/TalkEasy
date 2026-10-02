/**
 * CONTENT languages — the language a lesson is written in.
 *
 * This is a different axis from the UI language (`src/i18n`). The interface is English-only; the
 * schoolwork is not. A Philippine school day has a Filipino subject in it, and "Mga hayop" has to
 * be SPOKEN as Filipino even though every button around it says "Read it to me".
 *
 * Kept pure (no react-native, no expo) so the checks can import it.
 *
 * Adding a language = one entry. `voicePrefixes` are the BCP-47 prefixes a device engine might
 * report for it, because engines disagree: Filipino turns up as `fil-PH` on most Android builds
 * and as `tl-PH` (Tagalog) on some, and a tag may arrive with an underscore.
 */
export interface ContentLanguage {
  /** The canonical tag stored on a lesson and asked of the engine. */
  tag: string;
  /** For a grown-up, in Parent Mode. */
  label: string;
  /** Lower-case language subtags a device voice may report for this language. */
  voicePrefixes: string[];
}

/** English is the default and is never stored on a lesson; '' means "the app's own voice". */
export const DEFAULT_CONTENT_LANGUAGE = '';

export const CONTENT_LANGUAGES: readonly ContentLanguage[] = [
  { tag: 'fil-PH', label: 'Filipino', voicePrefixes: ['fil', 'tl'] },
  { tag: 'es-ES', label: 'Spanish', voicePrefixes: ['es'] },
];

/**
 * The canonical tag for whatever was stored, or '' for English / unknown.
 *
 * Tolerant on purpose: a lesson may have been typed in by a parent, imported, or written with an
 * underscore, and an unrecognised language must fall back to the app's own voice rather than
 * handing the engine a tag it will refuse.
 */
export function normalizeContentLanguage(raw: string | null | undefined): string {
  const value = (raw ?? '').trim().replace(/_/g, '-').toLowerCase();
  if (!value) return DEFAULT_CONTENT_LANGUAGE;
  const subtag = value.split('-')[0];
  if (subtag === 'en') return DEFAULT_CONTENT_LANGUAGE;
  const match = CONTENT_LANGUAGES.find((l) => l.voicePrefixes.includes(subtag));
  return match ? match.tag : DEFAULT_CONTENT_LANGUAGE;
}

/** The content language for a tag, or null when it is English / unknown. */
export function contentLanguage(tag: string | null | undefined): ContentLanguage | null {
  const canonical = normalizeContentLanguage(tag);
  return canonical ? (CONTENT_LANGUAGES.find((l) => l.tag === canonical) ?? null) : null;
}

/**
 * Whether a voice reported by the device can speak this content language.
 *
 * Compares language SUBTAGS, never whole tags: a `fil-PH` lesson is served perfectly well by a
 * voice the engine calls `fil_PH`, `fil-ph` or `tl-PH`, and demanding an exact match is how a
 * device that HAS a Filipino voice ends up reading Filipino with an English one.
 */
export function voiceSpeaks(language: ContentLanguage, voiceTag: string | null | undefined): boolean {
  const subtag = (voiceTag ?? '').trim().replace(/_/g, '-').toLowerCase().split('-')[0];
  return subtag.length > 0 && language.voicePrefixes.includes(subtag);
}
