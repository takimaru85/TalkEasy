import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { STAT_GAP, STAT_PAD, statArtSize, statStacked } from '@/adventure/progressLayout';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow, shade, type AdventureKey } from '@/theme/adventure';
import { ColorArt, type ColorArtName } from './ColorArt';
import { GradientSurface } from './GradientSurface';

interface Props {
  /** The real count. Never a placeholder. */
  value: number;
  label: string;
  art: ColorArtName;
  color: AdventureKey;
  /** Card width in px; the grid decides it so rows line up. */
  width: number;
  /** One label size for the whole grid, fitted to the longest label, so the six cards match. */
  labelSize: number;
}

/**
 * One count on My Progress: an illustration, a big number and what it counts.
 *
 * A number a child can point at ("I practised 14 words") rather than a score, so there is no
 * percentage, no target and no comparison in here. On the night sky it is a glossy gradient card
 * in its own colour, like the game cards; in high contrast it is a plain bordered surface.
 */
export function StatCard({ value, label, art, color, width, labelSize }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const c = Adventure[color];
  const plain = theme.highContrast;
  const night = theme.night && !plain;
  const ink = plain ? theme.colors.text : night ? '#FFFFFF' : c.ink;
  // A narrow card puts the picture above the words rather than squeezing the words beside it.
  const stacked = statStacked(width);

  return (
    <View
      style={[
        styles.card,
        { width },
        stacked ? styles.cardStacked : null,
        plain
          ? { backgroundColor: theme.colors.surface, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
          : night
            ? [AdventureShadow, { backgroundColor: c.to, borderWidth: 1.5, borderColor: c.from, borderBottomWidth: 5, borderBottomColor: shade(c.to, 0.68) }]
            : [AdventureShadow, { backgroundColor: c.tint }],
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${value} ${label}`}
    >
      {night ? (
        <>
          <GradientSurface from={c.from} to={c.to} />
          {/* Gloss: fades out half way down, the same highlight the mission cards carry. */}
          <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.28} toOpacity={0} toOffset={0.5} />
        </>
      ) : null}
      {/* In a View, so on web it paints ABOVE the absolutely positioned gradient: a bare SVG sits
          underneath it and the picture disappears (on iOS and Android tree order already puts it on top). */}
      <View>
        <ColorArt name={art} size={statArtSize(width)} />
      </View>
      <View style={[styles.text, stacked ? styles.textStacked : null]}>
        <Text style={[styles.value, stacked ? styles.centred : null, { fontSize: sizes.heading + 8, color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {value}
        </Text>
        <Text
          style={[styles.label, stacked ? styles.centred : null, { fontSize: labelSize, color: night ? 'rgba(255,255,255,0.95)' : plain ? theme.colors.text : c.ink }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={2}
          textBreakStrategy="simple"
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: STAT_GAP,
    padding: STAT_PAD,
    minHeight: MIN_CHILD_TARGET + 40,
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
  },
  cardStacked: { flexDirection: 'column', justifyContent: 'center', paddingVertical: STAT_PAD, gap: 4 },
  text: { flex: 1, minWidth: 0, justifyContent: 'center' },
  textStacked: { flex: 0, alignSelf: 'stretch', alignItems: 'center' },
  centred: { textAlign: 'center', alignSelf: 'stretch' },
  value: { fontFamily: Fonts.black, lineHeight: undefined },
  label: { fontFamily: Fonts.extrabold },
});
