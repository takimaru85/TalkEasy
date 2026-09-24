import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Celebration, ChildScreen, EmptyState, Icon } from '@/components/common';
import { ACTIVITY_CATEGORY_META, SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useProfile, personalize } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { therapyRepo } from '@/database';
import { useAwardStars, useSizes, useSpeak, useTherapyActivities } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import type { ActivityCategory, TherapyActivity } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { useI18n } from '@/i18n';

/**
 * Activities: cards grouped by category (games, art, music, exercise, reading, outdoor,
 * sensory, chores, therapy). Tapping a card opens it; "Done!" earns a star.
 * An organiser for activities given by the child's caregivers/professionals — not medical advice.
 */
export function ActivitiesScreen(_props: RootScreenProps<'Activities'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { profile, displayName } = useProfile();
  const { data: activities, loading } = useTherapyActivities();
  const { speakPhrase, speakFeedback } = useSpeak();
  const { t, tContent } = useI18n();
  const award = useAwardStars();
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<ActivityCategory | null>(null);
  const [burst, setBurst] = useState(0);

  const open = activities.find((e) => e.id === openId) ?? null;
  const categories = (Object.keys(ACTIVITY_CATEGORY_META) as ActivityCategory[]).filter((k) => activities.some((a) => a.category === k));
  const visible = filter ? activities.filter((a) => a.category === filter) : activities;

  const openCard = (ex: TherapyActivity) => {
    setOpenId(ex.id);
    speakPhrase(tContent(ex.name));
  };

  const toggleDone = async (ex: TherapyActivity) => {
    if (!ex.isCompleted && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${tContent(ex.name)}" as done?`, 'Yes, done');
      if (!ok) return;
    }
    await therapyRepo.setCompleted(ex.id, !ex.isCompleted);
    if (!ex.isCompleted) {
      await award('activity', ex.name);
      setBurst((b) => b + 1);
      speakFeedback(personalize(profile.rewards.celebrationMessage, displayName));
      setTimeout(() => setOpenId(null), 900);
    } else {
      speakPhrase(tContent(ex.name));
      setOpenId(null);
    }
  };

  if (open) {
    const meta = ACTIVITY_CATEGORY_META[open.category];
    return (
      <ChildScreen title={tContent(open.name)} back>
        <Celebration trigger={burst} />
        <ScrollView contentContainerStyle={[styles.detail, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Card color={meta.color} style={styles.hero}>
            {open.imageUri ? (
              <Image source={{ uri: open.imageUri }} style={styles.image} accessibilityIgnoresInvertColors accessibilityLabel={tContent(open.name)} />
            ) : (
              <Icon name={open.icon} size={sizes.iconSize + 36} color={theme.colors.text} />
            )}
            <View style={styles.metaRow}>
              <Text style={[styles.chip, { color: theme.colors.text, backgroundColor: theme.colors.surface }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{meta.emoji} {meta.label}</Text>
              {open.durationMinutes > 0 ? <Text style={[styles.chip, { color: theme.colors.text, backgroundColor: theme.colors.surface }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>⏱ {open.durationMinutes} min</Text> : null}
            </View>
          </Card>
          <Text style={[styles.instructions, { fontSize: sizes.body + 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {open.instructions ? tContent(open.instructions) : 'No instructions yet.'}
          </Text>
          <BigButton label="Read it to me" icon="volume-high" variant="secondary" minHeight={76} onPress={() => speakPhrase(`${tContent(open.name)}. ${tContent(open.instructions)}`)} />
          <BigButton
            label={open.isCompleted ? 'Not done yet' : 'Done!'}
            icon={open.isCompleted ? 'close' : 'check-bold'}
            variant={open.isCompleted ? 'outline' : 'success'}
            minHeight={96}
            onPress={() => toggleDone(open)}
          />
        </ScrollView>
      </ChildScreen>
    );
  }

  return (
    <ChildScreen title={t('sectionActivities')} emoji={SECTION_EMOJI.activities}>
      {!loading && activities.length === 0 ? (
        <EmptyState icon="puzzle" title="No activities yet" message="A parent can add activities in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          {categories.length > 1 ? (
            <View style={styles.filters}>
              <FilterPill label="All" emoji="✨" selected={filter === null} onPress={() => setFilter(null)} />
              {categories.map((k) => (
                <FilterPill key={k} label={ACTIVITY_CATEGORY_META[k].label} emoji={ACTIVITY_CATEGORY_META[k].emoji} selected={filter === k} onPress={() => setFilter(k)} />
              ))}
            </View>
          ) : null}
          {visible.map((ex) => {
            const meta = ACTIVITY_CATEGORY_META[ex.category];
            return (
              <Pressable
                key={ex.id}
                onPress={() => openCard(ex)}
                accessibilityRole="button"
                accessibilityLabel={`${tContent(ex.name)}, ${meta.label}${ex.isCompleted ? ', done' : ', not completed'}`}
                hitSlop={4}
                style={({ pressed }) => [
                  styles.card,
                  theme.shadow,
                  { minHeight: Math.max(sizes.tileHeight * 0.7, 96), backgroundColor: ex.isCompleted ? theme.colors.surfaceAlt : theme.colors.surface, borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 1 },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.disc, { backgroundColor: theme.tint(meta.color) }]}>
                  {ex.imageUri ? <Image source={{ uri: ex.imageUri }} style={styles.thumb} accessibilityIgnoresInvertColors /> : <Icon name={ex.icon} size={sizes.iconSize - 8} color={theme.colors.text} />}
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { fontSize: sizes.tileLabel + 1, color: ex.isCompleted ? theme.colors.textMuted : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                    {tContent(ex.name)}
                  </Text>
                  <Text style={[styles.cardMeta, { fontSize: sizes.body - 3, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {meta.emoji} {meta.label}{ex.durationMinutes > 0 ? ` · ${ex.durationMinutes} min` : ''} · {ex.isCompleted ? '✅ Done' : '⬜ Not done'}
                  </Text>
                </View>
                <View style={[styles.check, { borderColor: ex.isCompleted ? theme.colors.success : theme.colors.borderSoft, backgroundColor: ex.isCompleted ? theme.colors.success : theme.colors.surface }]}>
                  {ex.isCompleted ? <Icon name="check-bold" size={26} color="#FFFFFF" /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </ChildScreen>
  );
}

function FilterPill({ label, emoji, selected, onPress }: { label: string; emoji: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.pill, { backgroundColor: selected ? theme.colors.primary : theme.colors.surface, borderColor: selected ? theme.colors.primaryDark : theme.colors.borderSoft }]}
    >
      <Text style={[styles.pillText, { color: selected ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {selected ? '✓ ' : ''}{emoji} {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pill: { minHeight: MIN_CHILD_TARGET - 8, paddingHorizontal: SPACING.md, borderRadius: Radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  pillText: { fontFamily: Fonts.extrabold, fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  disc: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumb: { width: 64, height: 64 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: Fonts.extrabold },
  cardMeta: { fontFamily: Fonts.bold },
  check: { width: 48, height: 48, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  detail: { paddingVertical: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xl },
  hero: { alignItems: 'center', gap: SPACING.md },
  image: { width: 220, height: 220, borderRadius: Radius.lg },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { fontFamily: Fonts.bold, fontSize: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  instructions: { fontFamily: Fonts.semibold, lineHeight: 34, textAlign: 'center' },
});
