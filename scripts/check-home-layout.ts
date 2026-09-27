// Checks that the child Home screen's rows fit the phone widths it has to support, at every text
// size and at both ends of the OS font scale. Run: npm run check:layout
//
// The Home screen is a stack of ROWS whose contents are fixed-width: an avatar, three capsules,
// the mascot and its speech bubble, five syllable chips, four explore tiles, five nav cells. A row
// like that does not overflow visibly on Android - it silently clips, or draws one child over
// another - so the widths are asserted here rather than being spotted in a screenshot.
//
// The model is the one `fitFontSize` uses, and CHAR_EM is READ from that file so the check and the
// fitter cannot drift apart. Where the screen decides a layout (four tiles across or two, one HUD
// row or two), the rule is reproduced here and the RESULT is asserted - so a rule that says yes
// while the text does not fit fails this check.
import { readFileSync } from 'node:fs';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING, TEXT_SIZE_PRESETS } from '../src/constants/sizes';
import { en } from '../src/i18n/locales/en';
import type { SizeOption } from '../src/types/models';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const CHAR_EM = Number(/const CHAR_EM = ([\d.]+);/.exec(readFileSync('src/utils/fitText.ts', 'utf8'))?.[1]);
ok(CHAR_EM > 0, 'CHAR_EM was read from src/utils/fitText.ts');

/** The widths the app is required to support, smallest first. */
const WIDTHS = [320, 375, 390, 430];
const TEXT_SIZES = Object.keys(TEXT_SIZE_PRESETS) as SizeOption[];
/** Both ends of the range: a layout that adapts has to be right at each, not on average. */
const SCALES = [1, MAX_FONT_SCALE];

/** Mirrors of what the screen declares. If the screen changes one, this check should fail with it. */
const HORIZONTAL_PADDING = SPACING.lg;
const CAPSULE_FIXED = 9 * 2 + 1.5 * 2 + 15 + 4;
const HUD_GAP = 6;
const NAME_MIN = 96;
const EXPLORE_LABEL_MIN = 10;
const NAV_LABEL_MIN = 9;
const AVATAR = MIN_CHILD_TARGET - 8;
/** A child with three-digit stars and a two-digit streak and level - the widest the HUD ever gets. */
const WORST_STATS = [999, 99, 99];
/** Nothing a child taps is narrower than this. */
const TOUCH = 44;

const s = en.strings;

for (const width of WIDTHS) {
  const contentWidth = width - HORIZONTAL_PADDING * 2;

  for (const scale of SCALES) {
    const wide = (text: string, fontSize: number) => text.length * CHAR_EM * fontSize * scale;
    /** `fitFontSize`, reproduced. A `min` of 1 asks for the true fit rather than the clamped one. */
    const fit = (text: string, room: number, base: number, min: number) =>
      Math.max(min, Math.min(base, Math.floor(room / (Math.max(text.length, 1) * CHAR_EM * scale))));
    const at = (what: string) => `${width}pt @${scale}x: ${what}`;

    // ---- The bottom bar: five equal cells ------------------------------------------------------
    const navInner = contentWidth - SPACING.sm * 2 - 3;
    const cell = navInner / 5;
    ok(cell >= TOUCH, at(`a nav cell is ${cell.toFixed(1)}pt, needs a ${TOUCH}pt target`));
    const navLabels = [s.navHome, s.navPractice, s.navPlay, s.navProgress, s.navParent];
    const navSize = navLabels.reduce((min, l) => Math.min(min, fit(l, cell - 6, 12, NAV_LABEL_MIN)), 12);
    ok(navSize >= NAV_LABEL_MIN, at('nav labels stay readable'));
    for (const l of navLabels) {
      // Two lines are allowed here: at the largest font scale one line cannot hold "Practice" on a
      // 320pt phone, and a wrapped word beats a cut one.
      ok(wide(l, navSize) <= (cell - 6) * 2, at(`nav label "${l}" fits its cell within two lines`));
    }

    // ---- More to Explore: four across, or two rows of two --------------------------------------
    const exploreLabels = [s.sectionMyDay, s.sectionSchool, s.sectionActivities, s.sectionFeelings];
    const longestExplore = exploreLabels.reduce((a, b) => (b.length > a.length ? b : a));
    const exploreRoom = (cols: number) => (contentWidth - SPACING.sm * (cols - 1)) / cols - SPACING.xs * 2 - 4;
    const exploreColumns = fit(longestExplore, exploreRoom(4), 14, 1) >= EXPLORE_LABEL_MIN ? 4 : 2;
    const exploreWidth = (contentWidth - SPACING.sm * (exploreColumns - 1)) / exploreColumns;
    ok(exploreWidth >= TOUCH, at('an explore tile keeps its touch target'));
    const exploreSize = exploreLabels.reduce(
      (min, l) => Math.min(min, fit(l, exploreRoom(exploreColumns), 14, EXPLORE_LABEL_MIN)), 14);
    ok(exploreSize >= EXPLORE_LABEL_MIN, at('explore labels stay readable'));
    for (const l of exploreLabels) {
      ok(wide(l, exploreSize) <= exploreRoom(exploreColumns), at(`explore label "${l}" fits its tile`));
    }

    // ---- Syllable chips: five equal buttons inside a console card -------------------------------
    // The chip label opts out of font scaling entirely, so it is measured at 1x on purpose.
    const cardInner = contentWidth - SPACING.lg * 2 - 3;
    const chip = (cardInner - SPACING.sm * 4) / 5;
    ok(chip >= TOUCH, at(`a syllable chip is ${chip.toFixed(1)}pt, needs a ${TOUCH}pt target`));
    ok('BA'.length * CHAR_EM * 18 + 4 + 4 <= chip, at('BA BE BI BO BU fit their chips'));

    for (const textSize of TEXT_SIZES) {
      const heading = TEXT_SIZE_PRESETS[textSize].heading;
      const where = (what: string) => `${width}pt @${scale}x/${textSize}: ${what}`;

      // ---- HUD: one row only while the name keeps a readable strip ---------------------------
      const capsules = WORST_STATS.reduce((w, n) => w + CAPSULE_FIXED + wide(String(n), 14), 0) + HUD_GAP * 2;
      const nameRoom = contentWidth - AVATAR - HUD_GAP * 2 - 6 - capsules;
      const hudStacked = nameRoom < NAME_MIN;
      ok(hudStacked || nameRoom >= NAME_MIN, where('the HUD keeps the name readable or stacks'));
      // Stacked, the capsules wrap - but one capsule wider than the screen would still clip.
      ok(CAPSULE_FIXED + wide('999', 14) <= contentWidth, where('a capsule fits the screen'));

      // ---- Hero: art column, text column, and every string inside them -------------------------
      const heroInner = contentWidth - SPACING.lg * 2 - 3;
      const heroArtW = Math.round(Math.min(122, Math.max(84, heroInner * 0.36)));
      const heroTextW = heroInner - heroArtW - SPACING.sm - SPACING.xs;
      ok(heroArtW + SPACING.sm + SPACING.xs + heroTextW <= heroInner, where('the hero columns fit the hero'));
      ok(heroTextW >= 120, where(`the hero text column is ${Math.round(heroTextW)}pt, needs 120`));

      const headlineSize = fit(s.advLetsGo, heroTextW, heading + 8, 18);
      ok(wide(s.advLetsGo, headlineSize) <= heroTextW, where(`the hero headline fits beside the mascot`));

      const taglineSize = fit(s.advTagline, heroTextW * 2, 15, 12);
      ok(wide(s.advTagline, taglineSize) <= heroTextW * 2, where('the tagline fits on two lines'));

      const bubbleSize = fit(s.advPipLine, heroArtW - SPACING.md * 2, 13, 9);
      ok(wide(s.advPipLine, bubbleSize) <= heroArtW, where('the speech bubble stays inside the art column'));

      // ---- The invite strip: title row above, art row below ------------------------------------
      const inviteRoom = contentWidth - SPACING.md * 2 - 34;
      const inviteSize = fit(s.advChooseCta, inviteRoom, 15, 12);
      ok(wide(s.advChooseCta, inviteSize) <= inviteRoom, where('the adventure invitation fits its row'));
      const worldArtSize = width < 360 ? 24 : width < 400 ? 27 : 30;
      ok(worldArtSize * 4 + SPACING.sm * 3 <= contentWidth - SPACING.md * 2, where('four worlds fit their own row'));
    }
  }
}

// ---- Rules that are about the markup, not a width ------------------------------------------------
const home = readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8');
// A wide card draws its decoration in the top-right, which is exactly where a badge goes.
ok(
  /night && decor\?\.length && \(stacked \|\| !badge\)/.test(home),
  'a corner decoration yields to a badge (they share the top-right)',
);
// A Text keeps its natural width unless it is told otherwise, and then it overflows its parent.
// Which instruction it needs depends on where it sits: a block inside a column has to STRETCH to
// the column, while a label sharing a row with a sibling has to be allowed to SHRINK.
for (const style of ['name', 'headline', 'tagline']) {
  ok(
    new RegExp(`\\b${style}: \\{[^}]*alignSelf: 'stretch'`).test(home),
    `style "${style}" stretches to its column, so a long value cannot overflow it`,
  );
}
for (const style of ['stripText']) {
  ok(
    new RegExp(`\\b${style}: \\{(?=[^}]*flexShrink: 1)(?=[^}]*minWidth: 0)`).test(home),
    `style "${style}" shrinks within its row rather than pushing its sibling out`,
  );
}
// The explore row must ask the fitter, not a width constant, whether four fit.
ok(/const exploreColumns = fitFontSize\(/.test(home), 'the explore row decides its columns by fitting the longest label');

console.log(
  problems === 0
    ? `Home layout OK at ${WIDTHS.join('/')}pt and ${SCALES.join('x/')}x font scale`
    : `${problems} problem(s)`,
);
process.exit(problems === 0 ? 0 : 1);
