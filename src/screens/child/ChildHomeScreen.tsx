import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Avatar, Icon, PressableScale, ScreenContainer } from '@/components/common';
import {
  AdventureButton,
  GameIcon,
  HeroSparkles,
  GradientSurface,
  Mascot,
  SpaceNav,
  SyllableChips,
  TalkEasyLogo,
  WorldArt,
  WorldBackground,
} from '@/components/adventure';
import type { WorldArtName } from '@/adventure/worlds';
import type { GameIconName } from '@/components/adventure/GameIcon';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useAdventure, useAdventureWorld, useCollection, useSizes, useToday, useTodayLessons, useTodaySoundPractice } from '@/hooks';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import type { RootScreenProps } from '@/navigation/types';
import { AdventureZone, Fonts, useTheme } from '@/theme';
import { Adventure, AdventureNight, AdventureRadius, shade, type AdventureKey } from '@/theme/adventure';
import { fitFontSize, textWidth } from '@/utils/fitText';

type Destination =
  | 'SpeechPractice' | 'WritingPractice' | 'Learn' | 'Communicate' | 'Favorites' | 'AdaptiveHome'
  | 'MyProgress' | 'Achievements' | 'SoundPractice'
  | 'School' | 'MyDay' | 'Activities' | 'Feelings' | 'SchoolMode' | 'ParentPin'
  | 'Collection' | 'ChooseAdventure';

/** How many different sounds today's mission asks for — small enough to finish in one sitting. */
const DAILY_TARGET = 5;

function greetingKey(hour: number): keyof Strings {
  if (hour < 12) return 'goodMorning';
  if (hour < 18) return 'goodAfternoon';
  return 'goodEvening';
}

/** Narrowest a More-to-Explore card may be before the row wraps to two by two. */
/**
 * The smallest an explore label may be before the row gives up on four across.
 *
 * 10, not 11: at 11 the longest label ("Activities") never fits four-up on ANY supported width,
 * so the row would drop to two-by-two on every phone and lose the compact strip the design wants.
 */
const EXPLORE_LABEL_MIN = 10;
/** A capsule minus its number: padding + border + the 15pt icon + the gap before the digits. */
const CAPSULE_FIXED = 9 * 2 + 1.5 * 2 + 15 + 4;
const HUD_GAP = 6;
/** Narrower than this and the child's own name is no longer worth reading. */
const NAME_MIN = 96;

/**
 * More to Explore colours: softer than the quest cards (these are secondary), but solid and
 * saturated enough to belong to the same palette — golden, mint, lavender, coral — with a dark ink
 * of the same hue for the label, which reads better than white on these lighter fills.
 */
const EXPLORE_TONES = {
  myday: { from: '#FFE38F', to: '#F6C343', rim: '#FFF0BF', ink: '#553800' },
  school: { from: '#A6EDCB', to: '#5CCB98', rim: '#CFF7E3', ink: '#0D4A2F' },
  activities: { from: '#D3C1FF', to: '#A688F2', rim: '#E7DEFF', ink: '#32176B' },
  feelings: { from: '#FFC2B4', to: '#F5908E', rim: '#FFDCD3', ink: '#651D24' },
} as const;

/**
 * Home — the TalkEasy universe.
 *
 * Every part is built for the theme rather than dropped on top of a space wallpaper: the sky is
 * layered (nebula → planets → stars), Pip wears an explorer's helmet and headset, the level bar
 * is a mission meter, the destinations are glowing consoles and the bottom bar is a flight deck.
 *
 * Two deliberate limits:
 *  - The night surface STOPS HERE. The other child screens were built for a light background with
 *    dark body text; flipping the shared container would make twenty screens unreadable at once.
 *  - The bottom bar NAVIGATES, it is not a tab navigator. The app is a stack where every child
 *    screen carries a Home button, which the child has already learned; real tabs would
 *    restructure all 27 routes, and the brief says not to change navigation logic.
 *
 * Every number is derived from practice that really happened (hooks/useAdventure, today's sound
 * practice) — this screen never shows a figure the app cannot justify.
 */
export function ChildHomeScreen({ navigation }: RootScreenProps<'ChildHome'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { profile, displayName } = useProfile();
  const { now, isoDate } = useToday();
  const { data: todayLessons } = useTodayLessons(isoDate);
  const { data: soundToday } = useTodaySoundPractice();
  const adventure = useAdventure();
  // The child's interest world: scenery, collectibles and a little artwork. Never the layout.
  const { world, unchosen } = useAdventureWorld();
  const collection = useCollection();
  const { width, height } = useWindowDimensions();

  // High contrast opts out of the universe: a starfield behind text is what that mode removes.
  const night = !theme.highContrast;
  const ink = night ? AdventureNight.ink : theme.colors.text;
  const inkMuted = night ? AdventureNight.inkMuted : theme.colors.textMuted;

  const contentWidth = width - sizes.horizontalPadding * 2;
  const half = (contentWidth - SPACING.md) / 2;
  const exploreLabels = (['sectionMyDay', 'sectionSchool', 'sectionActivities', 'sectionFeelings'] as const).map((k) => t(k));
  const longestExplore = exploreLabels.reduce((a, b) => (b.length > a.length ? b : a));
  /**
   * More to Explore: four compact cards in ONE row, dropping to two rows of two when four would
   * squeeze the longest label ("Activities") below EXPLORE_LABEL_MIN.
   *
   * The question is asked of the FITTER, not of a width constant: the answer depends on the OS
   * font scale as much as the screen, and the old width-only rule said yes on a 375pt phone while
   * the label needed more room than its tile had and ran over its neighbour. Passing min 1 asks
   * for the true fit rather than the clamped one.
   */
  const exploreRoom = (cols: number) => (contentWidth - SPACING.sm * (cols - 1)) / cols - SPACING.xs * 2 - 4;
  const exploreColumns = fitFontSize(longestExplore, exploreRoom(4), 14, 'line', 1) >= EXPLORE_LABEL_MIN ? 4 : 2;
  const exploreWidth = (contentWidth - SPACING.sm * (exploreColumns - 1)) / exploreColumns;
  const exploreArt = Math.round(Math.min(44, exploreWidth * 0.5));
  // One label size for all four, so the row reads evenly.
  const exploreLabelSize = exploreLabels.reduce((min, l) => Math.min(min, fitFontSize(l, exploreRoom(exploreColumns), 14, 'line', EXPLORE_LABEL_MIN)), 14);

  /**
   * Decorative world art and the invite title both scale with the window, so a 320pt phone gets
   * smaller prizes and a smaller (still readable) title rather than an overlap. Nothing here is a
   * fixed pixel position.
   */
  const worldArtSize = width < 360 ? 24 : width < 400 ? 27 : 30;

  /**
   * Avatar, name and three capsules share one line only while the capsules still leave the child's
   * name a readable strip. The cost is MEASURED rather than guessed from a width breakpoint,
   * because the capsules grow on their own: 9 stars becomes 10 becomes 100, and the OS font scale
   * grows every digit again. Below NAME_MIN the capsules drop to their own centred row — same
   * capsules, same order, nothing hidden.
   */
  const capsulesWidth =
    [adventure.totalStars, adventure.streak, adventure.level].reduce(
      (w, n) => w + CAPSULE_FIXED + textWidth(String(n), 14),
      0,
    ) + HUD_GAP * 2;
  const hudStacked = contentWidth - (MIN_CHILD_TARGET - 8) - HUD_GAP * 2 - 6 - capsulesWidth < NAME_MIN;
  const inviteTitleSize = fitFontSize(t('advChooseCta'), contentWidth - SPACING.md * 2 - 34, 15, 'line', 12);

  /**
   * The hero is a two-column row, and the columns have to be told where to stop.
   *
   * Pip's speech bubble is wider than Pip: at the largest font scale "Let's speak!" made the art
   * column ~154pt, which on a 320pt phone left LET'S GO! and the tagline about 90pt to share and
   * they ran straight over the mascot. The art column now takes a SHARE of the row (never more
   * than the mascot needs), the bubble is clipped to it, and all three strings are measured into
   * the room that remains rather than trusting adjustsFontSizeToFit, which Android ignores here.
   */
  const heroInner = contentWidth - SPACING.lg * 2 - 3;
  const heroArtW = Math.round(Math.min(122, Math.max(84, heroInner * 0.36)));
  const heroTextW = heroInner - heroArtW - SPACING.sm - SPACING.xs;
  const headlineSize = fitFontSize(t('advLetsGo'), heroTextW, sizes.heading + 8, 'line', 18);
  // Two lines, so the fitter is given two lines' worth of room.
  const taglineSize = fitFontSize(t('advTagline'), heroTextW * 2, 15, 'line', 12);
  const bubbleSize = fitFontSize(t('advPipLine'), heroArtW - SPACING.md * 2, 13, 'line', 9);

  const unfinished = todayLessons.filter((l) => l.activityCount > 0 && l.completedCount < l.activityCount);
  const startScreen: Destination = unfinished.length > 0 ? 'AdaptiveHome' : 'SpeechPractice';
  const dailyDone = Math.min(soundToday.soundsPracticed, DAILY_TARGET);

  const go = (screen: Destination) => () => navigation.navigate(screen);

  /**
   * Cards are SOLID, not glass. A saturated fill separates a destination from the sky far more
   * clearly than a translucent panel, which is what a child needs to see at a glance — and it is
   * what makes the screen read as a game rather than a dashboard over a wallpaper.
   */
  const cardStyle = (c: AdventureKey) =>
    night
      ? {
          backgroundColor: Adventure[c].to,
          // A lit rim on top and sides, a darker "lip" underneath: the card reads as a raised,
          // pressable game button rather than a flat panel.
          borderColor: shade(Adventure[c].from, 1.35),
          borderBottomColor: shade(Adventure[c].to, 0.68),
        }
      : { backgroundColor: Adventure[c].tint, borderColor: theme.colors.borderSoft };

  /**
   * A destination console. Narrow (half-width) cards stack: icon and arrow on top, the words
   * underneath at full width, so a subtitle like "Trace letters, numbers and words" never has to
   * squeeze beside the icon.
   */
  const Console = ({
    title, subtitle, art, worldArt, color, width: w, onPress, badge, children, featured, decor,
  }: {
    /** The destination's illustrated game icon (components/adventure/GameIcon). */
    title: string; subtitle: string; art: GameIconName; color: AdventureKey; width: number;
    /** World artwork drawn instead of `art` (the Daily Mission follows the child's world). */
    worldArt?: WorldArtName;
    onPress: () => void; badge?: string; children?: React.ReactNode;
    /** The core feature: a brighter rim, a stronger glow and a bigger icon, so it outranks its neighbours. */
    featured?: boolean;
    /** Two or three tiny themed marks (stars, letters, sound waves) in a free corner — never behind text. */
    decor?: string[];
  }) => {
    const c = Adventure[color];
    const stacked = w < 260;
    // The illustration is a focal point of the card, so it is drawn larger than the old glyph plate.
    const disc = featured ? 76 : stacked ? 62 : 68;
    const textWidth = stacked ? w - SPACING.lg * 2 : w - SPACING.lg * 2 - disc - SPACING.md * 2 - 40;
    // A narrow card keeps its title on ONE line ("Learn & Trace"), so it is fitted as a whole line.
    const titleSize = fitFontSize(title, textWidth, featured ? sizes.tileLabel + 2 : sizes.tileLabel, stacked ? 'line' : 'word', 14);

    // An illustrated game icon placed straight on the card — the object itself is colourful, so it
    // needs no container.
    const iconPlate = (
      <View style={[styles.art, { width: disc, height: disc }]}>
        {worldArt ? <WorldArt name={worldArt} size={disc} /> : <GameIcon name={art} size={disc} />}
      </View>
    );

    const trailing = badge ? (
      <View style={[styles.badge, night ? styles.badgeSolid : { backgroundColor: `${c.from}33`, borderColor: `${c.from}88` }]}>
        <Text style={[styles.badgeText, { color: c.ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {badge}
        </Text>
      </View>
    ) : (
      <View
        style={[
          styles.arrow,
          night ? [styles.gameArrow, { backgroundColor: shade(c.to, 0.78), shadowColor: shade(c.to, 0.45) }] : { backgroundColor: c.tint },
        ]}
      >
        <Icon name="chevron-right" size={24} color={night ? '#FFFFFF' : c.ink} />
      </View>
    );

    // A badge already occupies the top-right of a wide card, so a corner decoration there would
    // eventually sit on top of it once the badge grows (a longer count, a larger font scale).
    // Stacked cards put their decoration inline, so they are unaffected.
    const decoration =
      night && decor?.length && (stacked || !badge) ? (
        <View style={stacked ? styles.decorInline : styles.decorCorner} pointerEvents="none">
          {decor.map((d, i) => (
            <Icon key={`${d}-${i}`} name={d} size={i === 0 ? 18 : 13} color="#FFFFFF" />
          ))}
        </View>
      ) : null;

    const words = (
      <View style={stacked ? styles.consoleTextStacked : styles.consoleText}>
        <Text
          style={[styles.consoleTitle, { fontSize: titleSize, color: night ? '#FFFFFF' : ink }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={stacked ? 1 : 2}
          textBreakStrategy="simple"
        >
          {title}
        </Text>
        <Text style={[styles.consoleSub, { color: night ? 'rgba(255,255,255,0.94)' : inkMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    );

    return (
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}${badge ? `. ${badge}` : ''}`} hitSlop={4} style={{ width: w }}>
        <View
          style={[
            styles.console,
            cardStyle(color),
            night && [styles.solidLift, { shadowColor: c.from }],
            featured && night && styles.featuredLift,
          ]}
        >
          {night ? (
            <>
              <GradientSurface from={c.from} to={c.to} direction="vertical" />
              {/* Gloss that FADES out, instead of a hard-edged band across the middle. */}
              <View style={styles.gloss} pointerEvents="none">
                <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.34} toOpacity={0} />
              </View>
            </>
          ) : null}
          {stacked ? (
            <View style={styles.stackTop}>
              {iconPlate}
              {decoration ?? <View style={styles.flex} />}
              {trailing}
            </View>
          ) : null}
          {stacked ? (
            words
          ) : (
            <View style={styles.consoleHead}>
              {iconPlate}
              {words}
              {trailing}
            </View>
          )}
          {stacked ? null : decoration}
          {children}
        </View>
      </PressableScale>
    );
  };

  return (
    <AdventureZone>
      <ScreenContainer background={night ? AdventureNight.bottom : undefined}>
        {night ? <WorldBackground world={world.id} width={width} height={height} /> : null}

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Flight HUD: who is flying, and what they have collected. */}
          <View style={hudStacked ? styles.hudStacked : styles.hud}>
            <View style={[styles.hudWho, !hudStacked && styles.hudWhoFill]}>
              <Avatar avatar={profile.avatar} photoUri={profile.photoUri} size={MIN_CHILD_TARGET - 8} />
              <View style={styles.hudName}>
                <Text style={[styles.greeting, { color: inkMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {t(greetingKey(now.getHours()))}
                </Text>
                <Text
                  style={[styles.name, { fontSize: sizes.heading - 4, color: ink }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {displayName}
                </Text>
              </View>
            </View>
            <View style={hudStacked ? styles.hudStatsRow : styles.hudStats}>
              <Capsule icon="star" tone={Adventure.sun.from} value={adventure.totalStars} label={t('advStars', { n: adventure.totalStars })} night={night} ink={ink} />
              <Capsule icon="fire" tone={Adventure.coral.from} value={adventure.streak} label={t('advStreak', { n: adventure.streak })} night={night} ink={ink} />
              <Capsule icon="shield-star" tone={Adventure.grape.from} value={adventure.level} label={t('advLevel', { n: adventure.level })} night={night} ink={ink} />
            </View>
          </View>

          <TalkEasyLogo size={Math.min(42, sizes.heading + 8)} tagline={t('advTaglineWorld')} />

          {/* Hero: Pip in the helmet, the call to fly, and the mission meter. */}
          <View style={[styles.hero, night ? styles.heroSolid : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.heroTop}>
              <View style={[styles.mascotWrap, { width: heroArtW }]}>
                {night ? <HeroSparkles size={Math.min(heroArtW + 28, sizes.iconSize + 92)} /> : null}
                <Mascot size={Math.min(heroArtW, sizes.iconSize + 64)} mood="cheer" space={night && world.id === 'space'} />
                {/* Pip speaks first — the app's whole point, said by the character. */}
                <View style={[styles.bubble, night ? { backgroundColor: '#FFFFFF' } : { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border }]}>
                  <Text style={[styles.bubbleText, { fontSize: bubbleSize }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {t('advPipLine')}
                  </Text>
                  <View style={styles.bubbleTail} />
                </View>
              </View>
              <View style={styles.heroText}>
                <Text
                  style={[styles.headline, { fontSize: headlineSize, color: night ? Adventure.sun.from : theme.colors.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={1}
                >
                  {t('advLetsGo')}
                </Text>
                <Text
                  style={[styles.tagline, { fontSize: taglineSize, lineHeight: Math.round(taglineSize * 1.35), color: ink }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={2}
                >
                  {t('advTagline')}
                </Text>
              </View>
            </View>

            <View
              accessibilityRole="progressbar"
              accessibilityLabel={`${t('advLevel', { n: adventure.level })}, ${adventure.title}. ${t('advStarsOf', { done: adventure.starsIntoLevel, total: adventure.starsPerLevel })}`}
              accessibilityValue={{ now: Math.round(adventure.progress * 100), min: 0, max: 100 }}
              style={[styles.meter, night && { backgroundColor: 'rgba(8,11,38,0.55)', borderColor: AdventureNight.border }]}
            >
              <View style={styles.meterTop}>
                <Text style={[styles.level, { color: night ? Adventure.sun.from : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {t('advLevel', { n: adventure.level })} · {adventure.title}
                </Text>
                <Text style={[styles.meterValue, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {t('advStarsOf', { done: adventure.starsIntoLevel, total: adventure.starsPerLevel })}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: night ? 'rgba(255,255,255,0.16)' : theme.colors.surfaceAlt }]}>
                <View style={[styles.fill, { width: `${Math.round(adventure.progress * 100)}%` }]}>
                  <GradientSurface from={Adventure.sun.from} to={Adventure.sun.to} direction="vertical" />
                </View>
              </View>
            </View>

            {/* The child's world: a first-time invitation to choose one, then their collection. */}
            {night ? (
              unchosen ? (
                <PressableScale onPress={go('ChooseAdventure')} accessibilityRole="button" accessibilityLabel={t('advChooseCta')} hitSlop={4}>
                  {/* Two rows on purpose. Side by side, the four worlds and this title fought for
                      the same strip and the text spilled straight over the art on a narrow phone. */}
                  <View style={[styles.strip, styles.stripInvite, styles.stripStacked]}>
                    <View style={styles.stripTitleRow}>
                      <Text
                        style={[styles.stripText, { fontSize: inviteTitleSize, color: '#5A3A00' }]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                        numberOfLines={1}
                      >
                        {t('advChooseCta')}
                      </Text>
                      <Icon name="chevron-right" size={22} color="#5A3A00" />
                    </View>
                    <View style={styles.stripArtRow}>
                      {(['world-space', 'world-dinosaurs', 'world-animals', 'world-vehicles'] as const).map((e) => (
                        <WorldArt key={e} name={e} size={worldArtSize} />
                      ))}
                    </View>
                  </View>
                </PressableScale>
              ) : (
                <PressableScale
                  onPress={go('Collection')}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('advMyCollection')}. ${t('advFoundOf', { n: collection.found, total: collection.items.length })}`}
                  hitSlop={4}
                >
                  <View style={styles.strip}>
                    <View style={styles.stripArt}>
                      {collection.items.map((item) => (
                        <WorldArt key={item.id} name={item.art} size={worldArtSize} locked={!item.found} />
                      ))}
                    </View>
                    <Text style={[styles.stripText, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {`${collection.found} / ${collection.items.length}`}
                    </Text>
                    <Icon name="chevron-right" size={22} color={inkMuted} />
                  </View>
                </PressableScale>
              )
            ) : null}
          </View>

          <AdventureButton
            label={t('advStart')}
            sublabel={t('advContinue')}
            icon="rocket-launch-outline"
            art="mission"
            color="sun"
            onPress={go(startScreen)}
          />

          {/* Speech Practice is the core feature, so it gets the full width and the syllables. */}
          <Console
            title={t('questSpeech')}
            subtitle={t('questSpeechSub')}
            art="speech"
            color="lagoon"
            width={contentWidth}
            featured
            decor={['waveform', 'star-four-points', 'message-outline']}
            onPress={go('SpeechPractice')}
          >
            <SyllableChips />
          </Console>

          <View style={styles.pair}>
            <Console title={t('questTrace')} subtitle={t('questTraceSub')} art="trace" color="grape" width={half} decor={['alpha-a', 'alpha-b', 'star-four-points']} onPress={go('WritingPractice')} />
            <Console title={t('questTalk')} subtitle={t('questTalkSub')} art="talk" color="sky" width={half} decor={['waveform', 'star-four-points']} onPress={go('Communicate')} />
          </View>
          <View style={styles.pair}>
            <Console title={t('questWords')} subtitle={t('questWordsSub')} art="words" color="magenta" width={half} decor={['star-four-points', 'cards-outline']} onPress={go('Favorites')} />
            <Console title={t('questPlay')} subtitle={t('questPlaySub')} art="play" color="coral" width={half} decor={['star-four-points', 'gamepad-variant-outline']} onPress={go('Learn')} />
          </View>

          <Console title={t('questLessons')} subtitle={t('questLessonsSub')} art="lessons" color="grass" width={contentWidth} decor={['book-open-variant', 'star-four-points']} onPress={go('AdaptiveHome')} />
          <Console
            title={t('advDaily')}
            subtitle={t('advDailySub')}
            art="mission"
            worldArt={world.id === 'space' ? undefined : world.missionArt}
            color="sun"
            width={contentWidth}
            badge={`${dailyDone} / ${DAILY_TARGET}`}
            decor={['orbit', 'star-four-points', 'star-four-points']}
            onPress={go('SoundPractice')}
          >
            <View style={styles.missionFoot}>
              {dailyDone >= DAILY_TARGET ? (
                <View style={[styles.reward, night ? styles.chipOnSolid : { borderColor: `${Adventure.grass.from}AA`, backgroundColor: `${Adventure.grass.from}22` }]}>
                  <Icon name="check-decagram" size={15} color={night ? '#FFFFFF' : Adventure.grass.from} />
                  <Text style={[styles.rewardText, { color: night ? '#FFFFFF' : Adventure.grass.ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {t('advMissionDone')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.reward, night ? styles.rewardSolid : { borderColor: `${Adventure.sun.from}88` }]}>
                  <Icon name="star" size={16} color={Adventure.sun.to} />
                  <Text style={[styles.rewardText, { color: Adventure.sun.ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {t('advDailyReward')}
                  </Text>
                </View>
              )}
              <View style={styles.missionBar}>
                <View style={[styles.missionTrack, { backgroundColor: night ? 'rgba(0,0,0,0.22)' : theme.colors.surfaceAlt }]}>
                  <View style={[styles.missionFill, { width: `${Math.max(6, Math.round((dailyDone / DAILY_TARGET) * 100))}%`, backgroundColor: '#FFFFFF' }]} />
                </View>
                {/* The rocket rides the bar: progress a child can see, not just a number. */}
                <View style={[styles.missionRocket, { left: `${Math.round((dailyDone / DAILY_TARGET) * 100)}%` }]} pointerEvents="none">
                  {world.id === 'space' ? <GameIcon name="mission" size={30} /> : <WorldArt name={world.missionArt} size={30} />}
                </View>
              </View>
            </View>
          </Console>

          <Text style={[styles.sectionTitle, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
            {t('advMore')}
          </Text>
          <View style={[styles.exploreGrid, { gap: SPACING.sm }]}>
            {([
              { screen: 'MyDay', labelKey: 'sectionMyDay', subKey: 'exploreMyDaySub', art: 'myday', tone: EXPLORE_TONES.myday },
              { screen: 'School', labelKey: 'sectionSchool', subKey: 'exploreSchoolSub', art: 'school', tone: EXPLORE_TONES.school },
              { screen: 'Activities', labelKey: 'sectionActivities', subKey: 'exploreActivitiesSub', art: 'activities', tone: EXPLORE_TONES.activities },
              { screen: 'Feelings', labelKey: 'sectionFeelings', subKey: 'exploreFeelingsSub', art: 'feelings', tone: EXPLORE_TONES.feelings },
            ] as const).map((m) => {
              const c = m.tone;
              return (
                <PressableScale
                  key={m.screen}
                  onPress={go(m.screen)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(m.labelKey)}. ${t(m.subKey)}`}
                  hitSlop={4}
                  style={{ width: exploreWidth }}
                >
                  <View
                    style={[
                      styles.explore,
                      night
                        ? { backgroundColor: c.to, borderColor: c.rim, borderBottomColor: shade(c.to, 0.72) }
                        : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderBottomColor: theme.colors.border },
                    ]}
                  >
                    {night ? (
                      <>
                        <GradientSurface from={c.from} to={c.to} direction="vertical" />
                        <View style={styles.exploreGloss} pointerEvents="none">
                          <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.35} toOpacity={0} />
                        </View>
                      </>
                    ) : null}
                    <GameIcon name={m.art} size={exploreArt} />
                    <Text
                      style={[styles.exploreTitle, { fontSize: exploreLabelSize, color: night ? c.ink : theme.colors.text }]}
                      maxFontSizeMultiplier={1.15}
                      numberOfLines={1}
                      // Safety net for an unusually wide font: shrink a little rather than truncate.
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {t(m.labelKey)}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>

          {/* School Mode stays quiet so it is never tapped by accident. */}
          <PressableScale onPress={go('SchoolMode')} accessibilityRole="button" accessibilityLabel="School Mode" hitSlop={4}>
            <View style={[styles.quiet, night ? { backgroundColor: AdventureNight.card, borderColor: AdventureNight.border } : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft }]}>
              <GameIcon name="school" size={30} />
              <Text style={[styles.quietText, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>School Mode</Text>
              <Icon name="chevron-right" size={22} color={inkMuted} />
            </View>
          </PressableScale>

          {night ? (
            <SpaceNav
              width={contentWidth}
              items={[
                { key: 'home', label: t('navHome'), icon: 'home', art: 'home', onPress: () => {}, active: true },
                { key: 'practice', label: t('navPractice'), icon: 'microphone-outline', art: 'practice', onPress: go('SpeechPractice') },
                { key: 'play', label: t('navPlay'), icon: 'puzzle-outline', art: 'controller', onPress: go('Learn') },
                { key: 'progress', label: t('navProgress'), icon: 'star-outline', art: 'progress', onPress: go('MyProgress') },
                { key: 'parent', label: t('navParent'), icon: 'shield-account-outline', art: 'parent', onPress: go('ParentPin') },
              ]}
            />
          ) : (
            <PressableScale onPress={go('ParentPin')} accessibilityRole="button" accessibilityLabel={t('sectionParent')} hitSlop={4}>
              <View style={[styles.quiet, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft }]}>
                <Icon name="shield-account-outline" size={22} color={inkMuted} />
                <Text style={[styles.quietText, { color: inkMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>{t('sectionParent')}</Text>
                <Icon name="chevron-right" size={22} color={inkMuted} />
              </View>
            </PressableScale>
          )}
        </ScrollView>
      </ScreenContainer>
    </AdventureZone>
  );
}

function Capsule({ icon, tone, value, label, night, ink }: { icon: string; tone: string; value: number; label: string; night: boolean; ink: string }) {
  return (
    <View
      style={[styles.capsule, night ? { backgroundColor: '#141B44', borderColor: tone } : { backgroundColor: '#FFFFFF', borderColor: '#D8DEEA' }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={15} color={tone} />
      <Text style={[styles.capsuleValue, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // lg between blocks: at md the hero, the CTA and the Speech card read as one crowded stack.
  content: { paddingVertical: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  hud: { flexDirection: 'row', alignItems: 'center', gap: HUD_GAP },
  // The narrow variant: who is flying on one line, what they have collected on the next.
  hudStacked: { gap: SPACING.sm },
  hudWho: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  // Claim the room the capsules leave, and only on one line: flexBasis 0 inside the STACKED
  // (column) variant would resolve against a parent with no free height and collapse the row.
  hudWhoFill: { flexGrow: 1, flexBasis: 0, flexShrink: 1 },
  hudStats: { flexDirection: 'row', alignItems: 'center', gap: HUD_GAP },
  hudStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: HUD_GAP },
  hudName: { flex: 1, marginLeft: 4, marginRight: 2, minWidth: 0 },
  greeting: { fontFamily: Fonts.bold, fontSize: 13 },
  name: { fontFamily: Fonts.black, alignSelf: 'stretch' },
  capsule: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: AdventureRadius.pill, borderWidth: 1.5 },
  capsuleValue: { fontFamily: Fonts.black, fontSize: 14 },
  hero: { borderRadius: AdventureRadius.hero, borderWidth: 1.5, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg, gap: SPACING.sm },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  heroText: { flex: 1, minWidth: 0, gap: 4, justifyContent: 'center', paddingRight: SPACING.xs },
  headline: { fontFamily: Fonts.black, letterSpacing: 1, alignSelf: 'stretch' },
  tagline: { fontFamily: Fonts.bold, alignSelf: 'stretch', opacity: 0.92 },
  meter: { borderRadius: AdventureRadius.card, borderWidth: 1.5, borderColor: 'transparent', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, gap: 6 },
  meterTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  level: { fontFamily: Fonts.black, fontSize: 13, flexShrink: 1 },
  meterValue: { fontFamily: Fonts.bold, fontSize: 13 },
  track: { height: 12, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, overflow: 'hidden' },
  console: {
    flexGrow: 1,
    overflow: 'hidden',
    borderRadius: AdventureRadius.card,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    padding: SPACING.lg,
    gap: SPACING.md,
    minHeight: 104,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  consoleHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  // The illustration stands on the card; a soft drop shadow lifts it off the colour.
  art: { alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1030', shadowOpacity: 0.28, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '60%' },
  arrow: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  // A small game control: darker plate, white rim, white chevron, a drop shadow.
  gameArrow: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.75)', shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  badgeSolid: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  chipOnSolid: { backgroundColor: 'rgba(255,255,255,0.24)', borderColor: 'rgba(255,255,255,0.5)' },
  heroSolid: { backgroundColor: '#1E2A63', borderColor: '#4E63C8' },
  decorCorner: { position: 'absolute', top: 10, right: 18, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.55 },
  decorInline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.55 },
  stackTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  mascotWrap: { alignItems: 'center', justifyContent: 'center' },
  bubble: {
    maxWidth: '100%',
    marginTop: -6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: AdventureRadius.pill,
    shadowColor: '#0A0E2C',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  bubbleText: { fontFamily: Fonts.black, fontSize: 13, color: '#13233F' },
  bubbleTail: {
    position: 'absolute',
    top: -5,
    left: '46%',
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  missionFoot: { gap: 8 },
  // Collection strip inside the hero: five small prizes and a count; quiet, so it never outranks LET'S GO.
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: MIN_CHILD_TARGET - 8,
    paddingHorizontal: SPACING.md,
    borderRadius: AdventureRadius.card,
    backgroundColor: 'rgba(8,11,38,0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  stripInvite: { backgroundColor: '#FFD84D', borderColor: '#FFF0B8' },
  // flexShrink, never flex:1. Growing to fill the strip is what let the art run under the title.
  stripArt: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 },
  // The stacked variant: title row above, art row below, each with the full width to itself.
  stripStacked: { flexDirection: 'column', alignItems: 'stretch', gap: 6, paddingVertical: SPACING.sm },
  stripTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  stripArtRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: SPACING.sm },
  stripText: { fontFamily: Fonts.black, fontSize: 15, flexShrink: 1, minWidth: 0, textAlign: 'center' },
  // Room on the right so the rocket never pokes past the card at 5 / 5.
  missionBar: { justifyContent: 'center', height: 30, marginRight: 14 },
  missionRocket: { position: 'absolute', marginLeft: -15, top: 0 },
  rewardSolid: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  reward: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: AdventureRadius.pill, borderWidth: 1.5 },
  rewardText: { fontFamily: Fonts.black, fontSize: 13 },
  missionTrack: { height: 12, borderRadius: 999, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  missionFill: { height: '100%', borderRadius: 999, overflow: 'hidden' },
  consoleText: { flex: 1, gap: 2 },
  consoleTextStacked: { gap: 2 },
  consoleTitle: { fontFamily: Fonts.black, alignSelf: 'stretch', textShadowColor: 'rgba(0,0,0,0.22)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  consoleSub: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18, alignSelf: 'stretch' },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: AdventureRadius.pill, borderWidth: 1.5 },
  // Deeper lift on a solid card, so it sits above the sky rather than in it.
  solidLift: { shadowOpacity: 0.38, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  // Speech Practice: the strongest glow on the screen (glow is used selectively, not everywhere).
  featuredLift: { borderWidth: 2.5, borderBottomWidth: 6, shadowOpacity: 0.7, shadowRadius: 22, elevation: 12 },
  badgeText: { fontFamily: Fonts.black, fontSize: 13 },
  pair: { flexDirection: 'row', gap: SPACING.md },
  sectionTitle: { fontFamily: Fonts.black, fontSize: 17, marginTop: SPACING.xs, marginBottom: -SPACING.xs },
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Secondary navigation: compact, one consistent height, a thin rim and a quiet shadow, so the row
  // never competes with the quest cards above it.
  explore: {
    height: MIN_CHILD_TARGET + 26,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0A0E2C',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  exploreGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  exploreTitle: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  quiet: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: MIN_CHILD_TARGET - 8, paddingHorizontal: SPACING.lg, borderRadius: AdventureRadius.card, borderWidth: 1.5 },
  quietText: { flex: 1, fontFamily: Fonts.extrabold, fontSize: 15 },
});
