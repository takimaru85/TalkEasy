import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { BigButton } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { AdventureRadius } from '@/theme/adventure';
// From the files, not the adventure barrel (which reaches back into components/common).
import { GameButton } from '@/components/adventure/GameButton';
import { GradientSurface } from '@/components/adventure/GradientSurface';
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
  /**
   * Called with true when a finger goes down on the canvas and false when it lifts (or the gesture is
   * cancelled, or the canvas goes away mid-stroke). The screen uses it to switch its own ScrollView off
   * for exactly that long, so dragging a finger draws instead of scrolling the page.
   */
  onDrawingChange?: (drawing: boolean) => void;
}

type Stroke = string; // SVG path data

/**
 * Large finger-writing area. Strokes are captured with PanResponder (no gesture library) and
 * drawn as SVG paths over a light grey guide. Nothing is graded — Undo, Clear and Done only.
 */
export function HandwritingCanvas({ guide, onDone, strokeWidth = 14, onStrokeWidthChange, height = 360, onDrawingChange }: Props) {
  const theme = useTheme();
  const [size, setSize] = useState({ w: 0, h: height });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke>('');
  const currentRef = useRef('');
  const startedAt = useRef<number | null>(null);
  // The responder is built once, so it reads the callback through a ref and never goes stale.
  const drawingCb = useRef(onDrawingChange);
  drawingCb.current = onDrawingChange;
  // A canvas that unmounts mid-stroke (Done pressed, level changed) must not leave the page locked.
  useEffect(() => () => drawingCb.current?.(false), []);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // THE ROOT CAUSE of the page scrolling while a child traced. This canvas sits inside a ScrollView,
        // and a responder that will hand the gesture back when asked (the default) lets that ScrollView take
        // it the moment the finger moves vertically. Once a stroke has begun it belongs to the canvas until the
        // finger lifts, and the native layer is told not to scroll underneath it either.
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e) => {
          // Switch the screen's scrolling off NOW, at touch-down, before the finger has moved at all.
          drawingCb.current?.(true);
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
          drawingCb.current?.(false);
        },
        onPanResponderTerminate: () => {
          currentRef.current = '';
          setCurrent('');
          drawingCb.current?.(false);
        },
      }),
    [],
  );

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: height });
  const clear = () => setStrokes([]);
  const undo = () => setStrokes((s) => s.slice(0, -1));
  const done = () => onDone({ strokes: strokes.length, durationMs: startedAt.current ? Date.now() - startedAt.current : 0 });

  // On the night sky the guide is a soft periwinkle and the stroke-order marks a friendly orange:
  // clear on white, warmer than the old warning red, and still quiet next to the child's own ink.
  const night = theme.night;
  const guideColor = theme.highContrast ? '#555555' : night ? '#C3CCEB' : '#B9C2D1';
  const arrowColor = night ? '#FF7043' : theme.colors.danger;
  // Which lowercase "a" to trace is a property of the language, not of the app (src/i18n).
  const { letterStyle } = useI18n();
  const ink = theme.colors.primaryDark;

  return (
    <View style={styles.wrap}>
      <View
        onLayout={onLayout}
        style={[
          styles.canvas,
          theme.shadow,
          { height, backgroundColor: '#FFFFFF', borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 2 },
          // The cleanest thing on the screen: plain white, a soft light rim and a gentle shadow.
          night && styles.canvasNight,
          // On the web a browser decides whether a drag scrolls BEFORE any script runs, so it has to be told
          // up front, on this element only: `touch-action: none`. Not applied anywhere else, so the rest of
          // the page still scrolls, and ignored on a phone.
          Platform.OS === 'web' ? styles.webNoScroll : null,
        ]}
        accessibilityLabel="Writing area. Draw with your finger."
        {...pan.panHandlers}
      >
        {size.w > 0 ? (
          // The drawing never takes a touch: the canvas View is always the target, so the coordinates it
          // reports are relative to the canvas whatever is under the finger.
          <Svg width={size.w} height={size.h} pointerEvents="none">
            {renderGuide(guide, size.w, size.h, guideColor, letterStyle, arrowColor)}
            {strokes.map((d, i) => (
              <Path key={i} d={d} stroke={ink} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {current ? <Path d={current} stroke={ink} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
          </Svg>
        ) : null}
      </View>

      {night ? (
        <View style={styles.toolbar}>
          <GameButton label="Undo" icon="undo" tone="grape" onPress={undo} disabled={strokes.length === 0} style={styles.tool} />
          <GameButton label="Clear" icon="eraser" tone="slate" onPress={clear} disabled={strokes.length === 0} style={styles.tool} />
          <GameButton label="Done" icon="check-bold" tone="grass" primary onPress={done} style={[styles.tool, styles.toolWide]} />
        </View>
      ) : (
      <View style={styles.toolbar}>
        <BigButton label="Undo" icon="undo" variant="outline" minHeight={MIN_CHILD_TARGET} compact onPress={undo} disabled={strokes.length === 0} style={styles.tool} />
        <BigButton label="Clear" icon="eraser" variant="outline" minHeight={MIN_CHILD_TARGET} compact onPress={clear} disabled={strokes.length === 0} style={styles.tool} />
        <BigButton label="Done" icon="check-bold" variant="success" minHeight={MIN_CHILD_TARGET} compact onPress={done} style={[styles.tool, styles.toolWide]} />
      </View>
      )}

      {onStrokeWidthChange && night ? (
        <View style={styles.penRow}>
          <Text style={styles.penLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>Pen size</Text>
          <View style={styles.penChips}>
            {PENS.map((pen) => {
              const selected = strokeWidth === pen.width;
              return (
                <Pressable
                  key={pen.width}
                  onPress={() => onStrokeWidthChange(pen.width)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${pen.label} pen`}
                  hitSlop={4}
                  style={({ pressed }) => [styles.pen, selected ? styles.penSelected : styles.penIdle, pressed && styles.penPressed]}
                >
                  {selected ? <GradientSurface from="#6FC0FF" to="#2A7BE8" direction="vertical" /> : null}
                  {/* A dot the size of the pen: the choice is shown, not only named. */}
                  <View style={[styles.penDot, { width: pen.dot, height: pen.dot, borderRadius: pen.dot / 2, backgroundColor: selected ? '#FFFFFF' : '#9FB0E8' }]} />
                  <Text style={[styles.penText, { color: selected ? '#FFFFFF' : '#C9D3F5' }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {pen.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : onStrokeWidthChange ? (
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

/** The three pen sizes (unchanged widths), with a dot size for the chip. */
const PENS = [
  { width: 8, label: 'Thin', dot: 6 },
  { width: 14, label: 'Medium', dot: 10 },
  { width: 22, label: 'Thick', dot: 15 },
] as const;

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

/** Web only. Not in React Native's ViewStyle, hence the cast. */
const WEB_NO_SCROLL = { touchAction: 'none', userSelect: 'none' } as unknown as ViewStyle;

const styles = StyleSheet.create({
  webNoScroll: WEB_NO_SCROLL,
  wrap: { gap: SPACING.md },
  canvas: { borderRadius: Radius.lg, overflow: 'hidden' },
  canvasNight: {
    borderRadius: AdventureRadius.card,
    borderWidth: 3,
    borderColor: '#DCE3FF',
    shadowColor: '#050823',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  penRow: { gap: 6 },
  penLabel: { fontFamily: Fonts.bold, fontSize: 14, color: '#B8C3EA', letterSpacing: 0.5 },
  penChips: { flexDirection: 'row', gap: SPACING.sm },
  pen: {
    flex: 1,
    height: MIN_CHILD_TARGET - 4,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  penIdle: { backgroundColor: '#16204F', borderWidth: 2, borderColor: '#4E63C8' },
  penSelected: {
    borderWidth: 2.5,
    borderColor: '#BFE3FF',
    shadowColor: '#4FA8FF',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  penPressed: { opacity: 0.85 },
  penDot: {},
  penText: { fontFamily: Fonts.black, fontSize: 16, flexShrink: 1 },
  toolbar: { flexDirection: 'row', gap: SPACING.sm },
  tool: { flex: 1 },
  toolWide: { flex: 1.4 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  sizeLabel: { fontFamily: Fonts.bold, fontSize: 16 },
});
