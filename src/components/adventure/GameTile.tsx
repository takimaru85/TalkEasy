import React from 'react';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon, isEmoji } from '@/components/common/Icon';
import { Glyph } from '@/components/common/Glyph';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { tileInk } from '@/constants/colors';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, shade, type AdventureKey } from '@/theme/adventure';
import { ColorArt, type ColorArtName } from './ColorArt';
import { GameIcon, type GameIconName } from './GameIcon';
import { GradientSurface } from './GradientSurface';

interface Props {
  label: string;
  /** A soft tile tint (TileColors); the card is drawn in the solid colour it stands for. */
  tint: string;
  /** Illustrated art, else `glyph` — a line-icon name (drawn white) or an emoji. */
  art?: GameIconName;
  glyph?: string;
  onPress: () => void;
  accessibilityLabel: string;
  width?: DimensionValue;
  minHeight?: number;
  /** A small chip in the top-right corner ("3 / 8", "NEW"). */
  badge?: string;
  /** Finished: a gold star in the corner instead of the badge. */
  done?: boolean;
  /** A label size shared by the whole grid (fitted by the screen), so every word matches. */
  labelSize?: number;
  /** Draw the card in an adventure colour's own light and deep stops instead of one derived from `tint`. */
  colorKey?: AdventureKey;
  /** A colourful illustration drawn big on a dark disc, in place of the plate. */
  colorArt?: ColorArtName;
  /** A small ring arrow in the corner, saying "this opens". Not shown on a finished or badged tile. */
  arrow?: boolean;
  /** Fill the height of the row, so tiles side by side are the same height whatever their labels do. */
  stretch?: boolean;
}

/**
 * A square-ish grid card (an activity, a subject, a feeling): the grid sibling of MissionCard.
 *
 * On the night sky it is a solid game button in its colour — light-to-deep gradient, lighter rim,
 * darker base, a gloss on top — with the art on a white-rimmed plate and a white label. Outside
 * it (high contrast) it is the plain surface card with the tinted icon tile it always was.
 */
export function GameTile({ label, tint, art, glyph, onPress, accessibilityLabel, width, minHeight, badge, done, labelSize, colorKey, colorArt, arrow, stretch }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const night = theme.night;
  const deep = colorKey ? Adventure[colorKey].to : tileInk(tint);
  const top = colorKey ? Adventure[colorKey].from : shade(deep, 1.35);
  const plate = Math.round(sizes.iconSize + 22);
  const disc = Math.round(plate * 1.22);

  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={4} style={{ width }}>
      <View
        style={[
          styles.card,
          stretch ? styles.stretch : null,
          { minHeight: minHeight ?? Math.max(sizes.tileHeight * 0.85, 120) },
          night
            ? { backgroundColor: deep, borderColor: shade(deep, 1.4), borderBottomColor: shade(deep, 0.66), borderWidth: 1.5, borderBottomWidth: 5 }
            : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: theme.borderWidth },
        ]}
      >
        {night ? (
          <>
            <GradientSurface from={top} to={deep} direction="vertical" />
            {/* Gloss: fades out 50% of the way down (a full-size surface — see GradientSurface). */}
            <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.3} toOpacity={0} toOffset={0.5} />
          </>
        ) : null}

        {night && colorArt ? (
          // In a View, so on web it paints ABOVE the absolutely positioned gradient (a bare SVG sits underneath it).
          <View style={[styles.discWrap, { width: disc, height: disc, borderRadius: disc / 2, backgroundColor: shade(deep, 0.58) }]}>
            <ColorArt name={colorArt} size={Math.round(disc * 0.8)} />
          </View>
        ) : night ? (
          <View style={[styles.plate, { width: plate, height: plate, borderRadius: Math.round(plate * 0.32), backgroundColor: shade(deep, 0.8) }]}>
            {art ? (
              <GameIcon name={art} size={Math.round(plate * 0.9)} />
            ) : glyph && isEmoji(glyph) ? (
              <Text style={{ fontSize: Math.round(plate * 0.55), lineHeight: Math.round(plate * 0.7) }} allowFontScaling={false}>
                {glyph}
              </Text>
            ) : glyph ? (
              <Icon name={glyph} size={Math.round(plate * 0.56)} color="#FFFFFF" />
            ) : null}
          </View>
        ) : art || glyph ? (
          <Glyph value={glyph ?? 'star'} size={plate} tint={tint} />
        ) : null}

        <Text
          style={[styles.label, { fontSize: labelSize ?? sizes.tileLabel - 4, color: night ? '#FFFFFF' : theme.colors.text }, night && styles.labelNight]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {label}
        </Text>

        {done ? (
          <View style={[styles.corner, styles.star]}>
            <Icon name="star" size={18} color="#B8750A" />
          </View>
        ) : arrow ? (
          <View style={[styles.corner, styles.ring, { backgroundColor: shade(deep, 0.7) }]}>
            <Icon name="chevron-right" size={18} color="#FFFFFF" />
          </View>
        ) : badge ? (
          <View style={[styles.corner, styles.badge, { backgroundColor: night ? '#FFFFFF' : theme.colors.surfaceAlt }]}>
            <Text style={[styles.badgeText, { color: night ? deep : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
  },
  stretch: { flexGrow: 1 },
  discWrap: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.38)' },
  ring: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  plate: { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)' },
  label: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  labelNight: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  corner: { position: 'absolute', top: 8, right: 8 },
  star: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFD84D', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: Fonts.black, fontSize: 12 },
});
