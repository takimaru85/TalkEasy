import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, useTheme } from '@/theme';
import { AdventureRadius, AdventureShadow } from '@/theme/adventure';
import type { Guide } from './HandwritingCanvas';

interface Props {
  guide: Guide;
  /** The item's label ("A", "cat", "My name"). */
  display: string;
  /** Shown for copy items instead of `display`. */
  model?: string;
  /** Spoken prompt, repeated here as a small line ("Trace the letter A"). */
  prompt: string;
  /** Font for letters/words — the school-print face where the language asks for it. */
  fontFamily: string;
  /** Size for a single character; words are drawn smaller. */
  letterSize: number;
}

/** Colour of the target on the night panel: warm gold, the colour the app uses for "look here". */
const GOLD = '#FFD84D';

/**
 * "What to trace", shown above the writing canvas.
 *
 * Lines and shapes are DRAWN (a small picture of the same path the canvas guide uses), not typed:
 * as text they were "—", "|", "ᐱᐱ" and an emoji wave, which at display size read as a tiny dash,
 * depended on font coverage and did not look like what the child was about to trace. Letters,
 * numbers and words are text with an explicit line height, so a large glyph is never clipped by
 * Android's font padding.
 */
export function TraceTarget({ guide, display, model, prompt, fontFamily, letterSize }: Props) {
  const theme = useTheme();
  const night = theme.night;
  const color = night ? GOLD : theme.colors.text;
  const text = model ?? display;
  const size = text.length > 6 ? Math.round(letterSize * 0.55) : text.length > 1 ? Math.round(letterSize * 0.75) : letterSize;

  const picture =
    guide.kind === 'line' || guide.kind === 'shape' ? (
      <GuidePicture guide={guide} color={color} />
    ) : (
      <Text
        style={[
          styles.letter,
          { fontFamily, fontSize: size, lineHeight: Math.round(size * 1.28), color },
          night && styles.letterGlow,
        ]}
        allowFontScaling={false}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {text}
      </Text>
    );

  return (
    <View
      style={[
        styles.panel,
        night
          ? [AdventureShadow, { backgroundColor: '#1B2560', borderColor: '#6F83E0' }]
          : { backgroundColor: theme.tint(theme.colors.primarySoft), borderColor: theme.colors.border },
      ]}
      accessibilityRole="text"
      accessibilityLabel={prompt}
    >
      <Text style={[styles.prompt, { color: night ? '#C9D3F5' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {prompt}
      </Text>
      <View style={styles.pictureRow}>{picture}</View>
    </View>
  );
}

/** A 120x64 drawing of the guide's path, in the target colour. */
function GuidePicture({ guide, color }: { guide: Extract<Guide, { kind: 'line' | 'shape' }>; color: string }) {
  const W = 120;
  const H = 64;
  const m = 10;
  const stroke = { stroke: color, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let shape: React.ReactNode;
  if (guide.kind === 'line') {
    const seg = (W - 2 * m) / 4;
    const d =
      guide.variant === 'horizontal' ? `M ${m} ${H / 2} L ${W - m} ${H / 2}`
      : guide.variant === 'vertical' ? `M ${W / 2} ${m} L ${W / 2} ${H - m}`
      : guide.variant === 'diagonal' ? `M ${W / 2 - 24} ${H - m} L ${W / 2 + 24} ${m}`
      : guide.variant === 'zigzag' ? [0, 1, 2, 3, 4].map((i) => `${i === 0 ? 'M' : 'L'} ${m + seg * i} ${i % 2 === 0 ? H - m : m}`).join(' ')
      : `M ${m} ${H / 2} ` + [0, 1, 2, 3].map((i) => `Q ${m + seg * i + seg / 2} ${i % 2 === 0 ? m - 4 : H - m + 4} ${m + seg * (i + 1)} ${H / 2}`).join(' ');
    shape = <Path d={d} {...stroke} />;
  } else {
    const r = H / 2 - m + 2;
    shape =
      guide.variant === 'circle' ? <Circle cx={W / 2} cy={H / 2} r={r} {...stroke} />
      : guide.variant === 'square' ? <Rect x={W / 2 - r} y={H / 2 - r} width={2 * r} height={2 * r} rx={3} {...stroke} />
      : <Path d={`M ${W / 2} ${H / 2 - r} L ${W / 2 + r} ${H / 2 + r} L ${W / 2 - r} ${H / 2 + r} Z`} {...stroke} />;
  }
  return (
    <Svg width={W * 1.2} height={H * 1.2} viewBox={`0 0 ${W} ${H}`} accessible={false}>
      {shape}
    </Svg>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: AdventureRadius.card,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
    gap: 2,
  },
  prompt: { fontFamily: Fonts.bold, fontSize: 15, textAlign: 'center', alignSelf: 'stretch' },
  pictureRow: { minHeight: 80, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  // Android adds font padding above big glyphs; turning it off keeps the letter centred.
  letter: { textAlign: 'center', alignSelf: 'stretch', includeFontPadding: false, textAlignVertical: 'center' },
  letterGlow: { textShadowColor: 'rgba(255,216,77,0.45)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
});
