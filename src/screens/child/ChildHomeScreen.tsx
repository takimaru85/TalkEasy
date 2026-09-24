import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Icon, PressableScale, ProgressBar, ScreenContainer, SectionTitle } from '@/components/common';
import { CommunicationTile } from '@/components/communication';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import {
  useActiveRoutineItems,
  useFavoriteButtons,
  useRecentLearning,
  useSizes,
  useTodayLessons,
  useSpeak,
  useStarSummary,
  useToday,
} from '@/hooks';
import { LEARNING_SUBJECTS, getActivity } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import { formatTime } from '@/utils/date';

type SectionScreen = 'Communicate' | 'AdaptiveHome' | 'School' | 'Learn' | 'MyDay' | 'Activities' | 'Favorites' | 'Feelings' | 'ParentPin';

const SECTIONS: { screen: SectionScreen; labelKey: keyof Strings; emoji: string; color: string }[] = [
  { screen: 'Communicate', labelKey: 'sectionTalk', emoji: SECTION_EMOJI.communicate, color: '#DCEBFF' },
  { screen: 'AdaptiveHome', labelKey: 'sectionLessons', emoji: '🎓', color: '#FFF1C2' },
  { screen: 'School', labelKey: 'sectionSchool', emoji: SECTION_EMOJI.school, color: '#DDF5E3' },
  { screen: 'Learn', labelKey: 'sectionLearn', emoji: SECTION_EMOJI.learn, color: '#E8DFFF' },
  { screen: 'MyDay', labelKey: 'sectionMyDay', emoji: SECTION_EMOJI.myday, color: '#FFE3C7' },
  { screen: 'Activities', labelKey: 'sectionActivities', emoji: SECTION_EMOJI.activities, color: '#D3F3F0' },
  { screen: 'Favorites', labelKey: 'sectionFavorites', emoji: SECTION_EMOJI.favorites, color: '#FFF1C2' },
  { screen: 'Feelings', labelKey: 'sectionFeelings', emoji: '😊', color: '#FFDBEA' },
  { screen: 'ParentPin', labelKey: 'sectionParent', emoji: SECTION_EMOJI.parent, color: '#ECEEF2' },
];

type Translate = (key: keyof Strings, vars?: Record<string, string | number>) => string;

function greetingFor(hour: number, t: Translate): { text: string; emoji: string } {
  if (hour < 12) return { text: t('goodMorning'), emoji: '☀️' };
  if (hour < 18) return { text: t('goodAfternoon'), emoji: '🌤️' };
  return { text: t('goodEvening'), emoji: '🌙' };
}

function statusLine(day: number, hour: number, allDone: boolean, t: Translate): string {
  if (allDone) return t('statusAllDone');
  if (day === 0 || day === 6) return t('statusWeekend');
  if (hour < 8) return t('statusBeforeSchool');
  if (hour < 15) return t('statusSchoolDay');
  if (hour < 19) return t('statusAfternoon');
  return t('statusEvening');
}

/**
 * The child's home. Everything here is driven by the profile: name, avatar, accent colour,
 * favourite phrases, favourite subjects, rewards. Layout (fixed order, top to bottom):
 * greeting → today's plan → the 8 sections → favourite phrases → continue learning → stars.
 */
export function ChildHomeScreen({ navigation }: RootScreenProps<'ChildHome'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { profile, displayName } = useProfile();
  const { now, dayOfWeek, isoDate } = useToday();
  const { data: todayLessons } = useTodayLessons(isoDate);
  const { data: routine } = useActiveRoutineItems();
  const { data: favorites } = useFavoriteButtons();
  const { data: recentLearning } = useRecentLearning(1);
  const { data: stars } = useStarSummary();
  const { lastButtonId, speakButton, speakFeedback } = useSpeak();
  const { t, tContent } = useI18n();

  const greeting = greetingFor(now.getHours(), t);
  const done = routine.filter((r) => r.isDone).length;
  const currentIndex = routine.findIndex((r) => !r.isDone);
  const current = currentIndex >= 0 ? routine[currentIndex] : null;
  const next = currentIndex >= 0 ? routine.slice(currentIndex + 1).find((r) => !r.isDone) ?? null : null;
  const status = statusLine(dayOfWeek, now.getHours(), routine.length > 0 && done === routine.length, t);
  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });

  // "Continue learning": last played activity, else the first activity of a favourite subject.
  const suggestion = useMemo(() => {
    const last = recentLearning[0] ? getActivity(recentLearning[0].activityKey) : undefined;
    if (last) return { activity: last, label: t('continueLabel') };
    const fav = LEARNING_SUBJECTS.find((s) => profile.favorites.subjects.some((f) => s.name.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(s.name.toLowerCase())));
    const subject = fav ?? LEARNING_SUBJECTS[0];
    return { activity: subject.activities[0], label: t('startLabel') };
  }, [recentLearning, profile.favorites.subjects]);
  const suggestionSubject = LEARNING_SUBJECTS.find((s) => s.key === suggestion.activity.subjectKey);

  const nextReward = stars.nextReward;
  const rewardProgress = nextReward ? Math.min(1, stars.total / nextReward.starsRequired) : 1;
  const tileHeight = Math.max(sizes.tileHeight * 0.85, 118);
  const tileWidth = `${Math.floor(100 / sizes.gridColumns) - 2}%` as const;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {/* Greeting */}
        <Pressable
          onPress={() => speakFeedback(`${greeting.text}, ${displayName}! Today is ${dayName}. ${status.replace(/[^\w\s'!.,]/g, '')}`)}
          accessibilityRole="button"
          accessibilityLabel={`${greeting.text} ${displayName}. Today is ${dayName}. ${status}. Tap to hear.`}
        >
          <Card color={theme.colors.primarySoft} style={styles.greeting}>
            <Avatar emoji={profile.avatar} photoUri={profile.photoUri} size={Math.max(72, sizes.iconSize + 24)} />
            <View style={styles.greetingText}>
              <Text style={[styles.hello, { fontSize: sizes.heading + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                {greeting.text}, {displayName}! {greeting.emoji}
              </Text>
              <Text style={[styles.sub, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Today is {dayName}.
              </Text>
              <Text style={[styles.status, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {status}
              </Text>
            </View>
          </Card>
        </Pressable>

        {/* Today's plan */}
        {routine.length > 0 ? (
          <PressableScale onPress={() => navigation.navigate('MyDay')} accessibilityRole="button" accessibilityLabel={`Today's plan, ${done} of ${routine.length} done. ${current ? `Now: ${current.label}.` : ''} ${next ? `Next: ${next.label}.` : ''}`}>
            <Card>
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {SECTION_EMOJI.myday} Today's plan
                </Text>
                <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
              </View>
              <ProgressBar value={routine.length ? done / routine.length : 0} label={`${done} / ${routine.length}`} color={theme.colors.success} />
              <View style={styles.planRows}>
                {current ? (
                  <View style={[styles.planRow, { backgroundColor: theme.tint(theme.colors.primarySoft), borderColor: theme.colors.primary }]}>
                    <Text style={[styles.planMark, { color: theme.colors.primaryDark }]} allowFontScaling={false}>→</Text>
                    <Icon name={current.icon} size={30} color={theme.colors.text} />
                    <Text style={[styles.planLabel, { fontSize: sizes.body + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {current.label}
                    </Text>
                    {current.startTime ? <Text style={[styles.planTime, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{formatTime(current.startTime)}</Text> : null}
                  </View>
                ) : null}
                {next ? (
                  <View style={[styles.planRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.planMark, { color: theme.colors.textMuted }]} allowFontScaling={false}>○</Text>
                    <Icon name={next.icon} size={30} color={theme.colors.textMuted} />
                    <Text style={[styles.planLabel, { fontSize: sizes.body + 1, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {next.label}
                    </Text>
                    {next.startTime ? <Text style={[styles.planTime, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{formatTime(next.startTime)}</Text> : null}
                  </View>
                ) : null}
              </View>
            </Card>
          </PressableScale>
        ) : null}

        {/* Today's schoolwork (Adaptive Learning) */}
        {todayLessons.length > 0 ? (
          <PressableScale onPress={() => navigation.navigate('AdaptiveHome')} accessibilityRole="button" accessibilityLabel={`Today's schoolwork, ${todayLessons.filter((l) => l.activityCount > 0 && l.completedCount >= l.activityCount).length} of ${todayLessons.length} lessons done`}>
            <Card color="#FFF1C2">
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  🎓 Today's schoolwork
                </Text>
                <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
              </View>
              <View style={styles.planRows}>
                {todayLessons.slice(0, 3).map((l) => {
                  const complete = l.activityCount > 0 && l.completedCount >= l.activityCount;
                  return (
                    <View key={l.id} style={[styles.planRow, { backgroundColor: theme.colors.surface, borderColor: complete ? theme.colors.success : theme.colors.borderSoft }]}>
                      <Text style={[styles.planMark, { color: complete ? theme.colors.success : theme.colors.textMuted }]} allowFontScaling={false}>{complete ? '✓' : '○'}</Text>
                      <Text style={styles.planEmoji} allowFontScaling={false}>{l.subjectIcon}</Text>
                      <Text style={[styles.planLabel, { fontSize: sizes.body + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                        {l.subjectName} – {l.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </PressableScale>
        ) : null}

        {/* Sections */}
        <Text style={[styles.question, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          What would you like to do?
        </Text>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {SECTIONS.map((s) => (
            <PressableScale
              key={s.screen}
              onPress={() => navigation.navigate(s.screen)}
              accessibilityRole="button"
              accessibilityLabel={t(s.labelKey)}
              hitSlop={4}
              style={{ width: tileWidth }}
            >
              <View style={[styles.tile, theme.shadow, { height: tileHeight, backgroundColor: theme.tint(s.color), borderColor: theme.highContrast ? theme.colors.border : 'transparent', borderWidth: theme.highContrast ? theme.borderWidth : 0 }]}>
                <Text style={[styles.tileEmoji, { fontSize: sizes.iconSize - 4 }]} allowFontScaling={false}>{s.emoji}</Text>
                <Text style={[styles.tileLabel, { fontSize: sizes.tileLabel, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1} adjustsFontSizeToFit>
                  {t(s.labelKey)}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
        <PressableScale
          onPress={() => navigation.navigate('SoundPractice')}
          accessibilityRole="button"
          accessibilityLabel={`${t('sectionSoundPractice')}. ${t('soundPracticeSubtitle')}`}
        >
          <View style={[styles.schoolMode, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
            <Text style={styles.schoolModeEmoji} allowFontScaling={false}>🎯</Text>
            <View style={styles.soundText}>
              <Text style={[styles.schoolModeText, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('sectionSoundPractice')}
              </Text>
              <Text style={[styles.soundSubtitle, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {t('soundPracticeSubtitle')}
              </Text>
            </View>
            <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
          </View>
        </PressableScale>

        <PressableScale onPress={() => navigation.navigate('SchoolMode')} accessibilityRole="button" accessibilityLabel="School Mode">
          <View style={[styles.schoolMode, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
            <Text style={styles.schoolModeEmoji} allowFontScaling={false}>{SECTION_EMOJI.schoolMode}</Text>
            <Text style={[styles.schoolModeText, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>School Mode</Text>
            <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
          </View>
        </PressableScale>

        {/* Favourite phrases */}
        {favorites.length > 0 ? (
          <>
            <SectionTitle title={`${displayName}'s favorites`} emoji={SECTION_EMOJI.favorites} />
            <View style={[styles.favRow, { gap: sizes.gap }]}>
              {favorites.slice(0, 3).map((b) => (
                <CommunicationTile key={b.id} button={b} selected={b.id === lastButtonId} onPress={speakButton} width={(sizes.tileWidth * sizes.columns + sizes.gap * (sizes.columns - 1) - sizes.gap * 2) / 3} compact />
              ))}
            </View>
          </>
        ) : null}

        {/* Continue learning */}
        <SectionTitle title={t('continueLearning')} emoji={SECTION_EMOJI.learn} />
        <PressableScale onPress={() => navigation.navigate('LearnActivity', { activityKey: suggestion.activity.key })} accessibilityRole="button" accessibilityLabel={`${suggestion.label} ${suggestion.activity.title}, ${suggestionSubject?.name ?? ''}`}>
          <Card color={suggestionSubject?.color}>
            <View style={styles.learnRow}>
              <Text style={styles.learnEmoji} allowFontScaling={false}>{suggestion.activity.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.learnTitle, { fontSize: sizes.body + 3, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {suggestion.activity.title}
                </Text>
                <Text style={[styles.sub, { fontSize: sizes.body - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {suggestionSubject?.name} · {suggestion.label}
                </Text>
              </View>
              <View style={[styles.playBtn, { backgroundColor: theme.colors.primary }]}>
                <Icon name="play" size={30} color="#FFFFFF" />
              </View>
            </View>
          </Card>
        </PressableScale>

        {/* Stars */}
        <SectionTitle title={`${displayName}'s stars`} emoji="⭐" trailing={`${stars.total} ⭐`} />
        <Card>
          {nextReward ? (
            <>
              <Text style={[styles.rewardLine, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {stars.total >= nextReward.starsRequired ? `You can get: ${nextReward.icon} ${tContent(nextReward.title)}!` : `${nextReward.starsRequired - stars.total} more for ${nextReward.icon} ${tContent(nextReward.title)}`}
              </Text>
              <ProgressBar value={rewardProgress} label={`${Math.min(stars.total, nextReward.starsRequired)} / ${nextReward.starsRequired}`} color={theme.colors.selected} />
            </>
          ) : (
            <Text style={[styles.rewardLine, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {stars.total} stars so far. Keep going!
            </Text>
          )}
          {stars.earnedToday > 0 ? (
            <Text style={[styles.sub, { fontSize: sizes.body - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              +{stars.earnedToday} today
            </Text>
          ) : null}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl * 2, gap: SPACING.md },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  greetingText: { flex: 1, gap: 2 },
  hello: { fontFamily: Fonts.black },
  sub: { fontFamily: Fonts.semibold },
  status: { fontFamily: Fonts.bold },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  planTitle: { fontFamily: Fonts.extrabold },
  planRows: { gap: SPACING.sm, marginTop: SPACING.sm },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 56, paddingHorizontal: SPACING.md, borderRadius: Radius.md, borderWidth: 1.5 },
  planMark: { fontSize: 22, fontFamily: Fonts.black, width: 22, textAlign: 'center' },
  planLabel: { flex: 1, fontFamily: Fonts.extrabold },
  planTime: { fontFamily: Fonts.bold, fontSize: 15 },
  planEmoji: { fontSize: 22, lineHeight: 28 },
  question: { fontFamily: Fonts.bold, textAlign: 'center', marginTop: SPACING.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  tile: { borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, padding: SPACING.sm },
  tileEmoji: { lineHeight: 70 },
  tileLabel: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  schoolMode: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: 64, paddingHorizontal: SPACING.lg, borderRadius: Radius.md, borderWidth: 2 },
  schoolModeEmoji: { fontSize: 28, lineHeight: 34 },
  schoolModeText: { flex: 1, fontFamily: Fonts.extrabold },
  soundText: { flex: 1, gap: 2, paddingVertical: SPACING.sm },
  soundSubtitle: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18 },
  favRow: { flexDirection: 'row' },
  learnRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  learnEmoji: { fontSize: 40, lineHeight: 50 },
  learnTitle: { fontFamily: Fonts.extrabold },
  playBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  rewardLine: { fontFamily: Fonts.bold, marginBottom: SPACING.sm },
});
