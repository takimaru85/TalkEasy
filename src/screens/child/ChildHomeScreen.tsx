import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Avatar, Icon, PressableScale, ScreenContainer } from '@/components/common';
import {
  AdventureButton,
  EquippedBadge,
  DiscoveryBadge,
  HeroSparkles,
  GradientSurface,
  Artwork,
  ThemeMascot,
  SpaceNav,
  SyllableChips,
  TalkEasyLogo,
  WorldArt,
  WorldBackground,
} from '@/components/adventure';
import { PetCard } from '@/components/adventure/PetCard';
import { usePetReaction, usePetWardrobe } from '@/hooks/usePet';
import { game, themeFor, worldly, type CardArt, type CardSlot } from '@/adventure/themes';
import { TourOverlay, TourProvider, TourTarget, useTour } from '@/components/onboarding';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { MyDayUpcoming } from '@/components/myday/MyDayUpcoming';
import { useAdventure, useMyDay, useReducedMotion, useAdventureWorld, useCollection, useCurrentTarget, useAdventureMap, useSizes, useToday, useTodayAdventure, useTodayLessons, useTodaySoundPractice } from '@/hooks';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import type { RootScreenProps } from '@/navigation/types';
import { useSettings } from '@/context/SettingsContext';
import { SHOP_HINT_DONE, afterShopHintShown, shouldShowShopHint } from '@/adventure/shopHint';
import { useCollectionStrip } from '@/context/CollectionContext';
import { CollectibleArt } from '@/components/adventure/CollectibleArt';
import { AdventureZone, Fonts, useTheme } from '@/theme';
import { Adventure, AdventureNight, AdventureRadius, shade, type AdventureKey } from '@/theme/adventure';
import { fitFontSize, textWidth } from '@/utils/fitText';

/**
 * The Space Adventure Map card has its own picture (the ringed planet) and its own hue, so it does
 * not look like a second Speech Practice card (same robot, same orange). It is the map, not a theme
 * destination, so it does not come from the world theme's card slots.
 */
const MAP_CARD = { art: worldly('saturn'), color: 'reef' as const, decor: ['star-four-points', 'star-four-points'] };

type Destination =
  | 'SpeechPractice' | 'WritingPractice' | 'Learn' | 'Communicate' | 'Favorites' | 'AdaptiveHome'
  | 'MyProgress' | 'Achievements' | 'SoundPractice' | 'VoiceComm'
  | 'School' | 'MyDay' | 'Activities' | 'Feelings' | 'SchoolMode' | 'ParentPin'
  | 'Collection' | 'ChooseAdventure' | 'AdventureMap';

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
/** The SHOP segment on the star capsule: divider + gap + 18pt icon + gap + the word, before the word's own width. */
const SHOP_EXTRA = 1 + 8 + 8 + 18 + 4;
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
/**
 * The Home screen, wrapped in the tour provider.
 *
 * The provider has to sit ABOVE the screen that registers targets, so the body is its own
 * component. The overlay is a sibling of the body rather than a child of the ScrollView, so the
 * dim covers the whole screen and never scrolls away from what it is pointing at.
 */
export function ChildHomeScreen(props: RootScreenProps<'ChildHome'>) {
  return (
    <TourProvider>
      <HomeBody {...props} />
      <TourOverlay />
    </TourProvider>
  );
}

function HomeBody({ navigation }: RootScreenProps<'ChildHome'>) {
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
  // My Day, live (re-evaluated every minute): what is happening now, and what is next.
  const myDay = useMyDay();
  // What today actually is, and which sound to carry on with — both from real practice data.
  const { showTour, setScroller } = useTour();
  /**
   * The tour borrows this screen's scroller so it can bring a card below the fold into view
   * before pointing at it. The offset is tracked here because scrollTo needs an absolute
   * position and the tour only knows how far it wants to move.
   */
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollY = React.useRef(0);
  React.useEffect(() => {
    setScroller((dy) => scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + dy), animated: true }));
    return () => setScroller(null);
  }, [setScroller]);
  // First run only: showTour is a no-op once the tour has been finished or skipped. The delay lets
  // the cards lay out and report where they are, so the first spotlight lands on a measured target.
  React.useEffect(() => {
    const timer = setTimeout(() => showTour('home'), 700);
    return () => clearTimeout(timer);
  }, [showTour]);

  const today = useTodayAdventure();
  const target = useCurrentTarget();
  const adventureMap = useAdventureMap();
  const pet = usePetReaction(adventureMap);
  const wardrobe = usePetWardrobe(adventureMap);
  /**
   * The active theme's visual configuration. Every illustration, card colour and corner mark on
   * this screen comes from here — the screen never names a world, so a new theme is a new entry in
   * src/adventure/themes.ts and this file does not change.
   */
  const adv = themeFor(world.id);
  /** A theme's card, by slot. Saves repeating `adv.cards.x` at seven call sites. */
  const card = (slot: CardSlot) => adv.cards[slot];
  const collection = useCollection();
  // The Shop discovery hint: decided ONCE when Home opens (so it does not vanish mid-visit), counted, and gone for good
  // once dismissed or the Shop has been visited.
  const { settings: homeSettings, updateSetting } = useSettings();
  const [hintVisible, setHintVisible] = useState(() => shouldShowShopHint(homeSettings.shopHint));
  const hintCounted = useRef(false);
  useEffect(() => {
    if (hintCounted.current || !hintVisible) return;
    hintCounted.current = true;
    void updateSetting('shopHint', afterShopHintShown(homeSettings.shopHint));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The strip counts the full Space Collection (46) in the Space world; other worlds keep their own five.
  const strip = useCollectionStrip();
  const stripFound = strip.found;
  const stripTotal = strip.total;
  const stripItems = strip.items;
  const { width, height } = useWindowDimensions();

  // High contrast opts out of the universe: a starfield behind text is what that mode removes.
  const night = !theme.highContrast;
  const ink = night ? AdventureNight.ink : theme.colors.text;
  const inkMuted = night ? AdventureNight.inkMuted : theme.colors.textMuted;

  // Floored: see MIN_SUPPORTED_WIDTH. Every size on this screen is derived from this one, so a
  // negative here is not a cosmetic problem — it is how the three explore icons ended up rendering
  // as <svg width="-8"> and disappearing while their labels stayed put.
  const contentWidth = Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2;
  const half = (contentWidth - SPACING.md) / 2;
  // My Day is NOT here: it has its own live NOW / NEXT card above, the one way into the day.
  const exploreLabels = (['sectionSchool', 'sectionActivities', 'sectionFeelings'] as const).map((k) => t(k));
  const longestExplore = exploreLabels.reduce((a, b) => (b.length > a.length ? b : a));
  /**
   * More to Explore: three compact cards in ONE row (School, Activities, Feelings), sharing the full
   * width — dropping to one per row only if three would squeeze the longest label ("Activities")
   * below EXPLORE_LABEL_MIN, so there is never a 2 + 1 row with an orphan.
   *
   * The question is asked of the FITTER, not of a width constant: the answer depends on the OS
   * font scale as much as the screen, and the old width-only rule said yes on a 375pt phone while
   * the label needed more room than its tile had and ran over its neighbour. Passing min 1 asks
   * for the true fit rather than the clamped one.
   */
  const exploreRoom = (cols: number) => (contentWidth - SPACING.sm * (cols - 1)) / cols - SPACING.xs * 2 - 4;
  const exploreColumns = fitFontSize(longestExplore, exploreRoom(exploreLabels.length), 14, 'line', 1) >= EXPLORE_LABEL_MIN ? exploreLabels.length : 1;
  const exploreWidth = (contentWidth - SPACING.sm * (exploreColumns - 1)) / exploreColumns;
  const exploreArt = Math.round(Math.min(44, exploreWidth * 0.5));
  // One label size for all three, so the row reads evenly.
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
    ) + SHOP_EXTRA + textWidth(t('shopLabel'), 13) + HUD_GAP * 2;
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
  // Floor 16, not 18: LET'S GO! is all capitals, which are wider than the mixed-case average,
  // and at 320pt with the largest font scale an 18pt floor does not fit beside the mascot.
  const headlineSize = fitFontSize(t('advLetsGo'), heroTextW, sizes.heading + 8, 'line', 16);
  // Two lines, so the fitter is given two lines' worth of room.
  const taglineSize = fitFontSize(t('advTagline'), heroTextW * 2, 15, 'line', 12);
  const bubbleSize = fitFontSize(t('advPipLine'), heroArtW - SPACING.md * 2, 13, 'line', 9);

  const unfinished = todayLessons.filter((l) => l.activityCount > 0 && l.completedCount < l.activityCount);
  const startScreen: Destination = unfinished.length > 0 ? 'AdaptiveHome' : 'SpeechPractice';
  const dailyDone = Math.min(soundToday.soundsPracticed, DAILY_TARGET);

  const go = (screen: Destination) => () => navigation.navigate(screen);



  return (
    <AdventureZone>
      <ScreenContainer background={night ? AdventureNight.bottom : undefined}>
        {night ? (
          <>
            <WorldBackground world={world.id} width={width} height={height} />
            {/*
              A scrim between the scenery and the cards.

              The background is FIXED while the cards scroll over it, so a planet can come to rest
              anywhere relative to anything — and a bright one landing under the CTA's corner reads
              as part of the button rather than as sky behind it. Dimming the whole decorative layer
              is better than moving planets, because there is no arrangement that is correct at
              every scroll position.

              It is deliberately weak: the scenery still reads as depth, it just stops competing
              with the controls.
            */}
            <View style={styles.scrim} pointerEvents="none" />
          </>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
        >
          {/* Flight HUD: who is flying, and what they have collected. */}
          <View style={hudStacked ? styles.hudStacked : styles.hud}>
            <View style={[styles.hudWho, !hudStacked && styles.hudWhoFill]}>
              <View>
                <Avatar avatar={profile.avatar} photoUri={profile.photoUri} size={MIN_CHILD_TARGET - 8} />
                <View style={styles.equipped} pointerEvents="none">
                  <EquippedBadge size={26} />
                </View>
              </View>
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
              <Capsule icon="star" tone={Adventure.sun.from} value={adventure.totalStars} label={`${t('advStars', { n: adventure.totalStars })}. ${t('shopLabel')}: open the Rewards Shop`} night={night} ink={ink} onPress={() => navigation.navigate('RewardsShop')} pulseOnIncrease shopLabel={t('shopLabel')} />
              <Capsule icon="fire" tone={Adventure.coral.from} value={adventure.streak} label={t('advStreak', { n: adventure.streak })} night={night} ink={ink} />
              <Capsule icon="shield-star" tone={Adventure.grape.from} value={adventure.level} label={t('advLevel', { n: adventure.level })} night={night} ink={ink} />
            </View>
          </View>
          {hintVisible ? (
            <View style={styles.hint} accessible accessibilityLiveRegion="polite">
              <Text style={styles.hintText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('shopHintText')}</Text>
              <Pressable onPress={() => { setHintVisible(false); void updateSetting('shopHint', SHOP_HINT_DONE); }} accessibilityRole="button" accessibilityLabel={t('shopHintDismiss')} style={styles.hintClose} hitSlop={6}>
                <Icon name="close" size={18} color="#3A2A00" />
              </Pressable>
            </View>
          ) : null}

          <TalkEasyLogo size={Math.min(42, sizes.heading + 8)} tagline={t('advTaglineWorld')} />

          {/* Hero: Pip in the helmet, the call to fly, and the mission meter. */}
          <View style={[styles.hero, night ? styles.heroSolid : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.heroTop}>
              <View style={[styles.mascotWrap, { width: heroArtW }]}>
                {night ? <HeroSparkles size={Math.min(heroArtW + 28, sizes.iconSize + 92)} /> : null}
                <ThemeMascot mascot={adv.mascot} size={Math.min(heroArtW, sizes.iconSize + 64)} space={night} />
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
                  accessibilityLabel={`${t('advMyCollection')}. ${t('advFoundOf', { n: stripFound, total: stripTotal })}`}
                  hitSlop={4}
                >
                  <View style={styles.strip}>
                    <View style={styles.stripArt}>
                      {stripItems
                        ? stripItems.map((item) => <CollectibleArt key={item.id} art={item.art} size={worldArtSize} locked={!item.found} />)
                        : collection.items.map((item) => <WorldArt key={item.id} name={item.art} size={worldArtSize} locked={!item.found} />)}
                    </View>
                    <Text style={[styles.stripText, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {`${stripFound} / ${stripTotal}`}
                    </Text>
                    <Icon name="chevron-right" size={22} color={inkMuted} />
                  </View>
                </PressableScale>
              )
            ) : null}
          </View>

          {/* The label and the destination are the same in every theme; only the art changes. */}
          <TourTarget id="startAdventure">
          <AdventureButton
            label={t('advStart')}
            sublabel={t('advTodayPlan', { n: today.activities, m: today.estimatedMinutes })}
            icon="rocket-launch-outline"
            artNode={<Artwork art={adv.startArt} size={46} />}
            color={adv.accent}
            onPress={go(startScreen)}
          />
          </TourTarget>

          {/* Speech Practice is a core pillar: full width, and it says where the child GOT TO.
              The BA–BU chips used to sit here. Five tappable sounds on the entry screen asks a
              child to choose before anything has been explained; choosing a target is the first
              task inside Sounds, which is where they now live. */}
          <TourTarget id="speech">
          <FeatureCard
            title={t('questSpeech')}
            subtitle={t('questSpeechSub')}
            art={card('speech').art}
            color={card('speech').color}
            width={contentWidth}
            featured
            decor={card('speech').decor}
            onPress={() => (target.fresh || target.allDone ? navigation.navigate('SpeechPractice') : navigation.navigate('SoundTarget', { targetId: target.id }))}
            footer={
              <View style={styles.continueRow}>
                <Text
                  style={[styles.continueText, { fontSize: sizes.body, color: night ? '#FFFFFF' : ink }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={2}
                >
                  {target.allDone ? t('spAllSoundsDone') : t(target.stepsDone === 0 ? 'spStartWith' : 'spContinueWith', { sound: target.display })}
                </Text>
                <Text
                  style={[styles.continueCount, { color: night ? 'rgba(255,255,255,0.92)' : inkMuted }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={1}
                >
                  {target.allDone ? t('spAllSoundsAgain') : t('spStepsOf', { done: target.stepsDone, total: target.totalSteps })}
                </Text>
              </View>
            }
          >
            <View style={[styles.continueTrack, { backgroundColor: night ? 'rgba(0,0,0,0.24)' : theme.colors.surfaceAlt }]}>
              <View style={[styles.continueFill, { width: `${Math.round(target.progress * 100)}%` }]} />
            </View>
          </FeatureCard>
          </TourTarget>

          {/* My Day sits under Speech Practice, so the main learning activity is the first thing under the hero; it is still a live status (now, next, "it's time"). */}
          {myDay.total > 0 ? (
            <MyDayUpcoming
              state={myDay}
              onOpen={go('MyDay')}
              // A step's own activity (Homework → Lessons) if the parent linked one; otherwise My Day.
              onOpenEntry={(e) => (e.item.linkedActivity ? go(e.item.linkedActivity)() : go('MyDay')())}
              onGo={(e) => (e.item.linkedActivity ? go(e.item.linkedActivity)() : go('MyDay')())}
            />
          ) : null}

          <FeatureCard title={t('advMapHomeTitle')} subtitle={t('advMapHomeSub', { done: adventureMap.stages.filter((st) => st.done).length, total: adventureMap.stages.length })} {...MAP_CARD} width={contentWidth} onPress={go('AdventureMap')} />

          <PetCard mood={pet.mood} message={pet.message} burst={pet.burst} equipped={wardrobe.equipped} label={t('petDressUp')} onPress={() => navigation.navigate('SpacePet')} />

          <View style={styles.pair}>
            <FeatureCard title={t('questTrace')} subtitle={t('questTraceSub')} {...card('trace')} width={half} onPress={go('WritingPractice')} />
            <TourTarget id="talk">
              <FeatureCard title={t('questTalk')} subtitle={t('questTalkSub')} {...card('talk')} width={half} onPress={go('Communicate')} />
            </TourTarget>
          </View>
          <View style={styles.pair}>
            <TourTarget id="words">
              <FeatureCard title={t('questWords')} subtitle={t('questWordsSub')} {...card('words')} width={half} onPress={go('Favorites')} />
            </TourTarget>
            <TourTarget id="play">
              <FeatureCard title={t('questPlay')} subtitle={t('questPlaySub')} {...card('play')} width={half} onPress={go('Learn')} />
            </TourTarget>
          </View>

          {/* Lessons and Listen & Talk are PAIRED, not full width. Full width is what makes a card
              read as a pillar, and when eight cards all have it none of them do — which is most of
              what made this screen feel like a list rather than a product with a point of view.
              Two pillars keep it: today's adventure, and Speech Practice. */}
          <View style={styles.pair}>
            <TourTarget id="lessons">
              <FeatureCard title={t('questLessons')} subtitle={t('questLessonsSub')} {...card('lessons')} width={half} onPress={go('AdaptiveHome')} />
            </TourTarget>
            <FeatureCard title={t('vcTitle')} subtitle={t('vcSubtitle')} {...card('voice')} width={half} onPress={go('VoiceComm')} />
          </View>
          <FeatureCard
            title={t('advDaily')}
            subtitle={t('advDailySub')}
            art={card('mission').art}
            color={card('mission').color}
            width={contentWidth}
            badge={`${dailyDone} / ${DAILY_TARGET}`}
            decor={card('mission').decor}
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
                  <Artwork art={card('mission').art} size={30} />
                </View>
              </View>
            </View>
          </FeatureCard>

          <Text style={[styles.sectionTitle, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
            {t('advMore')}
          </Text>
          <View style={[styles.exploreGrid, { gap: SPACING.sm }]}>
            {([
              { screen: 'School', labelKey: 'sectionSchool', subKey: 'exploreSchoolSub', slot: 'school', art: 'school', tone: EXPLORE_TONES.school },
              { screen: 'Activities', labelKey: 'sectionActivities', subKey: 'exploreActivitiesSub', slot: 'activities', art: 'activities', tone: EXPLORE_TONES.activities, badge: 'exploreBadge' },
              { screen: 'Feelings', labelKey: 'sectionFeelings', subKey: 'exploreFeelingsSub', slot: 'feelings', art: 'feelings', tone: EXPLORE_TONES.feelings },
            ] as const).map((m) => {
              const c = m.tone;
              return (
                <PressableScale
                  key={m.screen}
                  onPress={go(m.screen)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(m.labelKey)}. ${t(m.subKey)}`}
                  hitSlop={4}
                  // A card with a badge sits above its neighbours (zIndex), or the next card in the row would
                  // paint over the part of the sticker that overhangs the gap.
                  style={{ width: exploreWidth, zIndex: 'badge' in m ? 2 : 0 }}
                >
                  {/* Shadow shell + clipping tile (iOS clips a shadow to its own overflow). */}
                  <View style={[styles.exploreShell, { backgroundColor: night ? c.to : theme.colors.surface }]}>
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
                        {/* Gloss: fades out 55% of the way down (a full-size surface — see GradientSurface). */}
                        <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.35} toOpacity={0} toOffset={0.55} />
                      </>
                    ) : null}
                    {/* A theme may dress these four; one that says nothing keeps the shared set. */}
                    {/* In a View, so on web it paints above the absolutely positioned gradient (a bare SVG
                        would sit underneath it; on iOS/Android tree order already puts it on top). */}
                    <View>
                      <Artwork art={adv.explore?.[m.slot] ?? game(m.art)} size={exploreArt} />
                    </View>
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
                  </View>
                  {/* Decorative and untouchable: a tap on it is a tap on the card. Outside the clipping tile on purpose. */}
                  {'badge' in m ? <DiscoveryBadge label={t(m.badge)} /> : null}
                </PressableScale>
              );
            })}
          </View>

          {/*
            A standalone School Mode bar used to sit here, between the explore row and the nav. It
            was removed as redundant: the explore row directly above it already has a School card,
            so Home offered two school doors side by side and the quieter of the two led to the
            busier screen. School Mode now opens from the top of the School screen -- one more tap,
            but from where a child already is when they are thinking about school. Nothing was
            merged or deleted: the screen, its route and its features are untouched, and Parent
            Mode can still open the app straight into it (schoolModeAtStart).
          */}

          {night ? (
            <TourTarget id="parent">
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
            </TourTarget>
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

function Capsule({ icon, tone, value, label, night, ink, onPress, pulseOnIncrease, shopLabel }: { icon: string; tone: string; value: number; label: string; night: boolean; ink: string; onPress?: () => void; pulseOnIncrease?: boolean; shopLabel?: string }) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const last = useRef(value);
  // A short pop when the number goes UP (a star was earned), never on load or on a drop (a purchase).
  // The first render only records the value, so opening the app with stars already earned is still.
  useEffect(() => {
    const rose = value > last.current;
    last.current = value;
    if (!pulseOnIncrease || !rose || reduced) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.25, duration: 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [value, pulseOnIncrease, reduced, scale]);

  const body = (
    <Animated.View
      style={[styles.capsule, night ? { backgroundColor: '#141B44', borderColor: tone } : { backgroundColor: '#FFFFFF', borderColor: '#D8DEEA' }, shopLabel ? styles.capsuleShop : null, { transform: [{ scale }] }]}
    >
      <Icon name={icon} size={15} color={tone} />
      <Text style={[styles.capsuleValue, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {value}
      </Text>
      {shopLabel ? (
        <>
          <View style={styles.shopDivider} />
          <Icon name="store" size={18} color="#FFC933" />
          <Text style={[styles.shopText, { color: night ? '#FFE27A' : ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {shopLabel}
          </Text>
        </>
      ) : null}
    </Animated.View>
  );
  if (!onPress) {
    return (
      <View accessible accessibilityRole="text" accessibilityLabel={label}>
        {body}
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={10}>
      {body}
    </Pressable>
  );
}

/**
 * A destination console. Narrow (half-width) cards stack: icon and arrow on top, the words
 * underneath at full width, so a subtitle like "Trace letters, numbers and words" never has to
 * squeeze beside the icon.
 */
/*
 * FeatureCard is a MODULE-LEVEL component on purpose. It used to be declared inside the screen's
 * render, which gives React a brand-new component type on every render of Home (stars loading,
 * the collection count, the clock) — so every card was unmounted and rebuilt each time, losing its
 * measured gradient and re-running its layout. Declared here, a card is created once and updated.
 */
function FeatureCard({
  title, subtitle, art, color, width: w, onPress, badge, children, footer, featured, decor,
}: {
  /** The destination's illustration, from the active theme (game / themed / collectible art). */
  title: string; subtitle: string; art: CardArt; color: AdventureKey; width: number;
  onPress: () => void; badge?: string;
  /** Full-width content under the head — a progress bar, a row of chips. */
  children?: React.ReactNode;
  /**
   * Content that lines up with the TITLE rather than the card edge. A line of text starting
   * under the icon while the title starts beside it reads as a mistake, because it is one.
   * Anything full-bleed (a bar, a chip row) belongs in `children` instead.
   */
  footer?: React.ReactNode;
  /** The core feature: a brighter rim, a stronger glow and a bigger icon, so it outranks its neighbours. */
  featured?: boolean;
  /** Two or three tiny themed marks (stars, letters, sound waves) in a free corner — never behind text. */
  decor?: string[];
}) {
  const sizes = useSizes();
  const theme = useTheme();
  // Same rules the screen uses: high contrast opts out of the night sky.
  const night = !theme.highContrast;
  const ink = night ? AdventureNight.ink : theme.colors.text;
  const inkMuted = night ? AdventureNight.inkMuted : theme.colors.textMuted;
  const cardStyle = (k: AdventureKey) =>
    night
      ? {
          backgroundColor: Adventure[k].to,
          // A lit rim on top and sides, a darker "lip" underneath: a raised, pressable game button.
          borderColor: shade(Adventure[k].from, 1.35),
          borderBottomColor: shade(Adventure[k].to, 0.68),
        }
      : { backgroundColor: Adventure[k].tint, borderColor: theme.colors.borderSoft };
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
      <Artwork art={art} size={disc} />
    </View>
  );

  const trailing = badge ? (
    <View style={[styles.badge, night ? styles.badgeSolid : { backgroundColor: `${c.from}33`, borderColor: `${c.from}88` }]}>
      <Text style={[styles.badgeText, { color: c.ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {badge}
      </Text>
    </View>
  ) : (
    <CardActionButton color={color} night={night} />
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
      {/*
        Two layers, because iOS clips a view's shadow to its own overflow:hidden. The SHELL casts
        the shadow (and Android elevation) and is never clipped; the card inside clips its
        gradient to the rounded corners. One layer looked right on web and Android and lost its
        glow entirely on an iPhone.
      */}
      <View
        style={[
          styles.consoleShell,
          { backgroundColor: cardStyle(color).backgroundColor },
          night && [styles.solidLift, { shadowColor: c.from }],
          featured && night && styles.featuredGlow,
        ]}
      >
      <View style={[styles.console, cardStyle(color), featured && night && styles.featuredRim]}>
        {night ? (
          <>
            <GradientSurface from={c.from} to={c.to} direction="vertical" />
            {/* Gloss: fades out 60% of the way down (a full-size surface — see GradientSurface). */}
            <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.34} toOpacity={0} toOffset={0.6} />
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
        {footer ? <View style={stacked ? undefined : { marginLeft: disc + SPACING.md }}>{footer}</View> : null}
        {children}
      </View>
      </View>
    </PressableScale>
  );
}

/**
 * CardActionButton — the round arrow on a card. A FIXED size (not a percentage, not "auto") with
 * flexShrink 0, so no row can squeeze it into an oval on any platform; the chevron is centred by
 * alignItems/justifyContent. It is a visual cue only — the whole card is the touch target.
 */
function CardActionButton({ color, night }: { color: AdventureKey; night: boolean }) {
  const c = Adventure[color];
  return (
    <View
      style={[styles.arrow, night ? [styles.gameArrow, { backgroundColor: shade(c.to, 0.78), shadowColor: shade(c.to, 0.45) }] : { backgroundColor: c.tint }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Icon name="chevron-right" size={24} color={night ? '#FFFFFF' : c.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Veils the scenery so a planet never reads as part of a card. See the comment at its use.
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,12,38,0.42)' },
  // lg between blocks: at md the hero, the CTA and the Speech card read as one crowded stack.
  content: { paddingVertical: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  hud: { flexDirection: 'row', alignItems: 'center', gap: HUD_GAP },
  // The narrow variant: who is flying on one line, what they have collected on the next.
  hudStacked: { gap: SPACING.sm },
  hudWho: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  // Claim the room the capsules leave, and only on one line: flexBasis 0 inside the STACKED
  // (column) variant would resolve against a parent with no free height and collapse the row.
  hudWhoFill: { flexGrow: 1, flexBasis: 0, flexShrink: 1 },
  equipped: { position: 'absolute', right: -8, bottom: -8, elevation: 6, zIndex: 6 },
  hudStats: { flexDirection: 'row', alignItems: 'center', gap: HUD_GAP },
  hudStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: HUD_GAP },
  hudName: { flex: 1, marginLeft: 4, marginRight: 2, minWidth: 0 },
  greeting: { fontFamily: Fonts.bold, fontSize: 13 },
  name: { fontFamily: Fonts.black, alignSelf: 'stretch' },
  capsule: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: AdventureRadius.pill, borderWidth: 1.5 },
  capsuleValue: { fontFamily: Fonts.black, fontSize: 14 },
  // The Shop button: the star capsule with a gold rim and a soft glow, so it reads as pressable.
  capsuleShop: { minHeight: 44, paddingVertical: 7, borderWidth: 2, shadowColor: '#FFC933', shadowOpacity: 0.55, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  shopDivider: { width: 1, height: 18, backgroundColor: 'rgba(255,201,51,0.55)', marginHorizontal: 4 },
  shopText: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 0.5 },
  hint: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFD84D', borderRadius: 18, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, maxWidth: '100%' },
  hintText: { flexShrink: 1, color: '#3A2A00', fontFamily: Fonts.extrabold, fontSize: 13 },
  hintClose: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
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
  // The shadow layer (never clipped) and the card (clips its gradient). See FeatureCard.
  consoleShell: {
    flexGrow: 1,
    borderRadius: AdventureRadius.card,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  console: {
    flexGrow: 1,
    overflow: 'hidden',
    borderRadius: AdventureRadius.card,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    padding: SPACING.lg,
    gap: SPACING.md,
    minHeight: 104,
  },
  consoleHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  // The illustration stands on the card; a soft drop shadow lifts it off the colour.
  // The Speech Practice card's continuation line: where the child got to, not a set of choices.
  // Wraps instead of truncating: on a narrow phone the step count drops under the words.
  continueRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: SPACING.sm, rowGap: 2 },
  continueText: { fontFamily: Fonts.black, flexShrink: 1, minWidth: 0 },
  continueCount: { fontFamily: Fonts.bold, fontSize: 13, flexShrink: 0 },
  continueTrack: { height: 10, borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  continueFill: { height: '100%', borderRadius: 999, backgroundColor: '#FFFFFF' },
  /**
   * No shadow on the illustration's CONTAINER.
   *
   * A shadow on a box that has no background is drawn around the BOX, not around the drawing
   * inside it — so a 62pt square halo appeared behind every illustration and read as a frame, as
   * though each one were a sticker placed on the card. The artwork already carries its own soft
   * ground ellipse, which is the only shadow it should have: beneath the object, not around it.
   */
  art: { alignItems: 'center', justifyContent: 'center' },
  arrow: { width: 38, height: 38, borderRadius: 19, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
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
  featuredRim: { borderWidth: 2.5, borderBottomWidth: 6 },
  featuredGlow: { shadowOpacity: 0.7, shadowRadius: 22, elevation: 12 },
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
  },
  exploreShell: {
    borderRadius: 18,
    shadowColor: '#0A0E2C',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  exploreTitle: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  quiet: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: MIN_CHILD_TARGET - 8, paddingHorizontal: SPACING.lg, borderRadius: AdventureRadius.card, borderWidth: 1.5 },
  quietText: { flex: 1, fontFamily: Fonts.extrabold, fontSize: 15 },
});
