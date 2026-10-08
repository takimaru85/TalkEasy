// Checks the adventure theme system. Run: npm run check:themes
//
// The point of the theme architecture is that adding a world is a CONFIG change, so this check is
// what makes that safe: it fails when a theme is incomplete, when two cards in one theme share a
// colour (a child would have to tell them apart by icon alone), when a themed art name has no
// drawing behind it, or when a screen starts naming a world instead of reading its theme.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  CARD_SLOTS,
  EXPLORE_SLOTS,
  THEMES,
  themeFor,
  type CardArt,
  type CardSlot,
} from '../src/adventure/themes';
import { WORLDS, WORLD_IDS, type WorldArtName } from '../src/adventure/worlds';
import { Adventure } from '../src/theme/adventure';
import { readdirSync } from 'node:fs';
import { ACTIVITY_CATEGORY_META } from '../src/constants/school';
import { DEFAULT_SUBJECTS, DEFAULT_THERAPY } from '../src/constants/defaults';
import { NEW_ACTIVITY_DEFAULT_ICON, STOCK_ACTIVITY_ICONS, usesCategoryArt } from '../src/activities/categoryArt';
import { SUBJECT_ART_BY_ICON, subjectArtFor } from '../src/school/subjectArt';
import { WRITING_LEVELS } from '../src/adaptive/handwriting';
import { THERAPY_ACTIVITIES } from '../src/therapy/content';
import { BADGES } from '../src/adventure/badges';
import { LEARNING_SUBJECTS } from '../src/learning';
import { PREMIUM_THEMES, DEFAULT_THEME, THEME_SLOT } from '../src/shop/themes';
import { SPACE_AVATARS } from '../src/shop/avatars';
import { SHOP_ITEMS, methodsFor } from '../src/shop/catalog';
import { LEARN_ACTIVITY_ART, LEARN_SUBJECT_ART } from '../src/learning/activityArt';
import { BADGE_ART } from '../src/adventure/badgeArt';
import { ACTIVITY_ART, STAGE_ART } from '../src/speechpractice/stageArt';
import { SPEECH_STAGES } from '../src/speechpractice/stages';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const homeSource = readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8');
const artSource = {
  dino: readFileSync('src/components/adventure/art/dinoArt.tsx', 'utf8'),
  animal: readFileSync('src/components/adventure/art/animalArt.tsx', 'utf8'),
  vehicle: readFileSync('src/components/adventure/art/vehicleArt.tsx', 'utf8'),
};
const gameIconSource = readFileSync('src/components/adventure/GameIcon.tsx', 'utf8');
const worldArtSource = readFileSync('src/components/adventure/WorldArt.tsx', 'utf8');

/** Every Material Community icon name the app may use, from the real glyphmap. */
const glyphs: Record<string, number> = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');

// ---- Every world has a theme, and every theme belongs to a world --------------------------------
ok(Object.keys(THEMES).length === WORLD_IDS.length, 'one theme per world, no more');
for (const id of WORLD_IDS) {
  const theme = THEMES[id];
  ok(theme !== undefined, `world "${id}" has a theme`);
  if (!theme) continue;
  ok(theme.id === id, `theme "${id}" is keyed by its own id`);
  ok(theme.name.trim().length > 0, `theme "${id}" has a name`);
  ok(themeFor(id) === theme, `themeFor("${id}") returns it`);
  ok(theme.accent in Adventure, `theme "${id}" accent "${theme.accent}" is a real palette colour`);
  ok(theme.locations.length >= 2, `theme "${id}" names at least two places`);

  // ---- Every destination is covered, and told apart by colour AND by art ----------------------
  const used = new Set<string>();
  for (const slot of CARD_SLOTS) {
    const card = theme.cards[slot];
    ok(card !== undefined, `theme "${id}" covers the "${slot}" card`);
    if (!card) continue;
    ok(card.color in Adventure, `theme "${id}" card "${slot}": colour "${card.color}" exists`);
    ok(!used.has(card.color), `theme "${id}" card "${slot}": colour "${card.color}" is not reused by another card`);
    used.add(card.color);
    ok(card.decor.length >= 2 && card.decor.length <= 3, `theme "${id}" card "${slot}": two or three decor marks`);
    for (const d of card.decor) ok(d in glyphs, `theme "${id}" card "${slot}": decor icon "${d}" exists in the glyphmap`);
    checkArt(card.art, `theme "${id}" card "${slot}"`);
  }
  ok(used.size === CARD_SLOTS.length, `theme "${id}": ${CARD_SLOTS.length} cards, ${CARD_SLOTS.length} distinct hues`);

  checkArt(theme.startArt, `theme "${id}" START ADVENTURE art`);

  // An explore override is optional, but one that exists has to be real.
  for (const slot of EXPLORE_SLOTS) {
    const art = theme.explore?.[slot];
    if (art) checkArt(art, `theme "${id}" explore "${slot}"`);
  }

  // ---- The mascot has a drawing ---------------------------------------------------------------
  if (theme.mascot === 'pip') {
    ok(id === 'space', 'only Space uses Pip');
  } else {
    const prefix = theme.mascot === 'rexy' ? 'dino' : theme.mascot === 'leo' ? 'animal' : 'vehicle';
    const fn = theme.mascot === 'rexy' ? 'drawRexy' : theme.mascot === 'leo' ? 'drawLeo' : 'drawBibi';
    ok(artSource[prefix as keyof typeof artSource].includes(`export function ${fn}`), `mascot "${theme.mascot}" is drawn by ${fn}`);
  }
}

/** A theme's art must resolve to a drawing that actually exists in the set it names. */
function checkArt(art: CardArt, where: string): void {
  if (art.kind === 'game') {
    ok(new RegExp(`case '${art.name}'`).test(gameIconSource), `${where}: GameIcon draws "${art.name}"`);
    return;
  }
  if (art.kind === 'world') {
    const names = Object.values(WORLDS).flatMap((w) => [w.emblem, w.missionArt, ...w.collectibles.map((c) => c.art)]);
    ok((names as WorldArtName[]).includes(art.name), `${where}: "${art.name}" is a world's own artwork`);
    ok(new RegExp(`case '${art.name}'`).test(worldArtSource), `${where}: WorldArt draws "${art.name}"`);
    return;
  }
  // A themed name is `<prefix>-<slot>`; the slot must be one the art module switches on.
  const dash = art.name.indexOf('-');
  const prefix = art.name.slice(0, dash) as keyof typeof artSource;
  const slot = art.name.slice(dash + 1);
  ok(prefix in artSource, `${where}: "${art.name}" names a known art module`);
  if (!(prefix in artSource)) return;
  if (slot === 'hero') return; // checked via the mascot above
  ok((CARD_SLOTS as string[]).includes(slot), `${where}: "${slot}" is a real card slot`);
  ok(new RegExp(`case '${slot}'`).test(artSource[prefix]), `${where}: ${prefix}Art draws "${slot}"`);
}

// ---- Every themed art module covers every slot -------------------------------------------------
// Not just the slots a theme happens to reference today: a module missing a slot is a hole that
// appears the moment someone adds that slot to a theme.
for (const [prefix, src] of Object.entries(artSource)) {
  for (const slot of CARD_SLOTS) {
    ok(new RegExp(`case '${slot}'`).test(src), `${prefix}Art covers every slot: "${slot}"`);
  }
}

// ---- The screens read themes; they never name a world ------------------------------------------
// This is the rule that keeps one Home screen instead of four. A screen that branches on a world
// id is the start of DinosaurHomeScreen, so it fails here.
for (const id of WORLD_IDS.filter((w) => w !== 'space')) {
  ok(!new RegExp(`world\\.id === '${id}'`).test(homeSource), `the Home screen does not branch on world "${id}"`);
  ok(!new RegExp(`=== '${id}'`).test(homeSource), `the Home screen does not compare against "${id}" at all`);
}
ok(/const adv = themeFor\(world\.id\)/.test(homeSource), 'the Home screen resolves the active theme once');
// Space is allowed ONE comparison — Pip's helmet, which is a property of the suit, not the layout.
ok(
  (homeSource.match(/world\.id === 'space'/g) ?? []).length === 0,
  'even Space is read from its theme rather than compared by id',
);
// The illustrations on the cards must come from the theme, not from literals in the markup.
for (const slot of CARD_SLOTS) {
  ok(!new RegExp(`art="${slot}"`).test(homeSource), `the Home screen does not hard-code art="${slot}"`);
}
for (const colour of Object.keys(Adventure)) {
  ok(!new RegExp(`color="${colour}"`).test(homeSource), `the Home screen does not hard-code color="${colour}"`);
}

// ---- the colourful icon sets (ColorArt) -------------------------------------------------------------
// The lists used to draw stock single-colour glyphs; they now draw illustrations. Four rules keep that
// honest: every item that is meant to have a drawing HAS one (so a new category, subject, level or
// activity cannot be added without its art), a grown-up's own choice is never overridden, Parent Mode
// stays plain, and nothing falls back to a blank disc.
const art = (f: string) => readFileSync(`src/components/adventure/art/${f}.tsx`, 'utf8');
const has = (src: string, key: string) => src.includes(`case '${key}':`);
const categoryArt = art('categoryArt');
const subjectArt = art('subjectArt');
const levelArt = art('levelArt');
const therapyArt = art('therapyArt');

for (const k of Object.keys(ACTIVITY_CATEGORY_META)) {
  ok(k === 'games' || has(categoryArt, k), `the ${k} category has a drawing (Games reuses the controller)`);
}
ok(has(categoryArt, 'therapy'), 'the Therapy entry above the categories has a drawing');
for (const sub of DEFAULT_SUBJECTS) {
  const name = SUBJECT_ART_BY_ICON[sub.icon];
  ok(!!name, `the ${sub.name} subject's stored icon maps to a drawing`);
  ok(!!name && has(subjectArt, name.replace('subject:', '')), `${sub.name}: the drawing ${name} exists`);
}
for (const l of WRITING_LEVELS) ok(has(levelArt, String(l.art)), `Learn & Trace level ${l.level} has a drawing`);
for (const a of THERAPY_ACTIVITIES) ok(has(therapyArt, a.id), `the ${a.name} therapy activity has a drawing`);

// a grown-up's own icon is never overridden
ok(usesCategoryArt('arm-flex') && NEW_ACTIVITY_DEFAULT_ICON === 'arm-flex', 'the default icon for a new activity gets its category drawing');
for (const a of DEFAULT_THERAPY) ok(usesCategoryArt(a.icon), `the seeded ${a.name} activity shows its category drawing`);
ok(!usesCategoryArt('star-circle') && !usesCategoryArt('rocket'), 'an icon a grown-up picked themselves is not replaced');
ok(STOCK_ACTIVITY_ICONS.size <= DEFAULT_THERAPY.length + 1, 'only the seeded icons and the default are treated as stock');
ok(subjectArtFor('rocket') === undefined && subjectArtFor('') === undefined && subjectArtFor(null) === undefined, 'a subject with an icon of its own keeps that icon');
const editor = readFileSync('src/screens/parent/EditTherapyScreen.tsx', 'utf8');
ok(editor.includes(`useState('${NEW_ACTIVITY_DEFAULT_ICON}')`), 'a new activity really does start with the default icon the rule expects');
const list = readFileSync('src/screens/child/ActivitiesScreen.tsx', 'utf8');
ok(list.indexOf('open.imageUri') >= 0 && list.indexOf('ex.imageUri ?') < list.indexOf('usesCategoryArt(ex.icon)'), 'a photo a grown-up attached outranks the category drawing in the list');
const subj = readFileSync('src/components/school/SubjectIcon.tsx', 'utf8');
ok(subj.includes('<Icon name={icon}'), 'a subject without a drawing falls back to its own icon');

// Parent Mode stays plain, so a child can tell the two halves of the app apart
const parentFiles = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? parentFiles(`${dir}/${e.name}`) : e.name.endsWith('.tsx') ? [`${dir}/${e.name}`] : []));
for (const f of parentFiles('src/screens/parent')) {
  const src = readFileSync(f, 'utf8');
  ok(!/ColorArt|SubjectIcon/.test(src), `${f} stays plain: no colourful art in Parent Mode`);
}
// ---- Achievements: every badge wears a drawing ---------------------------------------------------------
const statArt = art('statArt');
for (const b of BADGES) {
  const named = BADGE_ART[b.id];
  ok(!!named, `the ${b.title} badge has an illustration`);
  const [set, key] = (named ?? ':').split(':');
  const drawn = set === 'stat' ? ['speech', 'words', 'tracing', 'trophy'].includes(key) || has(statArt, key) : set === 'category' ? key === 'games' || has(categoryArt, key) : false;
  ok(drawn, `the ${b.title} badge's drawing "${named}" exists`);
}
ok(Object.keys(BADGE_ART).every((id) => BADGES.some((b) => b.id === id)), 'no illustration is named for a badge that does not exist');
// ---- Speech Practice: every stage wears a drawing -------------------------------------------------------
for (const stage of SPEECH_STAGES) {
  const named = STAGE_ART[stage.id];
  ok(!!named, `the ${stage.id} stage has an illustration`);
  const [set, key] = (named ?? ':').split(':');
  const drawn =
    set === 'stat' ? ['speech', 'words', 'tracing', 'trophy'].includes(key) || has(art('statArt'), key)
    : set === 'subject' ? has(art('subjectArt'), key)
    : set === 'category' ? key === 'games' || has(categoryArt, key)
    : false;
  ok(drawn, `the ${stage.id} stage's drawing "${named}" exists`);
}
// ---- Speech Practice: every ACTIVITY wears a drawing ----------------------------------------------------------
const practiceArt = art('practiceArt');
const REUSED = ['practice:rhythm', 'practice:phrases', 'practice:voice', 'practice:stories']; // drawn elsewhere, aliased in ColorArt
for (const stage of SPEECH_STAGES) {
  for (const m of stage.members) {
    const named = ACTIVITY_ART[m.id];
    ok(!!named, `the ${m.id} activity (${stage.id}) has an illustration`);
    const key = (named ?? ':').split(':')[1];
    ok(!!named && (REUSED.includes(named) || has(practiceArt, key)), `the ${m.id} activity's drawing "${named}" exists`);
  }
}
const aliasSrc = readFileSync('src/components/adventure/ColorArt.tsx', 'utf8');
for (const r of REUSED) ok(aliasSrc.includes(`'${r}':`), `${r} is aliased to a drawing the app already has`);
ok(Object.keys(ACTIVITY_ART).every((id) => SPEECH_STAGES.some((st) => st.members.some((m) => m.id === id))), 'no illustration is named for an activity that is not in a stage');

// ---- Play & Learn: every shipped subject and activity has a drawing, and the screens use them -------
{
  const learnArt = readFileSync('src/components/adventure/art/learnArt.tsx', 'utf8');
  for (const sub of LEARNING_SUBJECTS) {
    ok(LEARN_SUBJECT_ART[sub.key], `Play & Learn subject ${sub.key} has a drawing`);
    for (const a of sub.activities) {
      const art = LEARN_ACTIVITY_ART[a.key];
      ok(art, `Play & Learn activity ${a.key} has a drawing`);
      if (art?.startsWith('learn:')) ok(learnArt.includes(`case '${art.slice(6)}':`), `${a.key}: ${art} is drawn in learnArt.tsx`);
    }
  }
  const allKeys = new Set(LEARNING_SUBJECTS.flatMap((x) => x.activities.map((a) => a.key)));
  ok(Object.keys(LEARN_ACTIVITY_ART).every((k) => allKeys.has(k)), 'no drawing is named for an activity that does not exist');
  const lsub = readFileSync('src/screens/child/LearnSubjectScreen.tsx', 'utf8');
  const lact = readFileSync('src/screens/child/LearnActivityScreen.tsx', 'utf8');
  const lhome = readFileSync('src/screens/child/LearnScreen.tsx', 'utf8');
  ok(lsub.includes('colorArt={LEARN_ACTIVITY_ART[a.key]}') && lsub.includes('colorArt={LEARN_SUBJECT_ART[subject.key]}'), 'the subject screen draws the subject and each activity');
  ok(lact.includes('colorArt={LEARN_ACTIVITY_ART[activity.key]}'), 'the activity screen header wears the activity drawing');
  ok(lhome.includes('colorArt={art}'), 'the Play & Learn cards draw each subject');
}
// ---- Premium themes: configured, dark enough for white text, drawn, and applied from ONE place --------
{
  const sources = readFileSync('src/components/adventure/themeBackgrounds.ts', 'utf8');
  const seen = new Map<string, string>();
  /** The file is registered with a static require, exists, is a 941 x 1672 WebP, and is not a copy of another theme's. */
  const checkPicture = (file: string, who: string): boolean => {
    const path = `assets/backgrounds/${file}`;
    if (!sources.includes(`'${file}': require('../../../assets/backgrounds/${file}')`)) return false;
    let buf: Buffer;
    try { buf = readFileSync(path); } catch { return false; }
    if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP' || buf.toString('ascii', 12, 16) !== 'VP8X') return false;
    const w = 1 + buf.readUIntLE(24, 3);
    const h = 1 + buf.readUIntLE(27, 3);
    if (w !== 941 || h !== 1672) return false;
    const hash = createHash('sha1').update(buf).digest('hex');
    if (seen.has(hash)) return false; // two themes sharing one picture would be a silent substitution
    seen.set(hash, who);
    return true;
  };
  ok(checkPicture(DEFAULT_THEME.background.file, 'space-default'), 'Space Explorer: its supplied picture is registered, on disk, 941 x 1672 and its own');
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const scene = readFileSync('src/components/adventure/ThemeScene.tsx', 'utf8');
  const bg = readFileSync('src/components/adventure/WorldBackground.tsx', 'utf8');
  ok(DEFAULT_THEME.name === 'Space Explorer', 'the free default theme is Space Explorer');
  ok(new Set(PREMIUM_THEMES.map((t) => t.id)).size === PREMIUM_THEMES.length && new Set(PREMIUM_THEMES.map((t) => t.itemId)).size === PREMIUM_THEMES.length, 'theme ids are unique');
  for (const t of PREMIUM_THEMES) {
    ok(t.itemId === `theme-${t.id}`, `${t.id}: item id follows the theme id`);
    ok(t.stars === undefined || (Number.isInteger(t.stars) && t.stars > 0), `${t.id}: star price is a positive whole number when set`);
    ok(t.stars !== undefined || t.cash, `${t.id}: can be had some way`);
    ok(SHOP_ITEMS.some((i) => i.id === t.itemId && i.themeId === t.id && i.category === 'themes' && methodsFor(i).length > 0), `${t.id}: is a shop item in the Themes category`);
    // Either the SUPPLIED picture (a registered file on disk) or, for the older vector worlds, a drawn scene.
    ok(!!t.background && checkPicture(t.background.file, t.id), `${t.id}: has its supplied background picture (registered, on disk, 941 x 1672, its own)`);
    ok(!t.background || (t.background.scrim >= 0 && t.background.scrim <= 0.6), `${t.id}: the readability veil is subtle (0 to 0.6)`);
    // The sky sits under white text and glass cards: it must stay dark, like every free world.
    ok(lum(t.palette.top) < 0.06 && lum(t.palette.bottom) < 0.03, `${t.id}: the sky is dark enough for white text`);
  }
  ok(PREMIUM_THEMES.some((t) => t.stars !== undefined && t.cash) && PREMIUM_THEMES.some((t) => t.stars !== undefined && !t.cash), 'themes cover stars-only and stars-or-cash');
  ok(bg.includes('useActiveShopTheme()') && bg.includes('<ThemeScene'), 'every child screen and Home get the active theme through WorldBackground');
  ok(readFileSync('src/components/common/ScreenContainer.tsx', 'utf8').includes('<WorldBackground'), 'ScreenContainer draws its sky through WorldBackground');
  ok(readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8').includes('<WorldBackground'), 'Home draws its sky through WorldBackground');
  ok(!/ThemeScene|useActiveShopTheme/.test(readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8')), 'no screen names a premium theme');
  ok(THEME_SLOT === 'theme', 'the theme slot is stable');
  const sc = readFileSync('src/context/ShopThemeContext.tsx', 'utf8');
  ok(sc.includes('activeThemeFrom'), 'the provider only activates an OWNED theme');
}
// ---- Space avatars and the four space themes -----------------------------------------------------------------------
{
  const art = readFileSync('src/components/adventure/AvatarArt.tsx', 'utf8');
  const avSources = readFileSync('src/components/adventure/avatarImages.ts', 'utf8');
  const avSeen = new Set<string>();
  const checkAvatarPicture = (file: string, who: string): boolean => {
    if (!avSources.includes(`'${file}': require('../../../assets/avatars/${file}')`)) return false;
    let buf: Buffer;
    try { buf = readFileSync(`assets/avatars/${file}`); } catch { return false; }
    if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP' || buf.toString('ascii', 12, 16) !== 'VP8X') return false;
    if (1 + buf.readUIntLE(24, 3) !== 512 || 1 + buf.readUIntLE(27, 3) !== 512) return false;
    const hash = createHash('sha1').update(buf).digest('hex');
    if (avSeen.has(hash)) return false; // two avatars sharing one picture would be a silent substitution
    avSeen.add(hash);
    return !!who;
  };
  ok(art.includes('AVATAR_SOURCES') && art.includes('resizeMode="contain"'), 'avatars draw the official picture, contained (never stretched or cropped)');
  for (const a of SPACE_AVATARS) {
    if (a.image) ok(checkAvatarPicture(a.image, a.id), `${a.name}: official picture ${a.image} is registered, on disk, 512 x 512 WebP and its own`);
    else console.log(`NOTE ${a.name}: no official picture supplied yet — shows the temporary stand-in (assets/avatars/${a.id}.webp)`);
    ok(a.free || (Number.isInteger(a.stars) && (a.stars as number) > 0), `${a.name}: priced, or the free starter`);
    ok(a.free || SHOP_ITEMS.some((i) => i.avatarId === a.id && i.category === 'avatars'), `${a.name} is a shop item`);
  }
  ok(['Astro Explorer', 'Cosmo Robot', 'Luna Alien', 'Rocket Buddy', 'Galaxy Cat'].every((n) => SPACE_AVATARS.some((a) => a.name === n)), 'the five requested avatars exist');
  const spaceThemes = PREMIUM_THEMES.filter((t) => t.family === 'space').map((t) => t.name);
  ok(['Moon Base', 'Nebula Dreams', 'Planet Explorer', 'Cosmic Adventure'].every((n) => spaceThemes.includes(n)), 'the four space themes exist');
  const mascot = readFileSync('src/components/adventure/Mascot.tsx', 'utf8');
  ok(mascot.includes('useActiveAvatar()') && mascot.includes('<AvatarArt'), 'the mascot spots draw the equipped avatar');
  ok(readFileSync('src/components/onboarding/TourOverlay.tsx', 'utf8').includes('pip'), 'the first-run tour still introduces Pip');
}

// ---- Space Explorer icon set: every destination the Space theme draws has a space drawing ----------------
{
  const spaceSrc = readFileSync('src/components/adventure/art/spaceArt.tsx', 'utf8');
  const list = /SPACE_ICON_NAMES = \[([\s\S]*?)\] as const/.exec(spaceSrc)?.[1] ?? '';
  const drawn = [...list.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
  ok(drawn.length >= 12, 'the Space icon set lists its icons');
  for (const n of drawn) ok(new RegExp(`case '${n}':`).test(spaceSrc), `spaceArt draws '${n}'`);
  const space = themeFor('space');
  const used = new Set<string>();
  for (const slot of CARD_SLOTS) { const art = space.cards[slot].art; if (art.kind === 'game') used.add(art.name); }
  if (space.startArt.kind === 'game') used.add(space.startArt.name);
  for (const slot of EXPLORE_SLOTS) { const art = space.explore?.[slot]; if (art && art.kind === 'game') used.add(art.name); }
  for (const n of used) ok(drawn.includes(n), `Space Home draws '${n}' with the space icon, not the classic one`);
  const gi = readFileSync('src/components/adventure/GameIcon.tsx', 'utf8');
  ok(gi.includes('useIconSet()') && gi.includes('drawSpace('), 'GameIcon picks the space set through useIconSet');
  ok(readFileSync('src/components/adventure/ColorArt.tsx', 'utf8').includes('useIconSet()'), 'ColorArt puts its list drawings in orbit through useIconSet');
  const hook = readFileSync('src/components/adventure/useIconSet.ts', 'utf8');
  ok(hook.includes("family === 'space' ? 'space' : 'classic'") && hook.includes("=== 'space' ? 'space' : 'classic'"), 'a non-space premium theme or another world keeps the classic set, so no rockets on an Ocean screen');
}
const counts = `${WORLD_IDS.length} themes, ${CARD_SLOTS.length} cards each`;
console.log(problems === 0 ? `Themes OK — ${counts}` : `${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
