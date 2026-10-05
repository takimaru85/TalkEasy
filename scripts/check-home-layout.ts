// Checks that the child Home screen's rows fit the phone widths it has to support, at every text
// size and at both ends of the OS font scale. Run: npm run check:layout
//
// The Home screen is a stack of ROWS whose contents are fixed-width: an avatar, three capsules,
// the mascot and its speech bubble, five syllable chips, three explore tiles, five nav cells. A row
// like that does not overflow visibly on Android - it silently clips, or draws one child over
// another - so the widths are asserted here rather than being spotted in a screenshot.
//
// The model is the one `fitFontSize` uses, and CHAR_EM is READ from that file so the check and the
// fitter cannot drift apart. Where the screen decides a layout (four tiles across or two, one HUD
// row or two), the rule is reproduced here and the RESULT is asserted - so a rule that says yes
// while the text does not fit fails this check.
import { readFileSync } from 'node:fs';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING, TEXT_SIZE_PRESETS } from '../src/constants/sizes';
import { en } from '../src/i18n/locales/en';
import { BADGE, badgeDepth } from '../src/components/adventure/badgeGeometry';
import { BADGES } from '../src/adventure/badges';
import { badgeArtSize, badgeStacked, badgeTextWidth } from '../src/adventure/progressLayout';
import { ACHIEVEMENT_TEXT_MIN, CHIP, STAT_GAP, STAT_PAD, badgePreviewCount, statArtSize, statStacked, statTextWidth } from '../src/adventure/progressLayout';
import type { SizeOption } from '../src/types/models';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const fitSource = readFileSync('src/utils/fitText.ts', 'utf8');
const CHAR_EM = Number(/const CHAR_EM = ([\d.]+);/.exec(fitSource)?.[1]);
const CAPS_EM = Number(/const CAPS_EM = ([\d.]+);/.exec(fitSource)?.[1]);
ok(CHAR_EM > 0 && CAPS_EM > CHAR_EM, 'CHAR_EM and the wider CAPS_EM were read from src/utils/fitText.ts');

/**
 * Capitals are wider than mixed case, and the fitter knows it — so this check has to as well, or
 * it goes on passing labels that truncate. ("START ADVENTURE" did exactly that.)
 */
function emFor(text: string): number {
  const letters = text.replace(/[^A-Za-z]/g, '');
  return letters.length >= 2 && letters === letters.toUpperCase() ? CAPS_EM : CHAR_EM;
}

/** The widths the app is required to support, smallest first. */
const WIDTHS = [320, 375, 390, 430];
const TEXT_SIZES = Object.keys(TEXT_SIZE_PRESETS) as SizeOption[];
/** Both ends of the range: a layout that adapts has to be right at each, not on average. */
const SCALES = [1, MAX_FONT_SCALE];

/** Mirrors of what the screen declares. If the screen changes one, this check should fail with it. */
const HORIZONTAL_PADDING = SPACING.lg;
const CAPSULE_FIXED = 9 * 2 + 1.5 * 2 + 15 + 4;
const HUD_GAP = 6;
/** Mirrors SHOP_EXTRA on the star capsule (divider + gaps + 18pt icon), plus the word SHOP at 13pt. */
const SHOP_EXTRA = 1 + 8 + 8 + 18 + 4;
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
    const wide = (text: string, fontSize: number) => text.length * emFor(text) * fontSize * scale;
    /** `fitFontSize`, reproduced. A `min` of 1 asks for the true fit rather than the clamped one. */
    const fit = (text: string, room: number, base: number, min: number) =>
      Math.max(min, Math.min(base, Math.floor(room / (Math.max(text.length, 1) * emFor(text) * scale))));
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
    const exploreLabels = [s.sectionSchool, s.sectionActivities, s.sectionFeelings];
    const longestExplore = exploreLabels.reduce((a, b) => (b.length > a.length ? b : a));
    const exploreRoom = (cols: number) => (contentWidth - SPACING.sm * (cols - 1)) / cols - SPACING.xs * 2 - 4;
    const exploreColumns = fit(longestExplore, exploreRoom(exploreLabels.length), 14, 1) >= EXPLORE_LABEL_MIN ? exploreLabels.length : 1;
    // At the normal font scale the three tiles always share one row; at the largest OS font scale on
    // the narrowest phone they may stack one per row (balanced — never a 2 + 1 orphan).
    if (scale === 1) ok(exploreColumns === exploreLabels.length, at('More to explore stays one row of three'));
    ok(exploreColumns === exploreLabels.length || exploreColumns === 1, at('More to explore is one row, or one per row — never 2 + 1'));
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
    ok('BA'.length * emFor('BA') * 18 + 4 + 4 <= chip, at('BA BE BI BO BU fit their chips'));

    for (const textSize of TEXT_SIZES) {
      const heading = TEXT_SIZE_PRESETS[textSize].heading;
      const where = (what: string) => `${width}pt @${scale}x/${textSize}: ${what}`;

      // ---- HUD: one row only while the name keeps a readable strip ---------------------------
      const capsules = WORST_STATS.reduce((w, n) => w + CAPSULE_FIXED + wide(String(n), 14), 0) + SHOP_EXTRA + wide('SHOP', 13) + HUD_GAP * 2;
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

      const headlineSize = fit(s.advLetsGo, heroTextW, heading + 8, 16);
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

// The guard itself, asserted against the screen's source: the arithmetic below is only safe because
// the screen floors its width, and a check that reproduced the floor locally would keep passing if
// somebody removed it from the screen.
{
  const home = readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8');
  const line = home.split(String.fromCharCode(10)).find((l) => l.includes('const contentWidth ='));
  ok(line !== undefined, 'the Home screen still derives a content width');
  ok(
    line !== undefined && line.includes('MIN_SUPPORTED_WIDTH'),
    'the Home screen FLOORS its content width — without it a zero-width first frame yields <svg width="-8">',
  );
}

// ---- a degenerate window must never produce impossible geometry ---------------------------------
// useWindowDimensions reports 0 on the first frame, and on the web before the pane has a size. The
// Home screen derives EVERY size from one width, so an unguarded `width - padding * 2` went negative
// and `exploreArt` came out as -8 — an <svg width="-8"> draws nothing at all, silently, which is how
// the three "More to explore" icons disappeared while their labels looked perfectly fine.
//
// The fix is the floor in MIN_SUPPORTED_WIDTH; this models it, so the guard cannot be removed
// without the build noticing.
for (const raw of [0, 1, 120, 319]) {
  const floored = Math.max(MIN_SUPPORTED_WIDTH, raw);
  const contentWidth = floored - HORIZONTAL_PADDING * 2;
  ok(contentWidth > 0, `width ${raw}: the floored content width is positive`);

  // Both shapes the row can take — three across, or one per row when the label will not fit.
  for (const cols of [1, 3]) {
    const exploreWidth = (contentWidth - SPACING.sm * (cols - 1)) / cols;
    const exploreArt = Math.round(Math.min(44, exploreWidth * 0.5));
    ok(exploreWidth > 0, `width ${raw}, ${cols} across: an explore tile has a positive width`);
    ok(exploreArt > 0, `width ${raw}, ${cols} across: the explore icon has a DRAWABLE size (a negative one renders nothing)`);
  }

  // The same exposure exists for every other size on that screen.
  ok((contentWidth - SPACING.md) / 2 > 0, `width ${raw}: a half-width card is positive`);
  ok(contentWidth - SPACING.lg * 2 - 3 > 0, `width ${raw}: the hero's inner width is positive`);
}

// ---- the discovery badge on the Activities card ----------------------------------------------------
// A sticker on the corner of a card. It is a decoration, so it must never cover the thing it decorates
// (the icon), never reach the next card, never take a tap, and never move when motion is reduced.
for (const width of WIDTHS) {
  const contentWidth = width - HORIZONTAL_PADDING * 2;
  const cardWidth = (contentWidth - SPACING.sm * 2) / 3;
  const art = Math.round(Math.min(44, cardWidth * 0.5));
  // the card: MIN_CHILD_TARGET + 26 tall, 1.5 border on top and 3.5 below, icon + 4 gap + a label line
  const inner = MIN_CHILD_TARGET + 26 - 1.5 - 3.5;
  const artTop = 1.5 + (inner - (art + 4 + 17)) / 2;
  ok(badgeDepth() <= artTop, `width ${width}: the tilted badge reaches ${badgeDepth().toFixed(1)}pt into a card whose icon starts at ${artTop.toFixed(1)}pt`);
  ok(BADGE.minWidth + BADGE.inset <= cardWidth, `width ${width}: the badge fits across a ${cardWidth.toFixed(0)}pt card`);
  ok(BADGE.reachRight < SPACING.sm, `width ${width}: its rays stop short of the next card (${BADGE.reachRight}pt of an ${SPACING.sm}pt gap)`);
}
{
  const badge = readFileSync('src/components/adventure/DiscoveryBadge.tsx', 'utf8');
  const home = readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8');
  ok(badge.includes('pointerEvents="none"'), 'the badge cannot take a tap: a tap on it is a tap on the card');
  ok(!badge.includes('onPress') && !badge.includes('Pressable') && !badge.includes('navigate'), 'the badge has no handler and no navigation of its own');
  ok(badge.includes('useReducedMotion()') && badge.includes('if (still)'), 'the badge holds still when motion is reduced');
  ok(badge.includes('importantForAccessibility="no-hide-descendants"') && badge.includes('aria-hidden'), 'the badge is decorative and hidden from screen readers on every platform');
  ok(badge.split('Animated.loop(').length === 2 && badge.includes('loop.stop()'), 'one loop, stopped on unmount');
  ok(!badge.includes('Animated.spring') && !badge.includes('Easing.bounce'), 'the badge floats; it does not bounce');
  ok(home.includes('<DiscoveryBadge') && home.includes("badge: 'exploreBadge'"), 'the Activities card carries the badge, from a string key');
  const at = home.indexOf('<DiscoveryBadge');
  ok(at > home.indexOf('</PressableScale>') - 400 && at < home.indexOf('</PressableScale>', at), 'the badge sits inside the card\'s own pressable, so the whole card stays the one tap target');
  // Android draws by ELEVATION before tree order: a badge whose wrapper does not out-rank the card's
  // shell is drawn UNDER the card, cutting its overlap off — which is exactly what happened.
  const shellElevation = Number((/exploreShell: \{[\s\S]*?elevation: (\d+)/.exec(home) ?? [])[1]);
  ok(Number.isFinite(shellElevation) && BADGE.elevation > shellElevation, `the badge (elevation ${BADGE.elevation}) out-ranks the card shell (${shellElevation}), or Android draws it underneath`);
  ok(badge.includes('elevation: BADGE.elevation') && badge.includes('zIndex: 1'), 'the badge\'s OUTER wrapper carries the elevation and zIndex, not only the inner pill');
  ok(!/overflow\s*:\s*['"]/.test(badge), 'no style in the badge clips it');
  ok(home.includes("zIndex: 'badge' in m ? 2 : 0"), 'a card with a badge sits above its neighbours so the next card cannot paint over the overhang');
  ok(s.exploreBadge === 'New!' && s.exploreBadge.length <= 9, 'the badge label is short enough for a 90pt card');
}
// ---- My Progress ------------------------------------------------------------------------------------
// Six counts in a two-column grid, an achievements row with a badge preview, and a call to action.
// The numbers are COUNTED (useAchievements / useAdventure), never typed in; what is checked here is the
// room: a label must fit beside its picture, and the preview must never squeeze the words out.
for (const width of WIDTHS) {
  const contentWidth = width - HORIZONTAL_PADDING * 2;
  const cardWidth = Math.floor((contentWidth - SPACING.md) / 2);
  const textRoom = statTextWidth(cardWidth);
  ok(textRoom >= 56, `width ${width}: a statistic keeps ${textRoom}pt for its number and label beside a ${statArtSize(cardWidth)}pt picture`);
  for (const l of [s.advStatSounds, s.advStatExercises, s.advStatWords, s.advStatTracing, s.advStatStars, s.advStatStreak]) {
    // the longest word at the smallest size the screen will use (11pt), with the same 0.64em glyph estimate fitText uses
    const longest = Math.max(...l.split(' ').map((w: string) => w.length));
    ok(longest * 0.64 * 11 <= textRoom, `width ${width}: "${l}" fits its ${statStacked(cardWidth) ? 'stacked' : 'side-by-side'} card (${textRoom}pt)`);
  }
  for (let earned = 0; earned <= 8; earned++) {
    const n = badgePreviewCount(contentWidth, earned);
    ok(n <= Math.min(4, earned), `width ${width}: ${earned} earned shows at most ${Math.min(4, earned)} previews, not ${n}`);
    const taken = n === 0 ? 0 : n * CHIP + (n - 1) * 6;
    const left = contentWidth - 24 - 52 - 26 - 12 * 3 - taken;
    ok(left >= ACHIEVEMENT_TEXT_MIN, `width ${width}: with ${n} previews "Achievements" keeps ${left}pt`);
  }
  ok(STAT_PAD * 2 + STAT_GAP < cardWidth, `width ${width}: a statistic card has room inside its padding`);
}
{
  const prog = readFileSync('src/screens/child/MyProgressScreen.tsx', 'utf8');
  const card = readFileSync('src/components/adventure/StatCard.tsx', 'utf8');
  const hero = readFileSync('src/components/adventure/HeroBanner.tsx', 'utf8');
  ok(prog.includes('metrics.stars') && prog.includes('metrics.streak') && prog.includes('metrics.soundsPractised') && prog.includes('metrics.tracingSessions'), 'every statistic is read from the metrics, not typed in');
  ok(!/value:\s*\d/.test(prog), 'no statistic has a number written into it');
  ok(prog.includes('earnedCount') && prog.includes('badges.length'), 'the badge count is the real earned count out of the real total');
  ok(prog.includes('adventure.progress') && prog.includes('adventure.starsIntoLevel') && prog.includes('adventure.starsPerLevel'), 'the level bar comes from the adventure hook');
  ok(prog.includes('Math.max(MIN_SUPPORTED_WIDTH, width)'), 'the screen floors the window width before deriving sizes from it');
  ok((prog.match(/navigate\('Achievements'\)/g) ?? []).length === 1 && prog.includes('onPress={goAchievements}'), 'the achievements card and the button share ONE destination, not two routes');
  ok(prog.includes("navigate('ParentPin')"), 'the settings button goes to Parent Mode, behind its PIN, as on Home');
  // paint order on web: a bare SVG sits UNDER an absolutely positioned gradient, so the picture needs a View
  ok(/<View>\s*\n\s*<ColorArt name=\{art\}/.test(card), 'a statistic picture is wrapped in a View so it paints above the gradient on web');
  ok(/<View>\s*\n\s*<ColorArt name="stat:trophy"/.test(prog), 'the button trophy is wrapped in a View so it paints above the gradient on web');
  ok(hero.includes('Math.max(0, Math.min(1, progress))'), 'the level bar is clamped to 0..1');
}
// ---- Achievements ----------------------------------------------------------------------------------------
// Eight badges in a two-column grid. Every title must fit beside (or under) its picture, whatever the width.
for (const width of WIDTHS) {
  const contentWidth = width - HORIZONTAL_PADDING * 2;
  const cardWidth = Math.floor((contentWidth - SPACING.md) / 2);
  const room = badgeTextWidth(cardWidth);
  for (const b of BADGES) {
    const longest = Math.max(...b.title.split(' ').map((w: string) => w.length));
    ok(longest * 0.64 * 11 <= room, `width ${width}: "${b.title}" fits its ${badgeStacked(cardWidth) ? 'stacked' : 'side-by-side'} card (${room}pt for ${longest} letters)`);
  }
  ok(badgeArtSize(cardWidth) <= cardWidth - 24, `width ${width}: a badge picture fits inside its card`);
}
{
  const screen = readFileSync('src/screens/child/AchievementsScreen.tsx', 'utf8');
  const card = readFileSync('src/components/adventure/BadgeCard.tsx', 'utf8');
  const summary = readFileSync('src/components/adventure/AchievementSummary.tsx', 'utf8');
  ok(screen.includes('({ navigation }: RootScreenProps<\'Achievements\'>)'), 'the screen destructures navigation (a bare navigation is the DOM global on web)');
  ok(screen.includes("navigate('ParentPin')"), 'the settings button goes to Parent Mode, behind its PIN');
  ok(screen.includes('earned={earnedCount}') && screen.includes('total={badges.length}'), 'the summary is given the real earned and total counts');
  ok(screen.includes('progressLabel={`${b.current} / ${b.target}`}'), 'each badge shows its real progress');
  ok(screen.includes('Number(b.earned) - Number(a.earned) || b.progress - a.progress'), 'earned badges still come first, then the closest to earned');
  ok(screen.includes('Math.max(MIN_SUPPORTED_WIDTH, width)'), 'the screen floors the window width before deriving sizes');
  ok(!/onPress|Pressable|navigate\(/.test(card), 'a badge is still not tappable (it never was), so it has no handler');
  ok(/<View>\s*\n\s*<Mascot/.test(summary) && summary.includes('<ColorArt name="stat:stars"'), 'the mascot is in a View so it paints above the gradient on web');
  ok(card.includes('<View style={earned ? null :') && card.includes('<ColorArt name={art}'), 'the badge picture is in a View so it paints above the gradient on web');
  ok(summary.includes('Math.max(0, Math.min(1, earned / total))') && summary.includes('total > 0'), 'the summary bar is the real fraction, clamped, and safe with no badges');
  const footer = readFileSync('src/components/adventure/GalaxyFooter.tsx', 'utf8');
  ok(footer.includes('pointerEvents="none"') && footer.includes('importantForAccessibility="no-hide-descendants"'), 'the moon and clouds are a backdrop: no touches, hidden from screen readers');
  ok(screen.indexOf('<GalaxyFooter />') < screen.indexOf('<ScrollView'), 'the backdrop comes before the content in the tree, so the content paints over it');
}

// ---- the Shop discovery hint: shown a few times, never again once dismissed or visited ----
{
  const { SHOP_HINT_DONE, SHOP_HINT_MAX_VIEWS, afterShopHintShown, shouldShowShopHint } = require('../src/adventure/shopHint');
  let saved = '';
  let shown = 0;
  for (let open = 0; open < 10; open++) {
    if (shouldShowShopHint(saved)) {
      shown++;
      saved = afterShopHintShown(saved);
    }
  }
  ok(shown === SHOP_HINT_MAX_VIEWS && saved === SHOP_HINT_DONE, 'the shop hint is shown ' + shown + ' times, then stops');
  ok(!shouldShowShopHint(SHOP_HINT_DONE) && afterShopHintShown(SHOP_HINT_DONE) === SHOP_HINT_DONE, 'a finished hint stays finished');
  const fs2 = require('node:fs');
  const home = fs2.readFileSync('src/screens/child/ChildHomeScreen.tsx', 'utf8');
  const shop = fs2.readFileSync('src/screens/child/RewardsShopScreen.tsx', 'utf8');
  ok(/shopLabel=\{t\('shopLabel'\)\}/.test(home) && /navigate\('RewardsShop'\)/.test(home), 'the star capsule is the SHOP button and opens the Shop');
  ok(shop.includes("updateSetting('shopHint', 'done')"), 'visiting the Shop ends the hint for good');
}
console.log(
  problems === 0
    ? `Home layout OK at ${WIDTHS.join('/')}pt and ${SCALES.join('x/')}x font scale`
    : `${problems} problem(s)`,
);
process.exit(problems === 0 ? 0 : 1);
