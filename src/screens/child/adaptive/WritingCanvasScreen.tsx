import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HandwritingCanvas } from '@/components/adaptive';
import { BigButton, Celebration, ChildScreen, ProgressBar } from '@/components/common';
import { getWritingLevel } from '@/adaptive/handwriting';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { adaptiveProgressRepo } from '@/database';
import { useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * One writing-practice session: the level's items one at a time on a large canvas.
 * Done = logged as a handwriting session (motor practice, separate from learning progress),
 * a short cheer, and the next item. No grading, ever.
 */
export function WritingCanvasScreen({ navigation, route }: RootScreenProps<'WritingCanvas'>) {
  const level = getWritingLevel(route.params.level);
  const sizes = useSizes();
  const theme = useTheme();
  const { profile, displayName } = useProfile();
  const { speakFeedback } = useSpeak();
  const [index, setIndex] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState(14);
  const [burst, setBurst] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = level?.items[index];

  useEffect(() => {
    if (item) speakFeedback(item.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!level || !item) return <ChildScreen title="Writing" back />;

  const onDone = async (r: { strokes: number; durationMs: number }) => {
    await adaptiveProgressRepo.recordHandwriting({ childId: profile.id, level: level.level, item: item.display, strokes: r.strokes, durationMs: r.durationMs }).catch(() => {});
    setBurst((b) => b + 1);
    if (index + 1 >= level.items.length) {
      setFinished(true);
      speakFeedback(`Great work, ${displayName}! You finished level ${level.level}.`);
    } else {
      speakFeedback(['Nice!', 'Good work!', 'Well done!'][index % 3]);
      setTimeout(() => setIndex((i) => i + 1), 900);
    }
  };

  if (finished) {
    return (
      <ChildScreen title={level.title} back>
        <Celebration trigger={burst} />
        <View style={[styles.summary, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Text style={styles.bigEmoji} allowFontScaling={false}>🌟</Text>
          <Text style={[styles.title, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Great work, {displayName}!</Text>
          <Text style={[styles.sub, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>You finished Level {level.level}: {level.title}.</Text>
          <BigButton label="Practice again" icon="replay" minHeight={80} onPress={() => { setIndex(0); setFinished(false); }} />
          <BigButton label="Back to levels" icon="arrow-left" variant="outline" minHeight={72} onPress={() => navigation.goBack()} />
        </View>
      </ChildScreen>
    );
  }

  return (
    <ChildScreen title={`Level ${level.level}`} emoji={level.emoji} back>
      <Celebration trigger={burst} />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <ProgressBar value={index / level.items.length} label={`${index + 1} / ${level.items.length}`} height={12} />
        <Text style={[styles.prompt, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{item.prompt}</Text>
        <View style={[styles.display, { backgroundColor: theme.tint(theme.colors.primarySoft) }]}>
          <Text style={[styles.displayText, { fontSize: item.display.length > 6 ? sizes.heading + 6 : sizes.phrase + 14, color: theme.colors.text }]} allowFontScaling={false}>
            {item.model ?? item.display}
          </Text>
        </View>
        <HandwritingCanvas
          key={`${level.level}-${index}`}
          guide={item.guide}
          onDone={onDone}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          height={Math.max(300, sizes.tileHeight * 2.2)}
        />
        <BigButton label="Skip this one" variant="outline" minHeight={56} onPress={() => (index + 1 >= level.items.length ? setFinished(true) : setIndex((i) => i + 1))} />
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  prompt: { fontFamily: Fonts.bold, textAlign: 'center' },
  display: { minHeight: 90, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  // School-print face: the model letter the child copies must show the single-storey "a".
  displayText: { fontFamily: Fonts.schoolBlack, textAlign: 'center' },
  summary: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  bigEmoji: { fontSize: 72, lineHeight: 88 },
  title: { fontFamily: Fonts.black, textAlign: 'center' },
  sub: { fontFamily: Fonts.semibold, textAlign: 'center' },
});
