// Space Pet rules (pure) plus a few source guards for the component. Run: npm run check:pet
import { readFileSync } from 'node:fs';
import { evaluateMap } from '../src/adventure/adventureMap';
import { SHOP_CATEGORIES, SHOP_ITEMS } from '../src/shop/catalog';
import {
  COSMETICS,
  PET_MESSAGES,
  moodFor,
  parseEquipped,
  petShopEntries,
  petMessage,
  reactionFor,
  toggleCosmetic,
  unlockedCosmetics,
} from '../src/adventure/pet';

const fails: string[] = [];
const eq = (l: string, g: unknown, w: unknown) => { if (g !== w) fails.push(`${l}: got ${g}, want ${w}`); };

// ---- reactions ---------------------------------------------------------------------------------
eq('first look is silent', reactionFor(null, { sounds: 3, exercises: 40 }), null);
eq('nothing changed -> no reaction (reopen / refresh)', reactionFor({ sounds: 3, exercises: 40 }, { sounds: 3, exercises: 40 }), null);
eq('a completed exercise -> happy', reactionFor({ sounds: 3, exercises: 40 }, { sounds: 3, exercises: 41 }), 'happy');
eq('repeating an activity never fires new-sound', reactionFor({ sounds: 3, exercises: 40 }, { sounds: 3, exercises: 45 }), 'happy');
eq('a genuinely new sound -> newSound', reactionFor({ sounds: 3, exercises: 40 }, { sounds: 4, exercises: 41 }), 'newSound');
eq('new sound wins over happy', reactionFor({ sounds: 0, exercises: 0 }, { sounds: 1, exercises: 2 }), 'newSound');
eq('a count going DOWN is never a celebration', reactionFor({ sounds: 5, exercises: 50 }, { sounds: 4, exercises: 49 }), null);

// duplicate-event prevention: the consumer moves its baseline after each reaction.
let last: { sounds: number; exercises: number } | null = null;
const seen: (string | null)[] = [];
for (const now of [{ sounds: 2, exercises: 10 }, { sounds: 2, exercises: 10 }, { sounds: 3, exercises: 11 }, { sounds: 3, exercises: 11 }, { sounds: 3, exercises: 11 }]) {
  seen.push(reactionFor(last, now));
  last = now;
}
eq('each increase reacts once, repeats of the same counts do not', seen.join(','), ',,newSound,,');

// ---- messages and mood ---------------------------------------------------------------------------
eq('mood for newSound', moodFor('newSound'), 'celebrate');
eq('mood for happy', moodFor('happy'), 'happy');
eq('mood for none', moodFor(null), 'idle');
eq('new-sound line', petMessage('newSound'), 'You learned a new sound!');
const allText = [...PET_MESSAGES.idle, ...PET_MESSAGES.happy, ...PET_MESSAGES.newSound, ...COSMETICS.map((c) => c.hint)].join(' ');
eq('no pressure, failure or guilt language', /sad|sick|hungry|miss(ed|ing) you|lonely|streak|behind|fail|wrong|lost|hurry|must|perfect/i.test(allText), false);

// ---- cosmetics -----------------------------------------------------------------------------------
const none = { wordsPractised: 0, soundsPractised: 0, targetSteps: 0, speechExercises: 0 };
const all = { wordsPractised: 5, soundsPractised: 5, targetSteps: 12, speechExercises: 30 };
eq('a new child owns nothing', unlockedCosmetics(evaluateMap(none), 0).size, 0);
eq('first sound -> explorer hat only', [...unlockedCosmetics(evaluateMap(none), 1)].join(), 'explorer-hat');
const u1 = unlockedCosmetics(evaluateMap({ ...none, wordsPractised: 5 }), 0);
eq('First Words planet -> star antenna + gold visor', [...u1].join(), 'star-antenna,gold-visor');
eq('everything done -> the seven map rewards plus the extras 5 sounds earn', unlockedCosmetics(evaluateMap(all), 5).size, 11);
eq('every accessory is earnable', unlockedCosmetics(evaluateMap(all), 99).size, COSMETICS.length);
const fw = unlockedCosmetics(evaluateMap({ ...none, wordsPractised: 5 }), 0);
eq('First Words -> gold visor, not galaxy suit', fw.has('gold-visor') && !fw.has('galaxy-suit'), true);
eq('three of four stages -> no galaxy suit', unlockedCosmetics(evaluateMap({ ...all, speechExercises: 0 }), 5).has('galaxy-suit'), false);
eq('all four stages -> galaxy suit', unlockedCosmetics(evaluateMap(all), 0).has('galaxy-suit'), true);
eq('no progress -> neither new item', unlockedCosmetics(evaluateMap(none), 0).size, 0);
eq('unlocking is read from counts: no clock involved', unlockedCosmetics.length, 2);

const unlockedAll = unlockedCosmetics(evaluateMap(all), 5);
eq('equip an unlocked item', toggleCosmetic('', 'scarf', unlockedAll), 'scarf');
eq('toggling again takes it off', toggleCosmetic('scarf', 'scarf', unlockedAll), '');
eq('a locked item cannot be worn', toggleCosmetic('', 'helmet', new Set(['scarf'])), '');
eq('an unknown id cannot be worn', toggleCosmetic('', 'crown', unlockedAll), '');
eq('one item per slot: helmet replaces hat', toggleCosmetic('explorer-hat', 'helmet', unlockedAll), 'helmet');
eq('new head item replaces the old helmet', toggleCosmetic('helmet', 'gold-visor', unlockedAll), 'gold-visor');
eq('new body item replaces the old suit', toggleCosmetic('space-suit', 'galaxy-suit', unlockedAll), 'galaxy-suit');
eq('locked gold visor cannot be worn', toggleCosmetic('', 'gold-visor', new Set(['helmet'])), '');
eq('different slots combine', toggleCosmetic('scarf', 'star-antenna', unlockedAll), 'scarf,star-antenna');
eq('saved list drops locked and unknown, never throws', parseEquipped('helmet,crown,scarf,,', new Set(['scarf'])).join(), 'scarf');
eq('saved list keeps one per slot', parseEquipped('explorer-hat,helmet', unlockedAll).join(), 'explorer-hat');
eq('persisted text round-trips', parseEquipped(toggleCosmetic('scarf', 'space-suit', unlockedAll), unlockedAll).join(), 'scarf,space-suit');

// ---- inactivity: the pet has no clock, so a long absence cannot change anything ------------------
const before = JSON.stringify([...unlockedCosmetics(evaluateMap(all), 5)]);
const realNow = Date.now;
(Date as unknown as { now: () => number }).now = () => realNow() + 1000 * 60 * 60 * 24 * 365 * 5;
const after = JSON.stringify([...unlockedCosmetics(evaluateMap(all), 5)]);
(Date as unknown as { now: () => number }).now = realNow;
eq('five years of inactivity change nothing (items kept, no penalty)', after, before);
eq('an unchanged count after a long gap still reacts to nothing', reactionFor({ sounds: 2, exercises: 9 }, { sounds: 2, exercises: 9 }), null);

// ---- Rewards Shop: pet accessories and category rules --------------------------------------------
const entries = petShopEntries(new Set(['scarf', 'helmet']), ['scarf']);
eq('shop lists every accessory', entries.length, COSMETICS.length);
eq('worn -> Equipped', entries.find((e) => e.id === 'scarf')?.status, 'equipped');
eq('earned but not worn -> Unlocked', entries.find((e) => e.id === 'helmet')?.status, 'unlocked');
eq('not earned -> Locked, with a friendly hint', entries.find((e) => e.id === 'explorer-hat')?.status + '|' + (entries.find((e) => e.id === 'explorer-hat')?.hint ?? ''), 'locked|Practise your first sound.');
eq('a new child sees everything locked', petShopEntries(new Set(), []).every((e) => e.status === 'locked'), true);
eq('every shop category has items (no empty tab)', SHOP_CATEGORIES.every((c) => SHOP_ITEMS.some((i) => i.category === c.id)), true);
eq('friendly category names', SHOP_CATEGORIES.map((c) => c.label).slice(0, 2).join(), 'Space Avatars,Background Themes');
eq('no shop item is both free and priced', SHOP_ITEMS.every((i) => !(i.free && (i.stars || i.cash))), true);
const shop = readFileSync('src/screens/child/RewardsShopScreen.tsx', 'utf8');
eq('pet accessories take no stars: the star path is buy() on shop items only', shop.includes('petShopEntries') && shop.split('shopRepo.buy(').length === 2, true);
eq('real money stays behind the Parent PIN gate', shop.includes("method === 'cash' ? 'gate' : 'confirm'") && shop.includes('REAL-MONEY PURCHASE'), true);
eq('repeat taps are blocked while a purchase is in flight', shop.includes("pending.step === 'working') return"), true);
eq('too few stars gives a kind nudge, not a refusal', shop.includes('Keep practising to earn more stars!'), true);

// ---- component guards (the project's pattern for UI rules Node cannot render) -----------------------
const pet = readFileSync('src/components/adventure/SpacePet.tsx', 'utf8');
const card = readFileSync('src/components/adventure/PetCard.tsx', 'utf8');
eq('pet honours reduced motion (hook used)', pet.includes('useReducedMotion()'), true);
eq('bob loop stops under reduced motion', pet.includes('if (reduced || !focused) {') && pet.includes('bob.setValue(0)'), true);
eq('hop and wiggle are skipped under reduced motion', pet.includes('if (reduced) return;') && pet.indexOf('if (reduced) return;') < pet.indexOf("mood === 'happy'"), true);
eq('idle loop only runs while the screen is in front', pet.includes('useIsFocused()') && pet.includes('!focused'), true);
eq('picture and cosmetics render regardless of motion', pet.includes('<Image source={PET_IMAGE}') && pet.includes('DRAW_ORDER.filter') && !pet.includes('if (reduced) return null'), true);
eq('image is contained, transparent, with no background plate', pet.includes('resizeMode="contain"') && !pet.includes("backgroundColor: '#FFFFFF'"), true);
eq('small sizes use the simplified costumes', pet.includes('compact={size < 110}'), true);
eq('card passes its size to the pet and fits text to the room left', card.includes('SpacePet size={petSize}') && card.includes('fitFontSize('), true);

if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('Space pet OK');
