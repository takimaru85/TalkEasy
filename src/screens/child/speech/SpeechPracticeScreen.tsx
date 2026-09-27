import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, SectionTitle } from '@/components/common';
import { GameTile, HeroPanel, StatPill, SyllableChips } from '@/components/adventure';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes, useTodaySpeechPractice } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { ACTIVITIES, LEVELS, parseHiddenActivities } from '@/speechpractice/activities';
import type { ActivityDef } from '@/speechpractice/types';
import { Fonts, useTheme } from '@/theme';

/** Whole minutes, rounded up once any practice has happened, so "0 min" never follows real work. */
function minutes(ms: number): number {
  return ms > 0 ? Math.max(1, Math.round(ms / 60000)) : 0;
}

/**
 * Speech Practice — pick an activity.
 *
 * Activities are grouped Beginner / Intermediate / Advanced as a guide for grown-ups; nothing is
 * locked and there is no progression to unlock. A parent can hide activities in Parent Mode.
 */
export function SpeechPracticeScreen({ navigation }: RootScreenProps<'SpeechPractice'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { settings } = useSettings();
  const { data: stats } = useTodaySpeechPractice();
  const hidden = useMemo(() => parseHiddenActivities(settings.speechPracticeHidden), [settings.speechPracticeHidden]);

  const tileWidth = `${Math.floor(100 / sizes.gridColumns) - 2}%` as const;
  const open = (a: ActivityDef) => (a.route ? navigation.navigate(a.route) : navigation.navigate('SpeechActivity', { activityId: a.id }));
  const visible = ACTIVITIES.filter((a) => !hidden.has(a.id));

  return (
    <ChildScreen title={t('spTitle')} emoji="microphone-outline" emojiTint="#FFD9D3" art="speech">
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {/* On the night sky: the section's own banner — Pip, the mic, and BA-BU to tap and hear. */}
        <HeroPanel color="lagoon" art="speech" title={t('advPipLine')} subtitle={t('spSubtitle')} mascot>
          <SyllableChips />
          <View style={styles.pills}>
            <StatPill icon="star" value={String(stats.activitiesCompleted)} label={`${t('spStatActivities')}: ${stats.activitiesCompleted}`} color="sun" />
            <StatPill icon="microphone" value={String(stats.attempts)} label={`${t('soundStatAttempts')}: ${stats.attempts}`} color="lagoon" />
          </View>
        </HeroPanel>
        {theme.night ? null : (
          <Text style={[styles.subtitle, { fontSize: sizes.body + 1, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('spSubtitle')}
          </Text>
        )}

        {visible.length === 0 ? (
          <Card>
            <Text style={[styles.subtitle, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('spAllHidden')}
            </Text>
          </Card>
        ) : null}

        {LEVELS.map(({ level, emoji, titleKey }) => {
          const items = visible.filter((a) => a.level === level);
          if (items.length === 0) return null;
          return (
            <View key={level} style={styles.level}>
              <SectionTitle title={t(titleKey)} emoji={emoji} />
              <View style={[styles.grid, { gap: sizes.gap }]}>
                {items.map((a) => (
                  <GameTile
                    key={a.id}
                    label={t(a.titleKey)}
                    tint={a.tint}
                    glyph={a.icon}
                    onPress={() => open(a)}
                    accessibilityLabel={`${t(a.titleKey)}, ${t(titleKey)}`}
                    width={tileWidth}
                    minHeight={Math.max(sizes.tileHeight * 0.8, 112)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        <SectionTitle title={t('soundTodaysPractice')} emoji="📋" />
        <Card>
          <StatLine label={t('spStatActivities')} value={String(stats.activitiesCompleted)} />
          <StatLine label={t('spStatWords')} value={String(stats.wordsPracticed)} />
          <StatLine label={t('soundStatAttempts')} value={String(stats.attempts)} />
          <StatLine label={t('soundStatTime')} value={`${minutes(stats.practiceMs)} min`} />
        </Card>

        {/* One quiet line for grown-ups; the full notice lives in Parent Mode, not in the child's way. */}
        <Text style={[styles.grownUps, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('spGrownUps')}
        </Text>
      </ScrollView>
    </ChildScreen>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  const sizes = useSizes();
  const theme = useTheme();
  return (
    <View style={styles.statRow} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.statLabel, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <Text style={[styles.statValue, { fontSize: sizes.body + 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  subtitle: { fontFamily: Fonts.semibold, textAlign: 'center' },
  level: { gap: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  pills: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  statLabel: { fontFamily: Fonts.semibold, flexShrink: 1 },
  statValue: { fontFamily: Fonts.black },
  grownUps: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
