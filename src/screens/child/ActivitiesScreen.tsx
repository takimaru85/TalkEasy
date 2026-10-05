import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BigButton, Card, Celebration, ChildScreen, EmptyState, Icon } from '@/components/common';
import { ColorArt, MissionCard } from '@/components/adventure';
import { usesCategoryArt } from '@/activities/categoryArt';
import { ACTIVITY_CATEGORY_META, SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { ACTIVITY_PICTURE_RATIO } from '@/activities/pictures';
import { activityPicture } from '@/components/activities/activityPictures';
import { useProfile, personalize } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { therapyRepo } from '@/database';
import { useClaimStatus, useClaimStars, useSizes, useSpeak, useTherapyActivities, useToday } from '@/hooks';
import { rewardsRepo } from '@/database';
import { AWAITING_MESSAGE, claimKey } from '@/rewards/verification';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, shade, useTheme } from '@/theme';
import { tileInk } from '@/constants/colors';
import type { ActivityCategory, TherapyActivity } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { useI18n } from '@/i18n';

/**
 * Activities: cards grouped by category (games, art, music, exercise, reading, outdoor,
 * sensory, chores, therapy). Tapping a card opens it; "Done!" earns a star.
 * An organiser for activities given by the child's caregivers/professionals — not medical advice.
 */
/** The widest an activity's picture is drawn, in points. Phones never reach it. */
const MAX_PICTURE_WIDTH = 640;

export function ActivitiesScreen({ navigation }: RootScreenProps<'Activities'>) {
  const { width: windowWidth } = useWindowDimensions();
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { profile, displayName } = useProfile();
  const { data: activities, loading } = useTherapyActivities();
  const { speakPhrase, speakFeedback } = useSpeak();
  const { t, tContent } = useI18n();
  const claim = useClaimStars();
  const { isoDate } = useToday();
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<ActivityCategory | null>(null);
  const [burst, setBurst] = useState(0);

  const open = activities.find((e) => e.id === openId) ?? null;
  const { data: claimStatus } = useClaimStatus(open ? claimKey.offline(open.id, isoDate) : null);
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
    const key = claimKey.offline(ex.id, isoDate);
    if (!ex.isCompleted) {
      // A real-world activity: the app cannot see it, so the star WAITS for a grown-up to confirm in Parent Mode.
      const r = await claim('offline', key, ex.name);
      setBurst((b) => b + 1);
      speakFeedback(r.outcome === 'awaiting_parent' ? AWAITING_MESSAGE : personalize(profile.rewards.celebrationMessage, displayName));
      setTimeout(() => setOpenId(null), 900);
    } else {
      // Un-ticking an activity that was still waiting for a grown-up takes it off their list. Stars already
      // credited stay, and re-ticking the same day cannot credit them again.
      await rewardsRepo.withdrawClaim(key);
      speakPhrase(tContent(ex.name));
      setOpenId(null);
    }
  };

  if (open) {
    const meta = ACTIVITY_CATEGORY_META[open.category];
    // Sized EXPLICITLY, from the floored window width (a first frame can report 0 — see
    // MIN_SUPPORTED_WIDTH): the screen padding and the card padding come off it. Width and height,
    // never aspectRatio, which react-native-web ignores.
    const picture = open.imageUri ? null : activityPicture(open.name);
    // Capped for tablets and wide windows, where a full-width 3:2 picture would be taller than the screen.
    const pictureWidth = Math.min(MAX_PICTURE_WIDTH, Math.max(MIN_SUPPORTED_WIDTH, windowWidth) - sizes.horizontalPadding * 2 - SPACING.lg * 2);
    return (
      <ChildScreen title={tContent(open.name)} back>
        <Celebration trigger={burst} />
        <ScrollView contentContainerStyle={[styles.detail, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Card color={meta.color} style={styles.hero}>
            {open.imageUri ? (
              <Image source={{ uri: open.imageUri }} style={styles.image} accessibilityIgnoresInvertColors accessibilityLabel={tContent(open.name)} />
            ) : picture ? (
              <Image
                source={picture}
                style={[styles.picture, { width: pictureWidth, height: Math.round(pictureWidth / ACTIVITY_PICTURE_RATIO) }]}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                accessibilityLabel={`${tContent(open.name)}: pictures showing the steps`}
              />
            ) : (
              <Icon name={open.icon} size={sizes.iconSize + 36} color={theme.colors.text} />
            )}
            <View style={styles.metaRow}>
              <Text style={[styles.chip, { color: theme.colors.text, backgroundColor: theme.colors.surface }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{meta.label}</Text>
              {open.durationMinutes > 0 ? <Text style={[styles.chip, { color: theme.colors.text, backgroundColor: theme.colors.surface }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{open.durationMinutes} min</Text> : null}
            </View>
          </Card>
          <Text style={[styles.instructions, { fontSize: sizes.body + 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {open.instructions ? tContent(open.instructions) : 'No instructions yet.'}
          </Text>
          <BigButton label="Read it to me" icon="volume-high" variant="secondary" minHeight={76} onPress={() => speakPhrase(`${tContent(open.name)}. ${tContent(open.instructions)}`)} />
          {open.isCompleted && claimStatus === 'awaiting_parent' ? (
            <Text style={[styles.instructions, { fontSize: sizes.body + 2, color: theme.colors.text }]} accessibilityLiveRegion="polite" maxFontSizeMultiplier={MAX_FONT_SCALE}>
              ⏳ Waiting for a grown-up to check it.
            </Text>
          ) : null}
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
    <ChildScreen title={t('sectionActivities')} subtitle={t('activitiesSubtitle')} emoji={SECTION_EMOJI.activities} art="activities">
      {!loading && activities.length === 0 ? (
        <EmptyState icon="puzzle" title="No activities yet" message="A parent can add activities in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          {/* Therapy sits at the top of the list — see the note on styles.therapyEntry. */}
          <MissionCard
            title="Therapy"
            subtitle="Movement and hand skills at home"
            colorArt="category:therapy"
            color="lagoon"
            onPress={() => navigation.navigate('TherapyHome')}
            accessibilityLabel="Therapy. Home practice for movement and hand skills."
          />
          {/* The filters are one scrolling row: seven wrapped pills made three rows that pushed the activities off the screen. */}
          {categories.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              <FilterPill label="All" emoji="✨" selected={filter === null} onPress={() => setFilter(null)} />
              {categories.map((k) => (
                <FilterPill key={k} label={ACTIVITY_CATEGORY_META[k].label} emoji={ACTIVITY_CATEGORY_META[k].emoji} selected={filter === k} onPress={() => setFilter(k)} />
              ))}
            </ScrollView>
          ) : null}
          {visible.map((ex) => {
            const meta = ACTIVITY_CATEGORY_META[ex.category];
            // On the night sky: a solid game card in the category colour, white words.
            const deep = tileInk(meta.color);
            const night = theme.night;
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
                  night && { backgroundColor: ex.isCompleted ? theme.colors.surfaceAlt : deep, borderColor: shade(ex.isCompleted ? theme.colors.surfaceAlt : deep, 1.4), borderWidth: 1.5, borderBottomWidth: 5, borderBottomColor: shade(ex.isCompleted ? theme.colors.surfaceAlt : deep, 0.64) },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.disc, { backgroundColor: theme.tint(meta.color) }, night && { backgroundColor: shade(deep, 0.8), borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)' }]}>
                  {/* A photo a grown-up attached wins; then the category illustration for a stock icon; then
                      whatever icon a grown-up picked themselves, exactly as they chose it. */}
                  {ex.imageUri ? (
                    <Image source={{ uri: ex.imageUri }} style={styles.thumb} accessibilityIgnoresInvertColors />
                  ) : usesCategoryArt(ex.icon) ? (
                    <ColorArt name={`category:${ex.category}`} size={46} />
                  ) : (
                    <Icon name={ex.icon} size={sizes.iconSize - 8} color={night ? '#FFFFFF' : theme.colors.text} />
                  )}
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { fontSize: sizes.tileLabel + 1, color: ex.isCompleted ? theme.colors.textMuted : theme.colors.text }, night && !ex.isCompleted && styles.shadowText]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                    {tContent(ex.name)}
                  </Text>
                  <Text style={[styles.cardMeta, { fontSize: sizes.body - 3, color: night && !ex.isCompleted ? 'rgba(255,255,255,0.88)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {meta.label}{ex.durationMinutes > 0 ? ` · ${ex.durationMinutes} min` : ''} · {ex.isCompleted ? 'Done' : 'Not done'}
                  </Text>
                </View>
                <View style={[styles.check, { borderColor: ex.isCompleted ? theme.colors.success : theme.colors.borderSoft, backgroundColor: ex.isCompleted ? theme.colors.success : theme.colors.surface }, night && !ex.isCompleted && { backgroundColor: shade(deep, 0.78), borderColor: 'rgba(255,255,255,0.9)' }]}>
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
      style={[
        styles.pill,
        { backgroundColor: selected ? theme.colors.primary : theme.colors.surface, borderColor: selected ? theme.colors.primaryDark : theme.colors.borderSoft },
        // Night: a solid tab with a darker base; the chosen one gets the gold rim.
        theme.night && { backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: selected ? theme.colors.selected : shade(theme.colors.surfaceAlt, 1.5), borderWidth: selected ? 3 : 1.5, borderBottomWidth: 4, borderBottomColor: selected ? theme.colors.selected : shade(theme.colors.surfaceAlt, 0.6) },
      ]}
    >
      <Icon name={selected ? 'check-bold' : emoji} size={20} color={selected || theme.night ? '#FFFFFF' : theme.colors.textMuted} />
      <Text style={[styles.pillText, { color: selected ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  therapyEntry: { paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  list: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  filters: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: 2, paddingRight: SPACING.sm },
  pill: { minHeight: MIN_CHILD_TARGET - 8, paddingHorizontal: SPACING.md, borderRadius: Radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  pillText: { fontFamily: Fonts.extrabold, fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  disc: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumb: { width: 64, height: 64 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: Fonts.extrabold },
  cardMeta: { fontFamily: Fonts.bold },
  shadowText: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  check: { width: 48, height: 48, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  detail: { paddingVertical: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xl },
  hero: { alignItems: 'center', gap: SPACING.md },
  image: { width: 220, height: 220, borderRadius: Radius.lg },
  picture: { borderRadius: Radius.md },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { fontFamily: Fonts.bold, fontSize: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  instructions: { fontFamily: Fonts.semibold, lineHeight: 34, textAlign: 'center' },
});
