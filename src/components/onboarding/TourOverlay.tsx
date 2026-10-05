import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton, PressableScale } from '@/components/common';
import { Mascot } from '@/components/adventure/Mascot';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useI18n } from '@/i18n';
import { Fonts } from '@/theme';
import { Adventure, AdventureRadius } from '@/theme/adventure';
import { getTour } from '@/onboarding/tours';
import { useTour, type TargetRect } from './TourContext';

/** Breathing room around the highlighted thing, and between it and the tooltip. */
const HALO = 8;
const GAP = 12;
const EDGE = SPACING.lg;
/** The card never grows wider than this, however wide the tablet. */
const MAX_CARD_WIDTH = 460;

/**
 * The guided tour: a dim field with a hole cut around the thing being explained, and a card that
 * says what it is.
 *
 * THE DIM IS FOUR RECTANGLES, not a translucent sheet with a cut-out — above, below, left and
 * right of the target. That leaves the target drawn at FULL brightness by the screen underneath,
 * which is the difference between "this is highlighted" and "everything is murky including the
 * thing you are meant to look at". It also needs no masking, so it behaves the same everywhere.
 *
 * The tooltip prefers the side the step asked for and flips when there is not room, then is clamped
 * to the safe area — so it can never land off-screen and never covers the target.
 *
 * THREE SEPARATE JOBS, deliberately not mixed:
 *  1. Coordinates. Targets are measured in WINDOW coordinates (measureInWindow), but this overlay
 *     draws in its OWN coordinates, and the two origins differ by whatever sits above the overlay —
 *     on Android edge-to-edge, the status bar. The overlay measures its own window position and
 *     converts every target into its local space. (Using window y directly drew the spotlight one
 *     status bar too high on Android phones and tablets, and anchored the card to that wrong box.)
 *  2. Positioning. WHERE the card goes is computed from its REAL measured height — it renders once
 *     invisibly, is measured with onLayout, then placed — never from a guessed constant, so a card
 *     that grows (longer words, a tablet's larger text, OS font scaling) is still placed correctly.
 *  3. Layout. WHAT is inside the card is ordinary column flow — count, title, description, Next,
 *     Skip — with no absolute positioning at all, so the button can only ever sit inside the box.
 */
export function TourOverlay() {
  const { tourId, stepIndex, activeRect, next, finish } = useTour();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  // (1) Where this overlay sits in the window, so window-measured targets can be made local.
  const rootRef = useRef<View>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const onRootLayout = useCallback(() => {
    rootRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setOrigin((o) => (o && o.x === x && o.y === y && o.width === width && o.height === height ? o : { x, y, width, height }));
      }
    });
  }, []);

  // A rotation or resize moves the overlay too: measure its origin again whenever the window changes.
  useEffect(() => {
    onRootLayout();
  }, [win.width, win.height, onRootLayout]);

  // (2) The card's real size, measured after it renders.
  const [cardH, setCardH] = useState<number | null>(null);
  const onCardLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    setCardH((prev) => (prev === h ? prev : h));
  }, []);

  if (!tourId) return null;
  const tour = getTour(tourId);
  const done = stepIndex >= tour.steps.length;

  // ---- The closing celebration -------------------------------------------------------------
  if (done) {
    return (
      <View style={[styles.fill, styles.celebrate]} accessibilityViewIsModal>
        <Mascot size={110} mood="cheer" pip />
        <Text style={styles.celebrateTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          🎉 {t('tourDoneTitle')}
        </Text>
        <Text style={styles.celebrateBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('tourDoneBody')}
        </Text>
        <View style={styles.celebrateCta}>
          <BigButton label={t('tourDoneCta')} icon="rocket-launch-outline" minHeight={MIN_CHILD_TARGET} onPress={finish} />
        </View>
      </View>
    );
  }

  const step = tour.steps[stepIndex];

  // While a step is settling (measuring, maybe scrolling) the overlay waits rather than drawing a
  // spotlight in the wrong place. A target that never measures — not mounted on this screen —
  // still shows its card, centred, so Next and Skip always work and nobody is trapped.
  const last = stepIndex === tour.steps.length - 1;

  // The overlay's own box. Its OFFSET comes from measuring it; its SIZE from the window, which is
  // always current (the overlay fills the screen from its origin down), so a resize can never leave
  // the card sized and placed for the previous screen while a layout event is still on its way.
  const ox = origin?.x ?? 0;
  const oy = origin?.y ?? 0;
  const box = { x: ox, y: oy, width: win.width - ox, height: win.height - oy };
  // Target in overlay coordinates.
  const spot: TargetRect | null = activeRect ? { ...activeRect, x: activeRect.x - box.x, y: activeRect.y - box.y } : null;
  // The safe area in overlay coordinates: the system insets, minus whatever the overlay already
  // sits below (a parent that is itself inset), never negative.
  const safe = {
    top: Math.max(0, insets.top - box.y),
    bottom: Math.max(0, box.y + box.height - (win.height - insets.bottom)),
    left: Math.max(0, insets.left - box.x),
    right: Math.max(0, box.x + box.width - (win.width - insets.right)),
  };
  const tooltip = placeTooltip(spot, step.placement, box.width, box.height, cardH, safe);

  return (
    <View ref={rootRef} onLayout={onRootLayout} style={styles.fill} accessibilityViewIsModal>
      {spot ? (
        <>
          {/* Four dims around the hole. */}
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, spot.y - HALO) }]} />
          <View style={[styles.dim, { top: spot.y + spot.height + HALO, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.dim, { top: spot.y - HALO, left: 0, width: Math.max(0, spot.x - HALO), height: spot.height + HALO * 2 }]} />
          <View style={[styles.dim, { top: spot.y - HALO, left: spot.x + spot.width + HALO, right: 0, height: spot.height + HALO * 2 }]} />
          {/* A ring, so the highlight is marked by shape as well as by brightness. */}
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              { top: spot.y - HALO, left: spot.x - HALO, width: spot.width + HALO * 2, height: spot.height + HALO * 2 },
            ]}
          />
        </>
      ) : (
        <View style={[styles.dim, { top: 0, left: 0, right: 0, bottom: 0 }]} />
      )}

      {/* (3) Normal column flow inside; only the CONTAINER is positioned. Hidden until measured. */}
      <View onLayout={onCardLayout} style={[styles.card, tooltip, cardH === null && styles.measuring]}>
        <Text style={styles.count} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('tourStepOf', { n: stepIndex + 1, total: tour.steps.length })}
        </Text>
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t(step.titleKey)}
        </Text>
        <Text style={styles.body} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t(step.bodyKey)}
        </Text>
        <BigButton
          label={last ? t('tourFinish') : t('tourNext')}
          icon={last ? 'check' : 'arrow-right'}
          minHeight={MIN_CHILD_TARGET - 8}
          onPress={next}
          style={styles.action}
        />
        {/* Always available, on every step, and it counts as done. */}
        <PressableScale onPress={finish} accessibilityRole="button" accessibilityLabel={t('tourSkip')} style={styles.action}>
          <Text style={styles.skip} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('tourSkip')}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

/**
 * WHERE the card goes (never what is inside it): on the preferred side when it fits, the other side
 * when it does not, the roomier side when neither does — then clamped inside the safe area. Uses
 * the card's MEASURED height; before the first measurement, a provisional estimate places it while
 * it is still invisible.
 */
function placeTooltip(
  spot: TargetRect | null,
  prefer: 'above' | 'below',
  width: number,
  height: number,
  measuredH: number | null,
  safe: { top: number; bottom: number; left: number; right: number },
): { top: number; left: number; width: number } {
  const minX = safe.left + EDGE;
  const maxX = width - safe.right - EDGE;
  const minY = safe.top + EDGE;
  const maxY = height - safe.bottom - EDGE;
  // Responsive width: nearly full width on a phone, capped on a tablet.
  const w = Math.max(0, Math.min(maxX - minX, MAX_CARD_WIDTH));
  const cardH = measuredH ?? 260;
  const centreX = spot ? spot.x + spot.width / 2 : (minX + maxX) / 2;
  const left = Math.max(minX, Math.min(maxX - w, centreX - w / 2));

  if (!spot) return { top: Math.max(minY, (minY + maxY - cardH) / 2), left, width: w };

  const below = spot.y + spot.height + HALO + GAP;
  const above = spot.y - HALO - GAP - cardH;
  const fitsBelow = below + cardH <= maxY;
  const fitsAbove = above >= minY;
  const roomBelow = maxY - below;
  const roomAbove = spot.y - HALO - GAP - minY;

  const top = prefer === 'below'
    ? (fitsBelow ? below : fitsAbove ? above : roomBelow >= roomAbove ? below : above)
    : (fitsAbove ? above : fitsBelow ? below : roomAbove >= roomBelow ? above : below);

  return { top: Math.max(minY, Math.min(top, maxY - cardH)), left, width: w };
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  dim: { position: 'absolute', backgroundColor: 'rgba(6,10,32,0.78)' },
  ring: {
    position: 'absolute',
    borderRadius: AdventureRadius.card,
    borderWidth: 3,
    borderColor: Adventure.sun.from,
  },
  card: {
    position: 'absolute',
    backgroundColor: '#1B2450',
    borderRadius: AdventureRadius.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  // Rendered for one frame to be measured, before it is placed.
  measuring: { opacity: 0 },
  // Next and Skip take the card's inner width (never the screen's).
  action: { alignSelf: 'stretch' },
  count: { fontFamily: Fonts.bold, fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6 },
  title: { fontFamily: Fonts.black, fontSize: 19, color: '#FFFFFF' },
  body: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.92)' },
  skip: { fontFamily: Fonts.bold, fontSize: 13, color: 'rgba(255,255,255,0.72)', textAlign: 'center', paddingVertical: SPACING.sm },
  celebrate: { backgroundColor: 'rgba(6,10,32,0.94)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md },
  celebrateTitle: { fontFamily: Fonts.black, fontSize: 26, color: '#FFFFFF', textAlign: 'center' },
  celebrateBody: { fontFamily: Fonts.bold, fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  celebrateCta: { alignSelf: 'stretch', marginTop: SPACING.md },
});
