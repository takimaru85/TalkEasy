import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { Glyph } from '@/components/common/Glyph';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { tileInk } from '@/constants/colors';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow, shade, type AdventureKey } from '@/theme/adventure';
import { GameIcon, type GameIconName } from './GameIcon';
import { ColorArt, type ColorArtName } from './ColorArt';
import { GradientSurface } from './GradientSurface';

interface Props {
  title: string;
  subtitle?: string;
  /** Small capitalised line above the title ("LEVEL 3"). */
  eyebrow?: string;
  /** Illustrated art for the disc; otherwise `glyph` (an emoji or a line-icon name). */
  art?: GameIconName;
  glyph?: string;
  /** A colourful illustration from the ColorArt sets (category, subject, level, therapy) — takes the place of `art`/`glyph`. */
  colorArt?: ColorArtName;
  /** Draw the illustration straight onto the card, a little larger, instead of inside a ringed disc. */
  bare?: boolean;
  /** The icon in the round arrow button; a play triangle unless a card says otherwise (a stage uses a chevron). */
  arrowIcon?: string;
  color?: AdventureKey;
  /** A soft tile tint (a subject's colour) instead of `color`: drawn in the solid colour it stands for. */
  tint?: string;
  /** Finished: a gold star medal and `doneLabel` instead of the play arrow. */
  done?: boolean;
  doneLabel?: string;
  /** Optional progress under the text, 0..1, with its label ("2 / 5"). */
  progress?: { value: number; label: string };
  /** A tighter card (smaller art, one-line description) — for finished missions in a long list. */
  compact?: boolean;
  /** The mission to do next: a gold rim, a soft gold glow, a gold play button and `currentLabel`. */
  current?: boolean;
  currentLabel?: string;
  /**
   * Behind TalkEasy Plus: a padlock instead of the play arrow, and the card steps back slightly.
   *
   * It stays TAPPABLE on purpose — tapping explains what Plus is. A card a child cannot press at
   * all just looks broken to them, and they have no way to find out why.
   */
  locked?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * One mission in a list (a writing level, a lesson, an activity): the list-screen sibling of the
 * home screen's game cards. On the night sky it is a SOLID card in its colour with a lighter rim, a
 * darker base, a white-rimmed art disc and a round play arrow; a finished mission swaps the arrow
 * for a gold star medal, so "done" is shown by shape and words as well as colour.
 *
 * Outside the night sky (high contrast) it falls back to a plain bordered surface card.
 */
export function MissionCard({ title, subtitle, eyebrow, art, glyph, colorArt, bare, arrowIcon, color = 'grape', tint, done, doneLabel, progress, compact, current, currentLabel, locked, onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const deep = tint ? tileInk(tint) : null;
  const c = deep ? { from: shade(deep, 1.35), to: deep } : Adventure[color];
  const night = theme.night;
  const disc = compact ? Math.max(52, sizes.iconSize + 4) : Math.max(MIN_CHILD_TARGET, sizes.iconSize + 18);
  // The next mission is marked by shape and words too (gold rim + label), never by glow alone.
  const highlight = night && current;
  const ink = night ? '#FFFFFF' : theme.colors.text;
  const inkMuted = night ? 'rgba(255,255,255,0.88)' : theme.colors.textMuted;

  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={4}>
      <View
        style={[
          styles.card,
          night
            ? [AdventureShadow, { backgroundColor: c.to, borderColor: shade(c.from, 1.3), borderBottomColor: shade(c.to, 0.66), borderWidth: 1.5, borderBottomWidth: 5 }]
            : { backgroundColor: theme.colors.surface, borderColor: current ? theme.colors.primary : theme.colors.border, borderWidth: current ? theme.borderWidth + 1 : theme.borderWidth },
          compact && styles.cardCompact,
          highlight && styles.cardCurrent,
          // Finished missions step back a little: a flatter shadow, so the next one leads.
          night && compact && !current && styles.cardQuiet,
        ]}
      >
        {night ? (
          <>
            <GradientSurface from={c.from} to={c.to} direction="vertical" />
            {/* Gloss: fades out 50% of the way down (a full-size surface — see GradientSurface). */}
            <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.3} toOpacity={0} toOffset={0.5} />
          </>
        ) : null}

        <View
          style={[
            styles.disc,
            { width: disc, height: disc, borderRadius: AdventureRadius.disc },
            night ? { backgroundColor: shade(c.to, 0.8), borderColor: 'rgba(255,255,255,0.9)', borderWidth: 2.5 } : { backgroundColor: theme.colors.surfaceAlt },
            bare ? { backgroundColor: 'transparent', borderWidth: 0, overflow: 'visible' } : null,
          ]}
        >
          {colorArt ? <ColorArt name={colorArt} size={Math.round(disc * (bare ? 1.08 : 0.86))} /> : art ? <GameIcon name={art} size={Math.round(disc * 0.86)} /> : glyph ? <Glyph value={glyph} size={Math.round(disc * 0.8)} /> : null}
        </View>

        <View style={styles.text}>
          {eyebrow || (current && currentLabel) ? (
            <View style={styles.eyebrowRow}>
              {eyebrow ? (
                <Text style={[styles.eyebrow, { color: night ? '#FFF3B0' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {eyebrow}
                </Text>
              ) : null}
              {current && currentLabel ? (
                <View style={[styles.currentChip, { backgroundColor: night ? '#FFD84D' : theme.colors.primary }]}>
                  <Text style={[styles.currentText, { color: night ? '#5A3A00' : '#FFFFFF' }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {currentLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <Text style={[styles.title, { fontSize: compact ? sizes.tileLabel - 2 : sizes.tileLabel + 1, color: ink }, night && styles.shadowText]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={compact ? 1 : 2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, compact && styles.subtitleCompact, { color: inkMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={compact ? 1 : 2}>
              {subtitle}
            </Text>
          ) : null}
          {progress ? (
            <View style={styles.progressRow}>
              <View style={[styles.track, { backgroundColor: night ? 'rgba(0,0,0,0.25)' : theme.colors.surfaceAlt }]}>
                <View style={[styles.fill, { width: `${Math.round(Math.min(1, Math.max(0, progress.value)) * 100)}%`, backgroundColor: night ? '#FFD84D' : theme.colors.primary }]} />
              </View>
              <Text style={[styles.progressLabel, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {progress.label}
              </Text>
            </View>
          ) : null}
        </View>

        {done ? (
          <View style={styles.doneCol}>
            <View style={[styles.medal, compact && styles.medalCompact, { backgroundColor: '#FFD84D', borderColor: night ? '#FFFFFF' : '#C99A0A' }]}>
              <Icon name="star" size={compact ? 22 : 26} color="#B8750A" />
            </View>
            {doneLabel ? (
              <Text style={[styles.doneLabel, { color: night ? '#FFF3B0' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {doneLabel}
              </Text>
            ) : null}
          </View>
        ) : locked ? (
          <View
            style={[
              styles.arrow,
              night
                ? { backgroundColor: 'rgba(255,216,77,0.16)', borderColor: 'rgba(255,216,77,0.55)' }
                : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft },
            ]}
          >
            <Icon name="lock" size={24} color={night ? '#FFD84D' : theme.colors.textMuted} />
          </View>
        ) : (
          <View
            style={[
              styles.arrow,
              night ? { backgroundColor: shade(c.to, 0.74), borderColor: 'rgba(255,255,255,0.9)' } : { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryDark },
              highlight && styles.arrowCurrent,
            ]}
          >
            <Icon name={arrowIcon ?? 'play'} size={highlight ? 30 : 26} color={highlight ? '#5A3A00' : '#FFFFFF'} />
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    minHeight: MIN_CHILD_TARGET + 32,
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
  },
  cardCompact: { minHeight: MIN_CHILD_TARGET + 12, paddingVertical: SPACING.sm, gap: SPACING.sm + 2 },
  cardCurrent: {
    borderWidth: 3,
    borderColor: '#FFE27A',
    borderBottomWidth: 6,
    shadowColor: '#FFD84D',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  cardQuiet: { shadowOpacity: 0.1, elevation: 2 },
  disc: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { flex: 1, gap: 2 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  eyebrow: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1 },
  currentChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
  currentText: { fontFamily: Fonts.black, fontSize: 11, letterSpacing: 0.8 },
  title: { fontFamily: Fonts.black },
  shadowText: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  subtitle: { fontFamily: Fonts.semibold, fontSize: 15 },
  subtitleCompact: { fontSize: 13 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  track: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontFamily: Fonts.black, fontSize: 13 },
  arrow: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  arrowCurrent: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFD84D', borderColor: '#FFFFFF', borderWidth: 3 },
  doneCol: { alignItems: 'center', gap: 2 },
  medal: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  medalCompact: { width: 40, height: 40, borderRadius: 20 },
  doneLabel: { fontFamily: Fonts.black, fontSize: 12 },
});
