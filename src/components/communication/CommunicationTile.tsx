import React, { useRef } from 'react';
import { Animated, Image, PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, shade, useTheme } from '@/theme';
import { Motion } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';
import type { CommunicationButton } from '@/types/models';
import { tileInk } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { GradientSurface } from '@/components/adventure/GradientSurface';
import { ART_FOR_ICON, GameIcon } from '@/components/adventure/GameIcon';

/** Line box as a multiple of font size, for Nunito ExtraBold. */
const LINE_HEIGHT = 1.18;
/** Rough advance width per character, as a multiple of font size, for Nunito ExtraBold. */
const CHAR_WIDTH = 0.62;

/** Smallest label a child should have to read. The icon disc gives way before this does. */
const MIN_LABEL = 13;

/** Height the label needs for `lines` lines at `size`. */
function labelHeight(lines: number, size: number, scale: number): number {
  return Math.round(lines * LINE_HEIGHT * size * scale);
}

/**
 * Icon disc size, shrunk if a big icon would leave the label no room.
 *
 * The tile is a fixed height, and "medium" buttons (120dp tile, 48dp icon → 76dp disc) paired
 * with "large" text (24dp label) asks for 136dp of content in a 104dp box — the label used to
 * spill out of the card entirely. Sizes are two independent settings, so the combination has to
 * resolve itself: the icon yields first, because an icon a few dp smaller still reads, while a
 * clipped or 11dp word does not. Larger presets have room already and are untouched.
 */
function fitDisc(preferredDisc: number, tileHeight: number, scale: number): number {
  const room = tileHeight - SPACING.sm * 2 - SPACING.xs - labelHeight(2, MIN_LABEL, scale);
  return Math.max(40, Math.min(preferredDisc, room));
}

/**
 * Largest label size that still fits under the disc.
 *
 * Computed rather than left to `adjustsFontSizeToFit`, which does not shrink multi-line text
 * reliably on Android. Two limits apply: the widest single word must fit on one line (labels are
 * never hyphenated — see `textBreakStrategy`), and the lines must fit the remaining height. A
 * multi-word label is allowed to wrap to two lines; a single word never can, so it is fitted to
 * the width instead. The OS font scale is folded in, so a large system font setting still lands
 * inside the tile rather than being clipped.
 */
function fitLabel(text: string, tileWidth: number, tileHeight: number, discSize: number, preferred: number): number {
  const scale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SCALE);
  const innerWidth = Math.max(24, tileWidth - SPACING.sm * 2 - 4);
  const roomBelowDisc = Math.max(16, tileHeight - SPACING.sm * 2 - discSize - SPACING.xs);

  const words = text.trim().split(/\s+/);
  const longestWord = words.reduce((n, w) => Math.max(n, w.length), 1);
  // Only a label with a space in it can use a second line.
  const needsTwoLines = words.length > 1 && text.length * CHAR_WIDTH * preferred * scale > innerWidth;
  const lines = needsTwoLines ? 2 : 1;

  const byWidth = innerWidth / (longestWord * CHAR_WIDTH * scale);
  const byHeight = roomBelowDisc / (lines * LINE_HEIGHT * scale);
  return Math.max(MIN_LABEL, Math.floor(Math.min(preferred, byWidth, byHeight)));
}

/**
 * Tile metrics shared by a tile and its grid: height, icon frame and the label that fits.
 *
 * TileGrid uses `fit` to find one label size for the whole board, then passes it to every tile,
 * so "Hot" and "Blanket" read at the same size. Both sides must measure identically, which is
 * why this lives here rather than being repeated in the component.
 */
export function tileMetrics(
  sizes: { tileHeight: number; iconSize: number; tileWidth: number; tileLabel: number },
  compact: boolean | undefined,
  width: number | undefined,
) {
  const height = compact ? Math.max(sizes.tileHeight * 0.72, 96) : sizes.tileHeight;
  const discPadding = compact ? 18 : 28;
  const scale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SCALE);
  const discSize = fitDisc((compact ? sizes.iconSize - 12 : sizes.iconSize) + discPadding, height, scale);
  const preferred = compact ? sizes.tileLabel - 3 : sizes.tileLabel;
  const fit = (label: string) => fitLabel(label, width ?? sizes.tileWidth, height, discSize, preferred);
  return { height, discPadding, discSize, fit };
}

interface Props {
  button: CommunicationButton;
  selected: boolean;
  onPress: (button: CommunicationButton) => void;
  /** Override width (grid passes the computed column width). */
  width?: number;
  /** Smaller variant for strips (Recent / Favorites on Home). */
  compact?: boolean;
  /** A label size shared by the whole grid, so every card's word is the same size. */
  labelSize?: number;
}

/**
 * The AAC button the child taps.
 *
 * - White rounded card, category-tinted icon disc (or a real photo), bold label.
 * - Selected: accent ring + speaker badge, so selection is not shown by colour alone.
 * - A second tap within TAP_GUARD_MS is ignored so a tremor does not double-speak.
 * - Tap only: no long-press, no gestures.
 *
 * On the night sky (the child zone) the card is a SOLID game button in its category colour: a
 * light-to-deep gradient, a lighter rim, a darker base underneath, a white label, and the
 * illustrated art for the core words (a white glyph for everything else). Photos stay photos.
 */
export const CommunicationTile = React.memo(function CommunicationTile({ button, selected, onPress, width, compact, labelSize: sharedLabelSize }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = now;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: theme.duration(Motion.tap), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: theme.duration(Motion.settle), useNativeDriver: true }),
    ]).start();
    onPress(button);
  };

  const { height, discPadding, discSize, fit } = tileMetrics(sizes, compact, width);
  // Generous padding: a smaller glyph in a larger frame reads calmer and more refined.
  const iconSize = Math.max(20, Math.round((discSize - discPadding) * 0.82));
  // A soft rounded square rather than a circle; the glyph in the deep tone of its own tint.
  const discRadius = Math.round(discSize * 0.3);
  const ink = theme.highContrast ? theme.colors.text : tileInk(button.color);
  const night = theme.night;
  const deep = tileInk(button.color);
  const art = night && !button.imageUri ? ART_FOR_ICON[button.icon] : undefined;
  const { tContent } = useI18n();
  const isStarter = button.phrase.trim().endsWith('...');
  const label = tContent(button.label);
  const labelSize = sharedLabelSize ?? fit(label);

  return (
    <Animated.View style={{ transform: [{ scale }], width: width ?? sizes.tileWidth }}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={tContent(button.phrase)}
        accessibilityHint="Says this out loud"
        accessibilityState={{ selected }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.tile,
          theme.shadow,
          night
            ? {
                height,
                backgroundColor: deep,
                borderColor: selected ? theme.colors.selected : shade(deep, 1.4),
                borderWidth: selected ? 4 : 1.5,
                borderBottomColor: selected ? theme.colors.selected : shade(deep, 0.66),
                borderBottomWidth: selected ? 5 : 5,
              }
            : {
                height,
                backgroundColor: theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
                borderWidth: selected ? 4 : theme.highContrast ? theme.borderWidth : 1.5,
              },
          pressed && !night && { backgroundColor: theme.tint(button.color) },
        ]}
      >
        {({ pressed }) => (
          <>
            {night ? (
              <>
                <GradientSurface from={shade(deep, pressed ? 1.15 : 1.32)} to={deep} direction="vertical" />
                {/* Gloss: fades out 55% of the way down (a full-size surface — see GradientSurface). */}
                <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.32} toOpacity={0} toOffset={0.55} />
              </>
            ) : null}
            {art ? (
              <View style={{ width: discSize, height: discSize, alignItems: 'center', justifyContent: 'center' }}>
                <GameIcon name={art} size={discSize} />
              </View>
            ) : (
              <View
                style={[
                  styles.disc,
                  night
                    ? { width: discSize, height: discSize, borderRadius: discRadius, borderColor: button.imageUri ? '#FFFFFF' : 'transparent', borderWidth: button.imageUri ? 2 : 0 }
                    : { width: discSize, height: discSize, borderRadius: discRadius, backgroundColor: theme.tint(button.color), borderColor: theme.highContrast ? theme.colors.border : 'transparent', borderWidth: theme.highContrast ? 2 : 0 },
                ]}
              >
                {button.imageUri ? (
                  <Image source={{ uri: button.imageUri }} style={{ width: discSize, height: discSize, borderRadius: discRadius }} accessibilityIgnoresInvertColors />
                ) : (
                  <Icon name={button.icon} size={night ? Math.round(iconSize * 1.12) : iconSize} color={night ? '#FFFFFF' : ink} />
                )}
              </View>
            )}
            <Text
          style={[styles.label, { fontSize: labelSize, lineHeight: Math.round(labelSize * LINE_HEIGHT), color: night ? '#FFFFFF' : theme.colors.text }, night && styles.labelNight]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={2}
          // Android splits long words across lines by default ("Bathroo / m"); keep them whole.
          textBreakStrategy="simple"
          ellipsizeMode="tail"
        >
          {label}
        </Text>
        {selected ? (
          <View style={[styles.badge, { backgroundColor: night ? theme.colors.selected : theme.colors.primary }]} accessibilityElementsHidden>
            <Icon name="volume-high" size={18} color={night ? '#27325F' : '#FFFFFF'} />
          </View>
        ) : null}
        {isStarter && !selected ? (
          <View style={[styles.badge, night ? { backgroundColor: '#FFFFFF' } : { backgroundColor: theme.tint(button.color), borderWidth: 1, borderColor: theme.colors.borderSoft }]} accessibilityElementsHidden>
            <Icon name="dots-horizontal" size={18} color={night ? deep : ink} />
          </View>
        ) : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tile: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  disc: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  labelNight: { textShadowColor: 'rgba(0,0,0,0.28)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
