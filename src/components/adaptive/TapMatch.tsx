import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MatchPair } from '@/adaptive/types';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, useTheme } from '@/theme';
import { ChoiceCard } from './ChoiceCard';

interface Props {
  pairs: MatchPair[];
  /** Called once every pair is matched; `mistakes` = wrong taps along the way. */
  onComplete: (mistakes: number) => void;
  /** Guided level: show the first pair pre-matched as an example. */
  showExample?: boolean;
}

/**
 * Tap-to-match: tap an item on the left, then its partner on the right. No dragging, no
 * precision needed — every target is a full-size card. A wrong pair shakes off gently and
 * the child simply tries again.
 */
export function TapMatch({ pairs, onComplete, showExample }: Props) {
  const theme = useTheme();
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(() => new Set(showExample && pairs.length > 1 ? [0] : []));
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  // Shuffle the right column once so it is not simply aligned with the left.
  const rightOrder = useMemo(() => {
    const idx = pairs.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = (i * 7 + pairs.length * 3) % (i + 1);
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [pairs]);

  const tapRight = (i: number) => {
    if (leftSel === null || matched.has(i)) return;
    if (i === leftSel) {
      const next = new Set(matched);
      next.add(i);
      setMatched(next);
      setLeftSel(null);
      if (next.size === pairs.length) setTimeout(() => onComplete(mistakes), 400);
    } else {
      setMistakes((m) => m + 1);
      setWrongRight(i);
      setTimeout(() => setWrongRight(null), 700);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.help, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {leftSel === null ? 'Tap one on the left…' : '…now tap its match on the right'}
      </Text>
      <View style={styles.columns}>
        <View style={styles.col}>
          {pairs.map((p, i) => (
            <ChoiceCard
              key={`l${i}`}
              label={p.left}
              emoji={p.leftEmoji}
              state={matched.has(i) ? 'correct' : leftSel === i ? 'selected' : 'idle'}
              disabled={matched.has(i)}
              onPress={() => setLeftSel(i)}
              accessibilityLabel={`${p.left}${matched.has(i) ? ', matched' : ''}`}
            />
          ))}
        </View>
        <View style={styles.col}>
          {rightOrder.map((i) => (
            <ChoiceCard
              key={`r${i}`}
              label={pairs[i].right}
              emoji={pairs[i].rightEmoji}
              state={matched.has(i) ? 'correct' : wrongRight === i ? 'wrong' : 'idle'}
              disabled={matched.has(i)}
              onPress={() => tapRight(i)}
              accessibilityLabel={`${pairs[i].right}${matched.has(i) ? ', matched' : ''}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  help: { fontFamily: Fonts.bold, fontSize: 17, textAlign: 'center' },
  columns: { flexDirection: 'row', gap: SPACING.md },
  col: { flex: 1, gap: SPACING.sm },
});
