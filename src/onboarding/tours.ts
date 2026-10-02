import type { Strings } from '@/i18n/types';

/**
 * Guided first-run tours.
 *
 * A tour is DATA: a list of steps, each naming a target that exists on screen and the words to say
 * about it. Screens do not contain tooltip logic — they mark their targets with `<TourTarget id>`
 * and the overlay does the rest. That is what makes a second tour (Speech Practice, Parent Mode)
 * a new entry here rather than new code in a screen.
 *
 * ACCESSIBILITY AND KINDNESS RULES, which the checks enforce:
 *  - every step can be skipped, and skipping counts as done — a child who wants to play should
 *    never have to sit through an explanation to get there;
 *  - a tour runs ONCE. Completion is stored, and a tour that has run is never shown again;
 *  - the overlay dims but never blocks: the highlighted thing stays fully visible and legible.
 */

export type TourId = 'home';

/** Where the tooltip would prefer to sit. The overlay overrides this when there is no room. */
export type TourPlacement = 'above' | 'below';

export interface TourStep {
  /** Matches a `<TourTarget id="…">` rendered on the screen. */
  target: string;
  titleKey: keyof Strings;
  bodyKey: keyof Strings;
  placement: TourPlacement;
}

export interface TourDef {
  id: TourId;
  steps: TourStep[];
}

/**
 * The first-run Home tour.
 *
 * Seven steps, in the order a child meets the screen top to bottom, so the spotlight never jumps
 * backwards. It opens on the thing we actually want them to press.
 */
const home: TourDef = {
  id: 'home',
  steps: [
    { target: 'startAdventure', titleKey: 'tourStartTitle', bodyKey: 'tourStartBody', placement: 'below' },
    { target: 'speech', titleKey: 'tourSpeechTitle', bodyKey: 'tourSpeechBody', placement: 'below' },
    { target: 'talk', titleKey: 'tourTalkTitle', bodyKey: 'tourTalkBody', placement: 'below' },
    { target: 'words', titleKey: 'tourWordsTitle', bodyKey: 'tourWordsBody', placement: 'below' },
    { target: 'play', titleKey: 'tourPlayTitle', bodyKey: 'tourPlayBody', placement: 'below' },
    { target: 'lessons', titleKey: 'tourLessonsTitle', bodyKey: 'tourLessonsBody', placement: 'below' },
    { target: 'parent', titleKey: 'tourParentTitle', bodyKey: 'tourParentBody', placement: 'above' },
  ],
};

export const TOURS: Record<TourId, TourDef> = { home };

export function getTour(id: TourId): TourDef {
  return TOURS[id];
}

/**
 * Completion is a comma-separated list of tour ids in one setting, the same shape
 * `speechPracticeHidden` uses — so adding a tour needs no migration, and the whole record is one
 * string a future sync could carry.
 */
export function parseToursDone(raw: string): Set<TourId> {
  return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean) as TourId[]);
}

export function withTourDone(raw: string, id: TourId): string {
  const done = parseToursDone(raw);
  done.add(id);
  return [...done].join(',');
}
