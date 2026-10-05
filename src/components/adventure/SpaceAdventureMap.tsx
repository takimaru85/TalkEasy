import React, { useEffect, useId, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { newlyCompleted, type MapStageDef, type MapStageState } from '@/adventure/adventureMap';
import type { WorldArtName } from '@/adventure/worlds';
import { Celebration, PressableScale } from '@/components/common';
import { useProfile } from '@/context/ProfileContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useAdventureMap } from '@/hooks/useTodayAdventure';
import { useI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius } from '@/theme/adventure';
import { GradientSurface } from './GradientSurface';
import { Mascot } from './Mascot';
import { WorldArt } from './WorldArt';

/** The planet drawn for each stage (existing World art; nothing new is bundled). */
const PLANET_ART: Record<MapStageDef['id'], WorldArtName> = {
  firstWords: 'earth',
  soundExplorer: 'saturn',
  wordBuilder: 'moon',
  talkingChampion: 'rocket',
};

/**
 * Stages already celebrated (or already complete when the child first opened the map), per profile,
 * for this app session. Module-level on purpose: the map unmounts when the child goes to practise,
 * and a stage finished meanwhile must celebrate once when they come back — not on every open.
 * The first look only records a baseline, so already-finished stages never celebrate.
 */
const seenComplete = new Map<number, Set<string>>();

/** A soft atmospheric glow: a radial fade from the colour to nothing, never a flat disc. */
function Halo({ size, color }: { size: number; color: string }) {
  const id = `halo${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={id} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
          <Stop offset="0.45" stopColor={color} stopOpacity="0.75" />
          <Stop offset="0.75" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * One planet: its art, a soft outer glow, and a ✓ when finished.
 *  - current: the glow breathes and the planet pulses gently, with a twinkling sparkle;
 *  - newly completed: a short springy pop;
 *  - upcoming: the same planet, a little dimmer and without glow — never marked complete, never locked.
 * One native-driver loop, stopped when the screen is not in front. With reduced motion it is a still
 * picture (current keeps a steady glow).
 */
function Planet({ stage, size, art, celebrate, active }: { stage: MapStageState; size: number; art: WorldArtName; celebrate: boolean; active: boolean }) {
  const reduced = useReducedMotion();
  const phase = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const c = Adventure[stage.def.color];
  const pulsing = stage.current && active && !reduced;

  useEffect(() => {
    if (!pulsing) {
      phase.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(phase, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(phase, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, phase]);

  useEffect(() => {
    if (!celebrate || reduced) return;
    pop.setValue(1.3);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 110, useNativeDriver: true }).start();
  }, [celebrate, reduced, pop]);

  const scale = Animated.multiply(phase.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }), pop);
  const glowSize = size + 44;
  // Completed planets keep a calm, still glow; only the current one breathes.
  const glowOpacity = stage.current
    ? reduced ? 0.8 : phase.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] })
    : stage.done || celebrate
      ? 0.7
      : 0.35;
  const box = size + 30;

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', opacity: glowOpacity }}>
        <Halo size={glowSize} color={stage.done ? Adventure.grass.from : stage.current ? Adventure.sun.from : c.from} />
      </Animated.View>
      <Animated.View style={{ transform: [{ scale }], opacity: stage.current || stage.done || stage.count > 0 ? 1 : 0.78 }}>
        <WorldArt name={art} size={size} />
      </Animated.View>
      {stage.done ? (
        <View style={[styles.check, { right: 2, bottom: 4 }]}>
          <Text style={styles.checkText} maxFontSizeMultiplier={MAX_FONT_SCALE}>✓</Text>
        </View>
      ) : null}
      {stage.current ? (
        <Animated.Text
          pointerEvents="none"
          style={[styles.sparkle, { opacity: reduced ? 0.85 : phase }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          ✦
        </Animated.Text>
      ) : null}
    </View>
  );
}

/** The wooden-sign title: warm wood, two nails, cream lettering. A decorative surface with real text. */
export function WoodenSign({ text, ink, plain }: { text: string; ink: string; plain: boolean }) {
  return (
    <View style={[styles.sign, plain && { backgroundColor: 'transparent', borderColor: ink }]}>
      {plain ? null : (
        <>
          <GradientSurface from="#C98A4B" to="#8A5128" direction="vertical" />
          <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.22} toOpacity={0} toOffset={0.5} />
          <View style={[styles.nail, { left: 10 }]} />
          <View style={[styles.nail, { right: 10 }]} />
        </>
      )}
      <Text style={[styles.signText, { color: plain ? ink : '#FFF4DC' }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} accessibilityRole="header">
        {text}
      </Text>
    </View>
  );
}

/**
 * The speech journey as four planets joined by a dotted trail. Each opens a real practice screen
 * and each fills from a counted metric (see adventure/adventureMap.ts). Nothing is locked, and
 * opening a stage earns nothing: only practice moves the bar.
 */
export function SpaceAdventureMap({ leading }: { leading?: React.ReactNode } = {}) {
  const theme = useTheme();
  const { t } = useI18n();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stages, targetId, ready } = useAdventureMap();
  const { profile } = useProfile();
  const focused = useIsFocused();
  const [burst, setBurst] = useState(0);
  const [cheer, setCheer] = useState<MapStageDef['id'] | null>(null);
  const [width, setWidth] = useState(0);
  const plain = theme.highContrast;
  const ink = plain ? theme.colors.text : '#FFFFFF';
  const next = stages.find((s) => s.current);
  const cheered = stages.find((s) => s.def.id === cheer);
  const openStage = (def: MapStageDef) =>
    def.route.screen === 'SoundTarget'
      ? nav.navigate('SoundTarget', { targetId })
      : nav.navigate('SpeechStage', { stageId: def.route.stageId });

  useEffect(() => {
    if (!ready) return;
    const seen = seenComplete.get(profile.id);
    if (!seen) {
      seenComplete.set(profile.id, new Set(stages.filter((s) => s.done).map((s) => s.def.id)));
      return;
    }
    const fresh = newlyCompleted(seen, stages);
    if (fresh.length === 0) return;
    fresh.forEach((id) => seen.add(id));
    setBurst((n) => n + 1);
    setCheer(fresh[0] as MapStageDef['id']);
    AccessibilityInfo.announceForAccessibility(t('advMapCelebrate'));
  }, [ready, stages, profile.id, t]);

  // Geometry. The planets wind down the screen (left, right, centre-left, right) and a dotted trail
  // runs from the edge of one to the edge of the next. The label goes on whichever side has room.
  // Floored like every width-derived size in the app (the first frame can report 0).
  const inner = Math.max(MIN_SUPPORTED_WIDTH - SPACING.md * 2 - 4, width);
  const size = Math.round(Math.min(104, Math.max(70, inner * 0.24)));
  const box = size + 30;
  const rowH = box + SPACING.sm;
  const FRACTIONS = [0.2, 0.74, 0.3, 0.78];
  const cx = (i: number) => Math.min(inner - box / 2, Math.max(box / 2, inner * FRACTIONS[i % FRACTIONS.length]));
  const cy = (i: number) => i * rowH + box / 2;
  const trail = stages
    .slice(1)
    .map((_, k) => {
      const i = k + 1;
      // Planet edge to planet edge, so the dots never run through a planet or a stage label.
      const x0 = cx(i - 1), y0 = cy(i - 1) + size / 2 - 4, x1 = cx(i), y1 = cy(i) - size / 2 + 4;
      const mid = (y0 + y1) / 2;
      return `M${x0} ${y0} C${x0} ${mid}, ${x1} ${mid}, ${x1} ${y1}`;
    })
    .join(' ');

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {leading}
        <View style={styles.signSlot}>
          <WoodenSign text={t('advMapTitle')} ink={ink} plain={plain} />
        </View>
      </View>

      <View style={{ height: rowH * stages.length }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Svg width={inner} height={rowH * stages.length} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path d={trail} stroke={plain ? theme.colors.textMuted : '#FFFFFF'} strokeOpacity={0.7} strokeWidth={3.5} strokeDasharray="0.1 10" strokeLinecap="round" fill="none" />
        </Svg>
        {stages.map((s, i) => {
          const title = t(s.def.titleKey);
          const c = Adventure[s.def.color];
          const planetLeft = cx(i) < inner / 2;
          const labelW = Math.max(104, Math.min(176, inner - box - SPACING.sm));
          const pct = Math.round((s.count / s.def.goal) * 100);
          return (
            <PressableScale
              key={s.def.id}
              onPress={() => openStage(s.def)}
              accessibilityRole="button"
              accessibilityLabel={t('advMapStop', { stage: title, done: s.count, total: s.def.goal })}
              hitSlop={4}
              style={{ position: 'absolute', top: i * rowH, left: Math.max(0, cx(i) - box / 2 - (planetLeft ? 0 : labelW + SPACING.sm)), height: rowH, justifyContent: 'center' }}
            >
              <View style={[styles.row, { flexDirection: planetLeft ? 'row' : 'row-reverse' }]}>
                <Planet stage={s} size={size} art={PLANET_ART[s.def.id]} celebrate={s.def.id === cheer} active={focused} />
                <View
                  style={[
                    styles.label,
                    {
                      width: labelW,
                      backgroundColor: plain ? theme.colors.surfaceAlt : 'rgba(10,6,48,0.78)',
                      borderColor: s.def.id === cheer ? Adventure.grass.from : s.current ? Adventure.sun.from : 'rgba(255,255,255,0.28)',
                    },
                  ]}
                >
                  <Text style={[styles.name, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                    {title}
                  </Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${pct}%`, backgroundColor: s.done ? Adventure.grass.from : c.from }]} />
                  </View>
                  <Text style={[styles.count, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {s.count}/{s.def.goal}{s.done ? ' ⭐' : ''}
                  </Text>
                </View>
              </View>
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Mascot size={Math.round(Math.min(124, Math.max(88, inner * 0.3)))} mood={cheered ? 'cheer' : 'happy'} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
            {cheered ? t('advMapGreat', { stage: t(cheered.def.titleKey) }) : next ? t('advMapNext', { stage: t(next.def.titleKey) }) : t('advMapAllDone')}
          </Text>
        </View>
      </View>

      {cheered ? (
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.cardTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('advMapCelebrate')}
          </Text>
          {next ? (
            <PressableScale onPress={() => { setCheer(null); openStage(next.def); }} accessibilityRole="button" hitSlop={4}>
              <View style={styles.btn}>
                <Text style={styles.btnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advMapContinue', { stage: t(next.def.titleKey) })}</Text>
              </View>
            </PressableScale>
          ) : (
            <Text style={styles.cardText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advMapAllDone')}</Text>
          )}
          <PressableScale onPress={() => setCheer(null)} accessibilityRole="button" hitSlop={4}>
            <View style={[styles.btn, styles.btnQuiet]}>
              <Text style={styles.btnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advMapStay')}</Text>
            </View>
          </PressableScale>
        </View>
      ) : null}
      <Celebration trigger={burst} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  signSlot: { flex: 1, minWidth: 0 },
  sign: { alignSelf: 'stretch', borderRadius: 16, borderWidth: 3, borderColor: '#5E3418', backgroundColor: '#8A5128', overflow: 'hidden', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  nail: { position: 'absolute', top: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: '#3E220F' },
  signText: { fontFamily: Fonts.black, fontSize: 22, textAlign: 'center', textShadowColor: 'rgba(60,30,10,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  bubble: { flex: 1, minWidth: 0, borderRadius: AdventureRadius.card, borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(10,6,48,0.78)', padding: SPACING.md },
  bubbleText: { fontFamily: Fonts.bold, fontSize: 16, color: '#FFFFFF' },
  row: { alignItems: 'center', gap: SPACING.sm, minHeight: MIN_CHILD_TARGET },
  label: { borderRadius: 16, borderWidth: 2, paddingVertical: 6, paddingHorizontal: SPACING.sm + 2, gap: 3, flexShrink: 1 },
  name: { fontFamily: Fonts.black, fontSize: 17 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  count: { fontFamily: Fonts.black, fontSize: 15 },
  check: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: Adventure.grass.to, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#FFFFFF', fontFamily: Fonts.black, fontSize: 16, lineHeight: 20 },
  sparkle: { position: 'absolute', top: 2, right: 6, fontSize: 22, color: '#FFFFFF' },
  card: { borderRadius: AdventureRadius.card, borderWidth: 2, borderColor: Adventure.grass.from, backgroundColor: 'rgba(255,255,255,0.08)', padding: SPACING.md, gap: SPACING.sm },
  cardTitle: { fontFamily: Fonts.black, fontSize: 20, color: '#FFFFFF' },
  cardText: { fontFamily: Fonts.bold, fontSize: 16, color: '#FFFFFF' },
  btn: { minHeight: MIN_CHILD_TARGET, borderRadius: AdventureRadius.card, backgroundColor: Adventure.grass.to, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  btnQuiet: { backgroundColor: 'rgba(255,255,255,0.28)' },
  btnText: { fontFamily: Fonts.black, fontSize: 17, color: '#FFFFFF', textAlign: 'center' },
});
