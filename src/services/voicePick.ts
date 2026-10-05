/**
 * Picks the most natural INSTALLED voice for a language when the parent has not chosen one.
 * Pure, so it can be checked without a device.
 *
 * Why: with no voice named, iOS speaks with the compact default voice and Android with whatever the
 * engine defaults to — usually the flattest one installed. Both platforms often also have a better
 * voice already on the phone (iOS "Enhanced"/"Premium", Android a "-local" engine voice).
 *
 * Rules, in order of weight:
 *   - the language must match (exact tag beats same-language-other-region);
 *   - never a voice that needs the network: TalkEasy is offline-first and a child's words must not
 *     leave the device;
 *   - iOS Enhanced beats Default; an Android "-local" voice is preferred.
 * No match returns null and the caller keeps today's behaviour exactly.
 */
export interface PickableVoice {
  identifier: string;
  name: string;
  language: string;
  quality?: string;
}

const norm = (s: string) => s.toLowerCase().replace('_', '-');

export function pickBestVoice(voices: PickableVoice[], tag: string): string | null {
  const want = norm(tag);
  const base = want.split('-')[0];
  let best: { id: string; score: number } | null = null;
  for (const v of voices) {
    const lang = norm(v.language);
    if (lang.split('-')[0] !== base) continue;
    const id = v.identifier.toLowerCase();
    if (id.includes('network') || id.includes('notinstalled') || id.includes('not-installed')) continue;
    let score = lang === want ? 100 : 0;
    if (String(v.quality).toLowerCase() === 'enhanced') score += 20;
    if (id.includes('premium')) score += 10;
    if (id.includes('local')) score += 5;
    if (id.includes('compact')) score -= 5;
    if (!best || score > best.score) best = { id: v.identifier, score };
  }
  return best && best.score >= 100 ? best.id : null;
}
