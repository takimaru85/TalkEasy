import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Glyph } from '@/components/common/Glyph';
import { Icon } from '@/components/common/Icon';
import { GameIcon } from '@/components/adventure/GameIcon';
import { GameButton } from '@/components/adventure/GameButton';
import { ROUTINE_SEGMENT_TINT } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { showsCountdown, startsIn, type DayState, type ScheduleEntry } from '@/myday/schedule';
import { AdventureRadius, Fonts, shade, useTheme } from '@/theme';
import { useI18n } from '@/i18n';
import { formatTime } from '@/utils/date';

interface Props {
  state: DayState;
  /** 'home': a compact status card that opens My Day. 'full': the header of My Day, with actions. */
  variant?: 'home' | 'full';
  /** Tap anywhere on the card: open the full My Day schedule. */
  onOpen?: () => void;
  /** Tap the NEXT panel: open that step's activity (its own touch target inside the card). */
  onOpenEntry?: (entry: ScheduleEntry) => void;
  /** "Let's go" on the step whose time has come. */
  onGo?: (entry: ScheduleEntry) => void;
  /** Full variant: tick the NOW step, or skip it for today. */
  onDone?: (entry: ScheduleEntry) => void;
  onSkip?: (entry: ScheduleEntry) => void;
}

const GOLD = '#FFD166';
/** Icon size in the compact NOW / NEXT rows: beside the words, not above them. */
const ICON = 36;

/**
 * MyDayUpcoming — "What am I doing now? What's next?", live.
 *
 * Driven entirely by `state` (computeDay over the real schedule and clock), so it changes by
 * itself: NOW and NEXT, each with its time and — within two hours — "Starts in…"; "UP NEXT" from
 * 15 minutes; a soft glow from 5; "It's time!" with Let's go when a step starts; and when NOW is
 * finished the schedule advances by itself.
 *
 * NEXT is a waiting message: a pulsing dot beside its label, its own panel, and its own touch
 * target (it opens that step's activity), while the rest of the card opens My Day. It is never
 * bigger than NOW — same icon and type sizes — only more noticeable.
 *
 * Calm on purpose. Only two small things ever move — the NEXT dot (opacity 1 → 0.5, scale
 * 1 → 1.08, ~1.6 s) and, when it is time, the bell — and nothing moves in reduced-motion mode.
 * The card itself never flashes. React Native Animated with the native driver: Expo Go, iOS,
 * Android and web alike. No sound: the visual cue works on its own.
 */
export function MyDayUpcoming({ state, variant = 'home', onOpen, onOpenEntry, onGo, onDone, onSkip }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const { tContent } = useI18n();
  const night = theme.night;
  const ink = theme.colors.text;
  const muted = theme.colors.textMuted;
  const { now, next, itsTime, nextPhase, minutesUntilNext, minutesUntilNow } = state;
  const label = (e: ScheduleEntry) => tContent(e.item.label);
  const tint = (e: ScheduleEntry) => ROUTINE_SEGMENT_TINT[e.item.segment];

  const header = (
    <View style={styles.header}>
      {night ? <GameIcon name="myday" size={22} /> : <Icon name="calendar-check" size={20} color={ink} />}
      <Text style={[styles.kicker, { color: night ? GOLD : muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
        MY DAY
      </Text>
      <View style={styles.flex} />
      <View style={[styles.count, { backgroundColor: night ? 'rgba(255,255,255,0.14)' : theme.colors.surfaceAlt }]}>
        <Icon name="check" size={14} color={ink} />
        <Text style={[styles.countText, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {state.done} / {state.total}
        </Text>
      </View>
    </View>
  );

  let body: React.ReactNode;
  let a11y: string;

  if (itsTime) {
    // ---- It's time! -------------------------------------------------------------------------
    const e = itsTime;
    a11y = `It's time! ${label(e)}.`;
    body = (
      <View style={styles.itsTime}>
        <View style={styles.itsTimeHead}>
          <Pulse active strength="strong">
            <View style={[styles.bell, { backgroundColor: GOLD }]}>
              <Icon name="bell-ring" size={20} color="#5A3A00" />
            </View>
          </Pulse>
          <Text style={[styles.itsTimeTitle, { color: night ? GOLD : ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            IT'S TIME!
          </Text>
        </View>
        <View style={styles.itsTimeItem}>
          <Glyph value={e.item.icon} size={52} tint={tint(e)} />
          <View style={styles.flexShrink}>
            <Text style={[styles.bigLabel, { fontSize: sizes.tileLabel + 2, color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
              {label(e)}
            </Text>
            <Text style={[styles.sub, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
              It's time for {label(e).toLowerCase()}!
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          {onGo ? <GameButton label="LET'S GO" icon="arrow-right-bold" tone="grass" primary onPress={() => onGo(e)} style={styles.flex} /> : null}
          {variant === 'full' && onDone ? <GameButton label="I did it!" icon="check-bold" tone="sky" onPress={() => onDone(e)} style={styles.flex} /> : null}
        </View>
        {variant === 'full' && onSkip ? <SkipLink onPress={() => onSkip(e)} /> : null}
      </View>
    );
  } else if (state.allDone) {
    // ---- All done ---------------------------------------------------------------------------
    a11y = 'Everything on My Day is done.';
    body = (
      <View style={styles.allDone}>
        <Icon name="party-popper" size={30} color={night ? GOLD : ink} />
        <Text style={[styles.bigLabel, { fontSize: sizes.tileLabel, color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          All done today!
        </Text>
      </View>
    );
  } else {
    // ---- NOW | NEXT -------------------------------------------------------------------------
    const close = nextPhase === 'upNext' || nextPhase === 'almost';
    // Home is compact: "Starts in 55 min". The full My Day header keeps the words in full.
    const short = variant === 'home';
    const nowCountdown = now && showsCountdown(minutesUntilNow) ? startsIn(minutesUntilNow ?? 0, short) : null;
    const nextCountdown = next && showsCountdown(minutesUntilNext) ? startsIn(minutesUntilNext ?? 0, short) : null;
    const nextTime = next?.item.startTime ? formatTime(next.item.startTime) : next ? 'After this' : '';
    a11y = `Now: ${now ? label(now) : 'free time'}${nowCountdown ? `, ${nowCountdown}` : ''}. ${next ? `Next: ${label(next)}, ${nextTime}${nextCountdown ? `, ${nextCountdown}` : ''}.` : ''}`;

    const nextPanel = next ? (
      <>
        {/* "● NEXT": the dot sits beside the word, like a new message waiting. */}
        <View style={styles.nextHead}>
          <Pulse active strength={nextPhase === 'almost' ? 'glow' : 'soft'}>
            <View style={[styles.dot, { backgroundColor: GOLD }]} />
          </Pulse>
          <Text style={[styles.colLabel, { color: night ? GOLD : ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {close ? 'UP NEXT' : 'NEXT'}
          </Text>
        </View>
        <View style={styles.itemRow}>
          <Glyph value={next.item.icon} size={ICON} tint={tint(next)} />
          <View style={styles.itemText}>
            <Text style={[styles.itemLabel, { fontSize: sizes.body + 1, lineHeight: Math.round((sizes.body + 1) * 1.2), color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
              {label(next)}
            </Text>
            <Text style={[styles.time, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {nextTime}
            </Text>
            {nextCountdown ? (
              <Text style={[styles.countdown, { color: close && night ? GOLD : ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {nextCountdown}
              </Text>
            ) : null}
            {nextPhase === 'almost' ? (
              <Text style={[styles.countdown, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>Almost time!</Text>
            ) : null}
          </View>
        </View>
      </>
    ) : null;

    const nextPanelStyle = [
      styles.col,
      styles.nextPanel,
      night
        ? { backgroundColor: 'rgba(91,140,255,0.16)', borderColor: nextPhase === 'almost' ? GOLD : 'rgba(127,182,255,0.55)' }
        : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft },
    ];

    body = (
      <View style={styles.columns}>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>NOW</Text>
          {now ? (
            <>
              <View style={styles.itemRow}>
                <Glyph value={now.item.icon} size={ICON} tint={tint(now)} />
                <View style={styles.itemText}>
                  <Text style={[styles.itemLabel, { fontSize: sizes.body + 1, lineHeight: Math.round((sizes.body + 1) * 1.2), color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                    {label(now)}
                  </Text>
                  {now.item.startTime ? (
                    <Text style={[styles.time, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>{formatTime(now.item.startTime)}</Text>
                  ) : null}
                  {nowCountdown ? (
                    <Text style={[styles.countdown, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {nowCountdown}
                    </Text>
                  ) : null}
                </View>
              </View>
              {variant === 'full' && onSkip ? <SkipLink onPress={() => onSkip(now)} /> : null}
            </>
          ) : (
            <View style={styles.itemRow}>
              <Glyph value="star-shooting-outline" size={ICON} tint="#E8DFFF" />
              <View style={styles.itemText}>
                <Text style={[styles.itemLabel, { fontSize: sizes.body + 1, color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>Free time</Text>
                <Text style={[styles.time, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>Play or learn!</Text>
              </View>
            </View>
          )}
        </View>

        {next && onOpenEntry ? (
          // Its own touch target inside the card: tapping NEXT opens that step's activity.
          <Pressable
            onPress={() => onOpenEntry(next)}
            accessibilityRole="button"
            accessibilityLabel={`Next: ${label(next)}. Open it.`}
            hitSlop={4}
            style={({ pressed }) => [...nextPanelStyle, pressed && styles.pressed]}
          >
            {nextPanel}
          </Pressable>
        ) : next ? (
          <View style={nextPanelStyle}>{nextPanel}</View>
        ) : (
          <View style={styles.col}>
            <Text style={[styles.colLabel, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>NEXT</Text>
            <Text style={[styles.time, { color: muted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Nothing else today</Text>
          </View>
        )}
      </View>
    );
  }

  const card = (
    <View
      style={[
        styles.shell,
        night ? styles.shellNight : null,
        itsTime && night ? styles.shellGlow : null,
      ]}
    >
      <View
        style={[
          styles.card,
          night
            ? { backgroundColor: '#1E2A63', borderColor: itsTime ? GOLD : shade('#1E2A63', 1.6), borderBottomColor: itsTime ? '#C99A0A' : '#111943' }
            : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderBottomColor: theme.colors.border },
          itsTime ? styles.cardStrong : null,
        ]}
      >
        {header}
        {body}
      </View>
    </View>
  );

  // On Home the whole card opens My Day; its own buttons (Let's go) still work inside it.
  const openNextAction = next && onOpenEntry && !itsTime ? [{ name: 'openNext', label: `Open ${label(next)}` }] : [];
  return onOpen ? (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`My Day. ${a11y}`}
      accessibilityHint="Opens the whole day"
      accessibilityActions={[{ name: 'activate' }, ...openNextAction]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'openNext' && next && onOpenEntry) onOpenEntry(next);
        else onOpen();
      }}
    >
      {card}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={`My Day. ${a11y}`}>{card}</View>
  );
}

function SkipLink({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Skip this for today" hitSlop={10} style={styles.skip}>
      <Icon name="skip-next" size={16} color={theme.colors.textMuted} />
      <Text style={[styles.skipText, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Skip
      </Text>
    </Pressable>
  );
}

/**
 * A slow, gentle pulse around ONE small element. 'soft' breathes the dot; 'glow' adds a fading
 * ring; 'strong' (it's time) is a slightly larger breath. Stops completely in reduced motion.
 */
function Pulse({ active, strength, children }: { active: boolean; strength: 'soft' | 'glow' | 'strong'; children: React.ReactNode }) {
  const theme = useTheme();
  const t = useRef(new Animated.Value(0)).current;
  const still = theme.duration(1) === 0;

  useEffect(() => {
    if (!active || still) {
      t.stopAnimation();
      t.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, still, t]);

  const peak = 1.08;
  const dim = strength === 'strong' ? 1 : 0.5;
  return (
    <View style={styles.pulseWrap}>
      {strength === 'glow' && active && !still ? (
        <Animated.View
          style={[
            styles.ring,
            { opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }] },
          ]}
        />
      ) : null}
      <Animated.View style={{ opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, dim] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, peak] }) }] }}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  // Shadow layer + clipping card (iOS clips a shadow to its own overflow).
  shell: { borderRadius: AdventureRadius.card },
  shellNight: { shadowColor: '#050823', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5, backgroundColor: '#1E2A63' },
  // When it is time: a soft, STEADY gold glow — never flashing.
  shellGlow: { shadowColor: GOLD, shadowOpacity: 0.55, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 9 },
  // Compact on purpose (Home): a status line, not a dashboard — so it never outweighs Speech Practice.
  card: {
    borderRadius: AdventureRadius.card,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  cardStrong: { borderWidth: 2.5, borderBottomWidth: 5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1.2 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999 },
  countText: { fontFamily: Fonts.black, fontSize: 14 },
  columns: { flexDirection: 'row', gap: SPACING.sm },
  col: { flex: 1, minWidth: 0, gap: 4 },
  nextPanel: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: SPACING.sm, paddingVertical: 6, marginVertical: -2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  itemText: { flex: 1, minWidth: 0 },
  countdown: { fontFamily: Fonts.black, fontSize: 13, marginTop: 1 },
  nextHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pressed: { opacity: 0.85 },
  colLabel: { fontFamily: Fonts.black, fontSize: 12, letterSpacing: 1.1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pulseWrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD },
  itemLabel: { fontFamily: Fonts.black },
  time: { fontFamily: Fonts.bold, fontSize: 14 },
  timeStrong: { fontFamily: Fonts.black, fontSize: 15 },
  sub: { fontFamily: Fonts.bold, fontSize: 14 },
  itsTime: { gap: SPACING.sm },
  itsTimeHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  bell: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  itsTimeTitle: { fontFamily: Fonts.black, fontSize: 22, letterSpacing: 0.6 },
  itsTimeItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  bigLabel: { fontFamily: Fonts.black },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  allDone: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs },
  skip: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginTop: 2, minHeight: 32 },
  skipText: { fontFamily: Fonts.bold, fontSize: 14 },
});

