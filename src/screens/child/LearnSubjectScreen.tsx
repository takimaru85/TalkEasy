import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, EmptyState, Glyph, Icon, PressableScale, ProgressBar, SectionLabel } from '@/components/common';
import { useProfile } from '@/context/ProfileContext';
import { earnLabel } from '@/rewards/earnLabel';
import { MissionCard } from '@/components/adventure/MissionCard';
import { LEARN_ACTIVITY_ART, LEARN_SUBJECT_ART } from '@/learning/activityArt';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useLearningBest, useLearningConfigs, useSizes, useSpeak } from '@/hooks';
import { getSubject, levelsFor } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme, type AdventureKey } from '@/theme';

const COLORS: AdventureKey[] = ['coral', 'sky', 'grape', 'grass', 'magenta', 'lagoon', 'sun'];

function stars(best: number | undefined): string {
  if (best === undefined) return '';
  if (best >= 0.99) return '⭐⭐⭐';
  if (best >= 0.66) return '⭐⭐';
  if (best >= 0.34) return '⭐';
  return '';
}

const Separator = () => <View style={styles.separator} />;

/** Activities inside one subject, as big cards. Stars show the best result so far. */
export function LearnSubjectScreen({ navigation, route }: RootScreenProps<'LearnSubject'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const subject = getSubject(route.params.subjectKey);
  const { data: configs } = useLearningConfigs();
  const { data: best } = useLearningBest();
  const { speakFeedback } = useSpeak();
  const { profile } = useProfile();
  const earn = earnLabel(profile.rewards.starsPerLearningSession, profile.rewards.starsPerPerfectSession);

  if (!subject) return <ChildScreen title="Learn" back />;
  const activities = subject.activities.filter((a) => configs.get(a.key)?.isEnabled ?? true);
  const levels = levelsFor(subject.key);
  const done = (key: string) => best.get(key) !== undefined;
  const doneCount = levels.filter((l) => done(l.key)).length;
  const nextLevel = levels.find((l) => !done(l.key))?.level;

  return (
    <ChildScreen title={subject.name} emoji={subject.emoji} colorArt={LEARN_SUBJECT_ART[subject.key]} back>
      {activities.length === 0 && levels.length === 0 ? (
        <EmptyState icon="book-open-variant" title="Nothing to practise yet" message="A parent can turn activities on in Parent Mode." />
      ) : (
        <FlatList
          data={levels}
          keyExtractor={(l) => l.key}
          initialNumToRender={8}
          windowSize={5}
          maxToRenderPerBatch={6}
          removeClippedSubviews
          contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <View style={styles.header}>
          {activities.map((a, i) => theme.night ? (
            <MissionCard
              key={a.key}
              eyebrow={stars(best.get(a.key)) || earn || undefined}
              title={a.title}
              subtitle={a.description}
              glyph={a.emoji}
              colorArt={LEARN_ACTIVITY_ART[a.key]}
              color={COLORS[i % COLORS.length]}
              onPress={() => {
                speakFeedback(a.title);
                navigation.navigate('LearnActivity', { activityKey: a.key });
              }}
              accessibilityLabel={`${a.title}. ${a.description}${best.get(a.key) !== undefined ? `. Best ${Math.round((best.get(a.key) ?? 0) * 100)} percent` : ''}`}
            />
          ) : (
            <PressableScale
              key={a.key}
              onPress={() => {
                speakFeedback(a.title);
                navigation.navigate('LearnActivity', { activityKey: a.key });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${a.description}${best.get(a.key) !== undefined ? `. Best ${Math.round((best.get(a.key) ?? 0) * 100)} percent` : ''}`}
              hitSlop={4}
            >
              <View style={[styles.row, theme.shadow, { minHeight: Math.max(sizes.tileHeight * 0.62, 90), backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 1 }]}>
                <Glyph value={a.emoji} size={60} />
                <View style={styles.text}>
                  <Text style={[styles.title, { fontSize: sizes.tileLabel + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{a.title}</Text>
                  <Text style={[styles.desc, { fontSize: sizes.body - 3, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{a.description}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.stars} allowFontScaling={false}>{stars(best.get(a.key))}</Text>
                  <View style={[styles.play, { backgroundColor: theme.colors.primary }]}>
                    <Icon name="play" size={26} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </PressableScale>
          ))}
              {levels.length > 0 ? (
                <>
              <SectionLabel icon="stairs" text={`Levels 1 to ${levels.length}`} />
              <Card padding={SPACING.md}>
                <ProgressBar value={doneCount / levels.length} label={`${doneCount} / ${levels.length}`} color={theme.colors.selected} accessibilityLabel={`${doneCount} of ${levels.length} levels done`} />
              </Card>
                </>
              ) : null}
            </View>
          }
          renderItem={({ item: l, index: i }) => {
                const isDone = done(l.key);
                // One step at a time: a level opens once the one before it is done (a level already done stays open).
                const locked = !isDone && i > 0 && !done(levels[i - 1].key);
                return (
                  <MissionCard
                    key={l.key}
                    locked={locked}
                    eyebrow={`LEVEL ${l.level}`}
                    title={l.title}
                    subtitle={locked ? `Finish level ${l.level - 1} first.` : l.description}
                    glyph={l.emoji}
                    colorArt={LEARN_SUBJECT_ART[subject.key]}
                    color={COLORS[Math.floor((l.level - 1) / 10) % COLORS.length]}
                    done={isDone}
                    doneLabel="Done!"
                    compact={isDone}
                    current={l.level === nextLevel}
                    currentLabel="UP NEXT"
                    onPress={() => {
                      if (locked) return speakFeedback(`Finish level ${l.level - 1} first`);
                      speakFeedback(l.title);
                      navigation.navigate('LearnActivity', { activityKey: l.key });
                    }}
                    accessibilityLabel={`Level ${l.level}, ${l.title}. ${l.description}${isDone ? '. Done' : l.level === nextLevel ? '. Up next' : ''}${locked ? `. Locked. Finish level ${l.level - 1} first` : ''}`}
                  />
                );
}}
        />
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, paddingBottom: SPACING.xl },
  header: { gap: SPACING.md, marginBottom: SPACING.md },
  separator: { height: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  disc: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emoji: { lineHeight: 52 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.extrabold },
  desc: { fontFamily: Fonts.semibold },
  right: { alignItems: 'center', gap: 4 },
  stars: { fontSize: 14, minHeight: 18 },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#FFFFFF', fontSize: 18, marginLeft: 3 },
});
