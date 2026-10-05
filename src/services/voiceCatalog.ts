import * as Speech from 'expo-speech';
import { pickBestVoice } from './voicePick';
import { contentLanguage, voiceSpeaks, type ContentLanguage } from './contentLanguage';

/**
 * Which voice the device can actually use for a content language.
 *
 * THE POINT: asking an engine for `fil-PH` is a REQUEST, not a guarantee. Android engines vary —
 * some speak the language, some silently fall back to the default voice, and some refuse to speak
 * at all when they have no voice for the tag. iOS differs again. So the app LOOKS at what is
 * installed before it decides, and the rest of the app gets an honest answer: either a
 * voice identifier, or `matched: false` meaning "there is no voice for it here — read it with
 * the fallback spelling and do not pretend otherwise".
 *
 * The voice list is fetched once and cached. On some Android devices it is empty until the TTS
 * engine has warmed up, so an empty result is NOT cached and the next call tries again.
 */
export interface VoiceChoice {
  /** The engine voice to use, or null to let the engine pick from the language tag. */
  voice: string | null;
  /** The BCP-47 tag to pass, or null when an explicit voice makes it unnecessary. */
  language: string | null;
  /** True only when a voice for the requested language was actually found on this device. */
  matched: boolean;
}

/** English content: the app's own voice, exactly as before. */
const APP_VOICE: VoiceChoice = { voice: null, language: null, matched: true };

interface DeviceVoice {
  identifier: string;
  name: string;
  language: string;
}

let cached: DeviceVoice[] | null = null;
let inFlight: Promise<DeviceVoice[]> | null = null;
const resolved = new Map<string, VoiceChoice>();

async function loadVoices(): Promise<DeviceVoice[]> {
  if (cached && cached.length > 0) return cached;
  if (inFlight) return inFlight;
  inFlight = Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const list = voices.map((v) => ({ identifier: v.identifier, name: v.name, language: v.language }));
      // Only cache a real answer: an empty list usually means the engine has not warmed up yet,
      // and caching it would leave the app convinced the device has no voices for the whole session.
      if (list.length > 0) cached = list;
      if (__DEV__) logCatalogue(list);
      return list;
    })
    .catch((err: unknown) => {
      if (__DEV__) console.log('[voices] getAvailableVoicesAsync', err);
      return [];
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/**
 * Prints what this device actually offers, once, in development.
 *
 * Android and iOS disagree about which languages ship, which are downloadable and what they are
 * called, and the only way to know what a given phone or tablet has is to ask it — so this is the
 * line to read when a lesson sounds wrong on one device and right on another.
 */
function logCatalogue(list: DeviceVoice[]): void {
  const byLanguage = new Map<string, number>();
  list.forEach((v) => byLanguage.set(v.language, (byLanguage.get(v.language) ?? 0) + 1));
  const summary = [...byLanguage.entries()].sort().map(([lang, n]) => `${lang}(${n})`).join(' ');
  console.log(`[voices] ${list.length} installed: ${summary || 'none'}`);
  contentLanguagesInUse().forEach((lang) => {
    const hit = list.find((v) => voiceSpeaks(lang, v.language));
    console.log(`[voices] ${lang.label} (${lang.tag}): ${hit ? `${hit.name} [${hit.language}]` : 'NOT INSTALLED — using fallback spelling'}`);
  });
}

function contentLanguagesInUse(): ContentLanguage[] {
  // Imported lazily through contentLanguage() to keep this module's imports to the two it needs.
  return (['es-ES'] as const).map(contentLanguage).filter((l): l is ContentLanguage => l !== null);
}

/**
 * The best voice for `tag` on this device.
 *
 * English (or no language) returns the app's own voice untouched, so nothing about existing
 * screens changes. For a content language the device is searched for a matching voice; when one
 * exists it is named EXPLICITLY rather than requested by tag, because naming the voice is the only
 * way to be sure the engine uses it.
 */
export async function voiceFor(tag: string | null | undefined): Promise<VoiceChoice> {
  const language = contentLanguage(tag);
  if (!language) return APP_VOICE;

  const hit = resolved.get(language.tag);
  if (hit) return hit;

  const voices = await loadVoices();
  const match = voices.find((v) => voiceSpeaks(language, v.language));
  const choice: VoiceChoice = match
    ? { voice: match.identifier, language: match.language, matched: true }
    : // No voice for it here. Pass no tag: an engine with no voice for the language may refuse the tag
      // outright and say nothing, and silence is worse than an English voice reading a
      // pronunciation-safe respelling, which is what the caller does on `matched: false`.
      { voice: null, language: null, matched: false };

  // Only remembered once the engine has given a real list; otherwise the first call on a cold
  // engine would pin "no voice" for the rest of the session.
  if (voices.length > 0) resolved.set(language.tag, choice);
  return choice;
}

/** Forgets the cached catalogue — for Parent Mode, after a voice is installed on the device. */
export function refreshVoiceCatalogue(): void {
  cached = null;
  resolved.clear();
  bestByTag.clear();
}

const bestByTag = new Map<string, string | null>();

/**
 * The most natural installed offline voice for an English tag, or null to keep the engine default.
 * Only used when the parent has not chosen a voice. Cached once the device has given a real list.
 */
export async function bestEnglishVoice(tag: string): Promise<string | null> {
  if (bestByTag.has(tag)) return bestByTag.get(tag) ?? null;
  const voices = await loadVoices();
  const pick = pickBestVoice(voices, tag);
  if (voices.length > 0) bestByTag.set(tag, pick);
  return pick;
}
