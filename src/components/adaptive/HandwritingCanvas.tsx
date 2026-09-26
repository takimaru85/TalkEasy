import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { BigButton } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { layoutSchoolText } from '@/adaptive/schoolText';
import { CAP_HEIGHT, strokesFor } from '@/adaptive/strokeOrder';
import { StrokeArrows, type Point } from './StrokeArrows';
import { useI18n } from '@/i18n';
import type { LetterStyle } from '@/i18n/types';

export type Guide =
  | { kind: 'none' }
  | { kind: 'line'; variant: 'horizontal' | 'vertical' | 'diagonal' | 'zigzag' | 'wave' }
  | { kind: 'shape'; variant: 'circle' | 'square' | 'triangle' }
  | { kind: 'text'; text: string };

interface Props {
  guide: Guide;
  /** Called with stroke count and elapsed ms when the child taps Done. */
  onDone: (result: { strokes: number; durationMs: number }) => void;
  /** Larger = easier to see and more forgiving. Parent-adjustable. */
  strokeWidth?: number;
  onStrokeWidthChange?: (w: number) => void;
  height?: number;
}

type Stroke = string; // SVG path data

/**
 * Large finger-writing area. Strokes are captured with PanResponder (no gesture library) and
 * drawn as SVG paths over a light grey guide. Nothing is graded — Undo, Clear and Done only.
 */
export function HandwritingCanvas({ guide, onDone, strokeWidth = 14, onStrokeWidthChange, height = 360 }: Props) {
  const theme = useTheme();
  const [size, setSize] = useState({ w: 0, h: height });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke>('');
  const currentRef = useRef('');
  const startedAt = useRef<number | null>(null);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          if (startedAt.current === null) startedAt.current = Date.now();
          const { locationX: x, locationY: y } = e.nativeEvent;
          currentRef.current = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          setCurrent(currentRef.current);
        },
        onPanResponderMove: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          currentRef.current += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          setCurrent(currentRef.current);
        },
        onPanResponderRelease: () => {
          // A tap without movement still counts as a dot — draw it as a tiny segment.
          const d = currentRef.current.includes('L') ? currentRef.current : `${currentRef.current} l 0.1 0.1`;
          setStrokes((s) => [...s, d]);
          currentRef.current = '';
          setCurrent('');
        },
        onPanResponderTerminate: () => {
          currentRef.current = '';
          setCurrent('');
        },
      }),
    [],
  );

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: height });
  const clear = () => setStrokes([]);
  const undo = () => setStrokes((s) => s.slice(0, -1));
  const done = () => onDone({ strokes: strokes.length, durationMs: startedAt.current ? Date.now() - startedAt.current : 0 });

  const guideColor = theme.highContrast ? '#555555' : '#B9C2D1';
  // Which lowercase "a" to trace is a property of the language, not of the app (src/i18n).
  const { letterStyle } = useI18n();
  const ink = theme.colors.primaryDark;

  return (
    <View style={styles.wrap}>
      <View
        onLayout={onLayout}
        style={[styles.canvas, theme.shadow, { height, backgroundColor: '#FFFFFF', borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 2 }]}
        accessibilityLabel="Writing area. Draw with your finger."
        {...pan.panHandlers}
      >
        {size.w > 0 ? (
          <Svg width={size.w} height={size.h}>
            {renderGuide(guide, size.w, size.h, guideColor, letterStyle, theme.colors.danger)}
            {strokes.map((d, i) => (
              <Path key={i} d={d} stroke={ink} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {current ? <Path d={current} stroke={ink} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
          </Svg>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <BigButton label="Undo" icon="undo" variant="outline" minHeight={MIN_CHILD_TARGET} compact onPress={undo} disabled={strokes.length === 0} style={styles.tool} />
        <BigButton label="Clear" icon="eraser" variant="outline" minHeight={MIN_CHILD_TARGET} compact onPress={clear} disabled={strokes.length === 0} style={styles.tool} />
        <BigButton label="Done" icon="check-bold" variant="success" minHeight={MIN_CHILD_TARGET} compact onPress={done} style={[styles.tool, styles.toolWide]} />
      </View>

      {onStrokeWidthChange ? (
        <View style={styles.sizeRow}>
          <Text style={[styles.sizeLabel, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Pen size</Text>
          {[8, 14, 22].map((w) => (
            <BigButton key={w} label={w === 8 ? 'Thin' : w === 14 ? 'Medium' : 'Thick'} variant={strokeWidth === w ? 'primary' : 'outline'} minHeight={MIN_CHILD_TARGET - 8} compact fullWidth={false} onPress={() => onStrokeWidthChange(w)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Samples a circle anticlockwise from the top — the direction "o" and "0" are taught. */
function circlePoints(cx: number, cy: number, r: number, steps = 12): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const angle = -Math.PI / 2 - (i / steps) * Math.PI * 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as Point;
  });
}

/**
 * Where each guide starts and which way it goes, in canvas pixels. Built from the very same
 * numbers the guide itself is drawn with, so an arrow can never drift off its line.
 */
function guideStrokes(guide: Guide, w: number, h: number, m: number): Point[][] {
  switch (guide.kind) {
    case 'line': {
      if (guide.variant === 'horizontal') return [[[m, h / 2], [w - m, h / 2]]];
      if (guide.variant === 'vertical') return [[[w / 2, m], [w / 2, h - m]]];
      if (guide.variant === 'diagonal') return [[[m, h - m], [w - m, m]]];
      if (guide.variant === 'zigzag') {
        return [[0, 1, 2, 3, 4].map((i) => [m + ((w - 2 * m) / 4) * i, i % 2 === 0 ? h - m : m] as Point)];
      }
      // wave: the quadratic's ends plus its peaks, which is enough for an arrow to follow
      const seg = (w - 2 * m) / 4;
      const pts: Point[] = [[m, h / 2]];
      for (let i = 0; i < 4; i++) {
        pts.push([m + seg * i + seg / 2, i % 2 === 0 ? m + (h / 2 - m) * 0.35 : h - m - (h / 2 - m) * 0.35]);
        pts.push([m + seg * (i + 1), h / 2]);
      }
      return [pts];
    }
    case 'shape': {
      const r = Math.min(w, h) / 2 - m;
      if (guide.variant === 'circle') return [circlePoints(w / 2, h / 2, r)];
      if (guide.variant === 'square') {
        const [l, t, right, b] = [w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r];
        return [[[l, t], [right, t], [right, b], [l, b], [l, t]]];
      }
      return [[[w / 2, h / 2 - r], [w / 2 + r, h / 2 + r], [w / 2 - r, h / 2 + r], [w / 2, h / 2 - r]]];
    }
    default:
      return [];
  }
}

function renderGuide(guide: Guide, w: number, h: number, color: string, letterStyle: LetterStyle, arrowColor: string) {
  const common = { stroke: color, strokeWidth: 10, strokeLinecap: 'round' as const, strokeDasharray: '2 22', fill: 'none' };
  const m = Math.min(w, h) * 0.12;
  switch (guide.kind) {
    case 'line': {
      const arrows = <StrokeArrows strokes={guideStrokes(guide, w, h, m)} color={arrowColor} size={Math.min(w, h) - m * 2} />;
      if (guide.variant === 'horizontal') return <>{<Line x1={m} y1={h / 2} x2={w - m} y2={h / 2} {...common} />}{arrows}</>;
      if (guide.variant === 'vertical') return <>{<Line x1={w / 2} y1={m} x2={w / 2} y2={h - m} {...common} />}{arrows}</>;
      if (guide.variant === 'diagonal') return <>{<Line x1={m} y1={h - m} x2={w - m} y2={m} {...common} />}{arrows}</>;
      if (guide.variant === 'zigzag') {
        const pts = [0, 1, 2, 3, 4].map((i) => `${m + ((w - 2 * m) / 4) * i},${i % 2 === 0 ? h - m : m}`).join(' ');
        return <>{<Polygon points={pts} {...common} strokeDasharray={undefined} strokeWidth={8} opacity={0.6} />}{arrows}</>;
      }
      // wave
      const seg = (w - 2 * m) / 4;
      const d = `M ${m} ${h / 2} ` + [0, 1, 2, 3].map((i) => `Q ${m + seg * i + seg / 2} ${i % 2 === 0 ? m : h - m} ${m + seg * (i + 1)} ${h / 2}`).join(' ');
      return <>{<Path d={d} {...common} />}{arrows}</>;
    }
    case 'shape': {
      const r = Math.min(w, h) / 2 - m;
      const arrows = <StrokeArrows strokes={guideStrokes(guide, w, h, m)} color={arrowColor} size={Math.min(w, h) - m * 2} />;
      if (guide.variant === 'circle') return <>{<Circle cx={w / 2} cy={h / 2} r={r} {...common} />}{arrows}</>;
      if (guide.variant === 'square') return <>{<Rect x={w / 2 - r} y={h / 2 - r} width={2 * r} height={2 * r} {...common} />}{arrows}</>;
      return <>{<Polygon points={`${w / 2},${h / 2 - r} ${w / 2 + r},${h / 2 + r} ${w / 2 - r},${h / 2 + r}`} {...common} />}{arrows}</>;
    }
    case 'text': {
      // School-print outlines (single-storey "a") drawn as paths — see schoolText.ts.
      const baseline = h * 0.78;
      const layout = layoutSchoolText(guide.text, w - m * 2, h * 0.62, letterStyle);
      return (
        <>
          <Line x1={m} y1={baseline} x2={w - m} y2={baseline} stroke={color} strokeWidth={3} opacity={0.5} />
          <G transform={`translate(${(w - layout.width) / 2} ${baseline}) scale(${layout.scale})`}>
            {layout.glyphs.map((g, i) => (
              // Hollow, like a handwriting worksheet: the child's own stroke stays visible
              // inside the letter, and the dashed centre path reads against white rather than
              // against a solid block. Stroke width is in font units, so it scales with the text.
              <Path
                key={i}
                d={g.d}
                transform={`translate(${g.x} 0)`}
                fill="none"
                stroke={color}
                strokeWidth={34}
                strokeLinejoin="round"
              />
            ))}
          </G>
          {/* Numbering restarts on every letter, so "cat" reads 1 · 1,2 · 1,2 and not 1…5. */}
          {layout.glyphs.map((g, i) => {
            const order = strokesFor(g.ch, letterStyle);
            if (!order) return null;
            const originX = (w - layout.width) / 2;
            const strokes = order.map((stroke) =>
              stroke.points.map(
                ([nx, ny]) =>
                  [originX + (g.x + nx * g.adv) * layout.scale, baseline + (ny - 1) * CAP_HEIGHT * layout.scale] as Point,
              ),
            );
            return <StrokeArrows key={`a${i}`} strokes={strokes} color={arrowColor} size={CAP_HEIGHT * layout.scale} />;
          })}
        </>
      );
    }
    default:
      return <Line x1={m} y1={h * 0.78} x2={w - m} y2={h * 0.78} stroke={color} strokeWidth={3} opacity={0.5} />;
  }
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  canvas: { borderRadius: Radius.lg, overflow: 'hidden' },
  toolbar: { flexDirection: 'row', gap: SPACING.sm },
  tool: { flex: 1 },
  toolWide: { flex: 1.4 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  sizeLabel: { fontFamily: Fonts.bold, fontSize: 16 },
});
