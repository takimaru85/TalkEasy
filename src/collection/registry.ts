/**
 * THE SPACE COLLECTION: 46 collectibles in six categories, each found by doing something real in TalkEasy.
 * Pure data (no React, no storage), so the unlock rules can be read in one place and checked in Node.
 *
 * WHAT A CONDITION MEANS. Every condition is measured against VERIFIED practice the app already records:
 * speech and sound practice, tracing pages finished (a real stroke is required), Play & Learn plays,
 * lessons finished, voice-practice sessions, Daily Mission days, and CREDITED reward claims (a task a
 * grown-up had to confirm only counts once it was confirmed; a screen opened or a Done button tapped
 * counts for nothing). Rewards-wise, finding a collectible never costs or earns stars: the collection and
 * the star shop are separate (see `rewards/verification.ts`, `shop/`).
 *
 * NOTHING IS TAKEN BACK. Once a collectible is found it is RECORDED (`collectible_discoveries`) with the
 * date, so a missed day, a replayed activity or a reset counter never removes it.
 *
 * The first five rows marked \`legacy\` are the collection the app had before (Star, Earth, Moon, Saturn,
 * Rocket) with exactly their old milestones, so everything a child already found is still found.
 */
export type CollectionCategory = 'companions' | 'planets' | 'vehicles' | 'discoveries' | 'equipment' | 'special';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** The measurable things a condition can ask about. Every one is counted, never typed in. */
export type CollectionMetric =
  | 'speechPractice' // sound attempts + speech exercises (legacy)
  | 'baRowSyllables' // BA BE BI BO BU practised (legacy)
  | 'tracingSessions' // tracing pages finished with a real stroke
  | 'missionDays' // Daily Mission days completed
  | 'talkTaps' // Talk cards spoken
  | 'sounds' // different sounds practised
  | 'words' // different words practised
  | 'quizzes' // Play & Learn plays credited
  | 'lessons' // lessons finished (credited)
  | 'practiceSessions' // voice-practice sessions with at least one step (credited)
  | 'routineSteps' // My Day steps credited
  | 'offlineConfirmed' // away-from-screen activities or homework a grown-up confirmed
  | 'stars' // stars earned in total (never reduced by spending)
  | 'streak'; // consecutive practice days

export type Condition =
  | { kind: 'metric'; metric: CollectionMetric; at: number }
  /** Reach N collectibles found in total. */
  | { kind: 'collected'; at: number }
  /** Find every collectible of a category. */
  | { kind: 'category'; category: CollectionCategory };

/** Where a locked collectible sends the child. */
export type Destination = 'speech' | 'trace' | 'learn' | 'lessons' | 'mission' | 'talk' | 'myday' | 'activities' | 'voice' | 'progress';

export interface Collectible {
  id: string;
  name: string;
  category: CollectionCategory;
  rarity: Rarity;
  /** Which drawing: a key in `components/adventure/art/collectionArt.tsx`, or `avatar:<id>` / `world:<name>`. */
  art: string;
  /** A short fun fact, shown once it is found. */
  fact: string;
  /** What to do, in words a grown-up can read aloud. */
  hint: string;
  condition: Condition;
  destination: Destination;
  /** One of the five the app had before; kept with its original milestone. */
  legacy?: boolean;
}

export const CATEGORIES: { id: CollectionCategory; label: string; emoji: string }[] = [
  { id: 'companions', label: 'Companions', emoji: '🧑‍🚀' },
  { id: 'planets', label: 'Planets & Moons', emoji: '🪐' },
  { id: 'vehicles', label: 'Space Vehicles', emoji: '🚀' },
  { id: 'discoveries', label: 'Cosmic Discoveries', emoji: '☄️' },
  { id: 'equipment', label: 'Space Equipment', emoji: '🛰️' },
  { id: 'special', label: 'Special Discoveries', emoji: '✨' },
];

export const RARITIES: { id: Rarity; label: string; color: string }[] = [
  { id: 'common', label: 'Common', color: '#9FB0DA' },
  { id: 'uncommon', label: 'Uncommon', color: '#5BD98A' },
  { id: 'rare', label: 'Rare', color: '#4D9BE8' },
  { id: 'epic', label: 'Epic', color: '#B58CFF' },
  { id: 'legendary', label: 'Legendary', color: '#FFC933' },
];

const m = (metric: CollectionMetric, at: number): Condition => ({ kind: 'metric', metric, at });

export const COLLECTION: Collectible[] = [
  // ---- A. Space Companions -------------------------------------------------------------------------------
  { id: 'astro-explorer', name: 'Astro Explorer', category: 'companions', rarity: 'rare', art: 'avatar:astro-explorer', fact: 'Astro Explorer loves meeting new friends on every planet.', hint: 'Do 3 steps of Speech Practice.', condition: m('speechPractice', 3), destination: 'speech' },
  { id: 'cosmo-robot', name: 'Cosmo Robot', category: 'companions', rarity: 'rare', art: 'avatar:cosmo-robot', fact: 'Cosmo glows brighter every time you learn something new.', hint: 'Finish 3 Play & Learn activities.', condition: m('quizzes', 3), destination: 'learn' },
  { id: 'luna-alien', name: 'Luna Alien', category: 'companions', rarity: 'rare', art: 'avatar:luna-alien', fact: 'Luna comes from a moon that hums when friends say hello.', hint: 'Practise 5 different words.', condition: m('words', 5), destination: 'speech' },
  { id: 'galaxy-cat', name: 'Galaxy Cat', category: 'companions', rarity: 'rare', art: 'avatar:galaxy-cat', fact: 'Galaxy Cat can curl up on a crescent moon.', hint: 'Finish 3 lessons.', condition: m('lessons', 3), destination: 'lessons' },
  { id: 'astro-dog', name: 'Astro Dog', category: 'companions', rarity: 'rare', art: 'astro-dog', fact: 'Astro Dog sniffs out shiny stars across the galaxy.', hint: 'Finish 2 Listen & Talk practice sessions.', condition: m('practiceSessions', 2), destination: 'voice' },
  { id: 'baby-martian', name: 'Baby Martian', category: 'companions', rarity: 'uncommon', art: 'baby-martian', fact: 'Baby Martian giggles whenever a rocket flies by.', hint: 'Practise 8 different sounds.', condition: m('sounds', 8), destination: 'speech' },
  { id: 'space-bunny', name: 'Space Bunny', category: 'companions', rarity: 'rare', art: 'space-bunny', fact: 'Space Bunny hops extra high where gravity is small.', hint: 'Finish 10 Play & Learn activities.', condition: m('quizzes', 10), destination: 'learn' },
  { id: 'cosmic-panda', name: 'Cosmic Panda', category: 'companions', rarity: 'epic', art: 'cosmic-panda', fact: 'Cosmic Panda snacks on star-shaped bamboo.', hint: 'Practise 5 days in a row.', condition: m('streak', 5), destination: 'progress' },

  // ---- B. Planets and Moons --------------------------------------------------------------------------------
  { id: 'earth', name: 'Earth', category: 'planets', rarity: 'common', art: 'world:earth', fact: 'Earth is our home, covered in blue oceans.', hint: 'Say BA, BE, BI, BO and BU.', condition: m('baRowSyllables', 5), destination: 'speech', legacy: true },
  { id: 'moon', name: 'Moon', category: 'planets', rarity: 'common', art: 'world:moon', fact: 'The Moon travels around the Earth.', hint: 'Finish a tracing page.', condition: m('tracingSessions', 1), destination: 'trace', legacy: true },
  { id: 'mars', name: 'Mars', category: 'planets', rarity: 'common', art: 'mars', fact: 'Mars is called the Red Planet.', hint: 'Practise 3 different sounds.', condition: m('sounds', 3), destination: 'speech' },
  { id: 'jupiter', name: 'Jupiter', category: 'planets', rarity: 'common', art: 'jupiter', fact: 'Jupiter is the biggest planet of all.', hint: 'Finish a Play & Learn activity.', condition: m('quizzes', 1), destination: 'learn' },
  { id: 'saturn', name: 'Saturn', category: 'planets', rarity: 'common', art: 'world:saturn', fact: 'Saturn has beautiful rings.', hint: 'Complete a Daily Mission.', condition: m('missionDays', 1), destination: 'mission', legacy: true },
  { id: 'neptune', name: 'Neptune', category: 'planets', rarity: 'common', art: 'neptune', fact: 'Neptune is a deep blue, windy planet.', hint: 'Practise 3 different words.', condition: m('words', 3), destination: 'speech' },
  { id: 'venus', name: 'Venus', category: 'planets', rarity: 'common', art: 'venus', fact: 'Venus shines like a bright golden star.', hint: 'Finish a lesson.', condition: m('lessons', 1), destination: 'lessons' },
  { id: 'mercury', name: 'Mercury', category: 'planets', rarity: 'common', art: 'mercury', fact: 'Mercury is the closest planet to the Sun.', hint: 'Finish 2 tracing pages.', condition: m('tracingSessions', 2), destination: 'trace' },

  // ---- C. Space Vehicles ---------------------------------------------------------------------------------------
  { id: 'rocket', name: 'Rocket', category: 'vehicles', rarity: 'uncommon', art: 'world:rocket', fact: 'Rockets zoom up past the clouds into space.', hint: 'Say 10 things with Talk.', condition: m('talkTaps', 10), destination: 'talk', legacy: true },
  { id: 'space-shuttle', name: 'Space Shuttle', category: 'vehicles', rarity: 'uncommon', art: 'space-shuttle', fact: 'A space shuttle flies up like a rocket and lands like a plane.', hint: 'Finish 3 tracing pages.', condition: m('tracingSessions', 3), destination: 'trace' },
  { id: 'lunar-rover', name: 'Lunar Rover', category: 'vehicles', rarity: 'uncommon', art: 'lunar-rover', fact: 'A lunar rover drives across the dusty Moon.', hint: 'Finish 5 Play & Learn activities.', condition: m('quizzes', 5), destination: 'learn' },
  { id: 'flying-saucer', name: 'Flying Saucer', category: 'vehicles', rarity: 'uncommon', art: 'flying-saucer', fact: 'A flying saucer spins and glows as it hovers.', hint: 'Practise 6 different sounds.', condition: m('sounds', 6), destination: 'speech' },
  { id: 'space-capsule', name: 'Space Capsule', category: 'vehicles', rarity: 'uncommon', art: 'space-capsule', fact: 'A capsule floats back home under big parachutes.', hint: 'Finish 2 lessons.', condition: m('lessons', 2), destination: 'lessons' },
  { id: 'star-cruiser', name: 'Star Cruiser', category: 'vehicles', rarity: 'rare', art: 'star-cruiser', fact: 'The Star Cruiser glides between the stars.', hint: 'Finish 8 tracing pages.', condition: m('tracingSessions', 8), destination: 'trace' },
  { id: 'planet-hopper', name: 'Planet Hopper', category: 'vehicles', rarity: 'uncommon', art: 'planet-hopper', fact: 'A planet hopper bounces from world to world.', hint: 'Finish 8 Play & Learn activities.', condition: m('quizzes', 8), destination: 'learn' },
  { id: 'cosmic-explorer-ship', name: 'Cosmic Explorer Ship', category: 'vehicles', rarity: 'rare', art: 'cosmic-explorer-ship', fact: 'This ship has explored the whole galaxy.', hint: 'Finish 5 lessons.', condition: m('lessons', 5), destination: 'lessons' },

  // ---- D. Cosmic Discoveries -----------------------------------------------------------------------------------
  { id: 'golden-star', name: 'Golden Star', category: 'discoveries', rarity: 'common', art: 'world:star', fact: 'A golden star lights up the dark.', hint: 'Practise your first sound.', condition: m('speechPractice', 1), destination: 'speech', legacy: true },
  { id: 'shooting-star', name: 'Shooting Star', category: 'discoveries', rarity: 'rare', art: 'shooting-star', fact: 'A shooting star is a tiny rock glowing as it zooms.', hint: 'Practise 2 different words.', condition: m('words', 2), destination: 'speech' },
  { id: 'meteor', name: 'Meteor', category: 'discoveries', rarity: 'rare', art: 'meteor', fact: 'A meteor is a space rock that sparkles in the sky.', hint: 'Practise 4 different sounds.', condition: m('sounds', 4), destination: 'speech' },
  { id: 'comet', name: 'Comet', category: 'discoveries', rarity: 'rare', art: 'comet', fact: 'A comet has a long, glowing tail.', hint: 'Finish 5 tracing pages.', condition: m('tracingSessions', 5), destination: 'trace' },
  { id: 'galaxy-crystal', name: 'Galaxy Crystal', category: 'discoveries', rarity: 'rare', art: 'galaxy-crystal', fact: 'Galaxy crystals hold a tiny swirl of stars inside.', hint: 'Finish 4 lessons.', condition: m('lessons', 4), destination: 'lessons' },
  { id: 'cosmic-diamond', name: 'Cosmic Diamond', category: 'discoveries', rarity: 'rare', art: 'cosmic-diamond', fact: 'A cosmic diamond sparkles in every colour.', hint: 'Earn 50 stars in total.', condition: m('stars', 50), destination: 'progress' },
  { id: 'nebula-orb', name: 'Nebula Orb', category: 'discoveries', rarity: 'rare', art: 'nebula-orb', fact: 'A nebula orb is a little cloud of colourful space dust.', hint: 'Finish 3 Listen & Talk practice sessions.', condition: m('practiceSessions', 3), destination: 'voice' },
  { id: 'black-hole', name: 'Black Hole Discovery', category: 'discoveries', rarity: 'epic', art: 'black-hole', fact: 'A black hole pulls in everything nearby, even light!', hint: 'Practise 20 different sounds.', condition: m('sounds', 20), destination: 'speech' },

  // ---- E. Space Equipment --------------------------------------------------------------------------------------
  { id: 'astronaut-helmet', name: 'Astronaut Helmet', category: 'equipment', rarity: 'uncommon', art: 'astronaut-helmet', fact: 'A helmet gives astronauts air to breathe.', hint: 'Practise 2 different sounds.', condition: m('sounds', 2), destination: 'speech' },
  { id: 'jetpack', name: 'Jetpack', category: 'equipment', rarity: 'uncommon', art: 'jetpack', fact: 'A jetpack lets an astronaut float and fly.', hint: 'Finish 4 tracing pages.', condition: m('tracingSessions', 4), destination: 'trace' },
  { id: 'space-suit', name: 'Space Suit', category: 'equipment', rarity: 'uncommon', art: 'space-suit', fact: 'A space suit keeps astronauts safe and cosy.', hint: 'Finish 2 Play & Learn activities.', condition: m('quizzes', 2), destination: 'learn' },
  { id: 'moon-boots', name: 'Moon Boots', category: 'equipment', rarity: 'uncommon', art: 'moon-boots', fact: 'Moon boots leave big footprints in the dust.', hint: 'Practise 4 different words.', condition: m('words', 4), destination: 'speech' },
  { id: 'satellite', name: 'Satellite', category: 'equipment', rarity: 'uncommon', art: 'satellite', fact: 'Satellites circle the Earth sending signals home.', hint: 'Finish a Listen & Talk practice session.', condition: m('practiceSessions', 1), destination: 'voice' },
  { id: 'space-telescope', name: 'Space Telescope', category: 'equipment', rarity: 'uncommon', art: 'space-telescope', fact: 'A space telescope spots galaxies far, far away.', hint: 'Finish 4 Play & Learn activities.', condition: m('quizzes', 4), destination: 'learn' },
  { id: 'robot-companion', name: 'Robot Companion', category: 'equipment', rarity: 'uncommon', art: 'robot-companion', fact: 'A robot companion helps on long space trips.', hint: 'Finish 6 Play & Learn activities.', condition: m('quizzes', 6), destination: 'learn' },
  { id: 'space-backpack', name: 'Space Backpack', category: 'equipment', rarity: 'uncommon', art: 'space-backpack', fact: 'A backpack carries snacks and star maps.', hint: 'Do 3 steps of My Day.', condition: m('routineSteps', 3), destination: 'myday' },

  // ---- F. Special Discoveries ----------------------------------------------------------------------------------
  { id: 'alien-egg', name: 'Alien Egg', category: 'special', rarity: 'epic', art: 'alien-egg', fact: 'Something is wiggling inside the alien egg!', hint: 'Find 10 collectibles.', condition: { kind: 'collected', at: 10 }, destination: 'progress' },
  { id: 'mystery-planet', name: 'Mystery Planet', category: 'special', rarity: 'epic', art: 'mystery-planet', fact: 'Nobody has ever visited the Mystery Planet. Until now!', hint: 'Complete the Daily Mission on 3 days.', condition: m('missionDays', 3), destination: 'mission' },
  { id: 'treasure-chest', name: 'Cosmic Treasure Chest', category: 'special', rarity: 'epic', art: 'treasure-chest', fact: 'The chest is full of glittering space treasure.', hint: 'Do an activity away from the screen and have a grown-up check it.', condition: m('offlineConfirmed', 1), destination: 'activities' },
  { id: 'golden-rocket', name: 'Golden Rocket', category: 'special', rarity: 'legendary', art: 'golden-rocket', fact: 'The Golden Rocket is the fastest ship in the galaxy.', hint: 'Find every Space Vehicle.', condition: { kind: 'category', category: 'vehicles' }, destination: 'progress' },
  { id: 'rainbow-nebula', name: 'Rainbow Nebula', category: 'special', rarity: 'legendary', art: 'rainbow-nebula', fact: 'The Rainbow Nebula shimmers in every colour.', hint: 'Find 30 collectibles.', condition: { kind: 'collected', at: 30 }, destination: 'progress' },
  { id: 'legendary-badge', name: 'Legendary Galaxy Badge', category: 'special', rarity: 'legendary', art: 'legendary-badge', fact: 'Only the greatest explorers earn the Legendary Galaxy Badge.', hint: 'Find 20 collectibles.', condition: { kind: 'collected', at: 20 }, destination: 'progress' },
];

/** A trophy for finishing a whole category. Not counted among the collectibles: it is the prize for them. */
export const trophyId = (category: CollectionCategory) => `trophy-${category}`;

export function getCollectible(id: string): Collectible | undefined {
  return COLLECTION.find((c) => c.id === id);
}
