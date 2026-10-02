import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen } from '@/components/common';
import { HeroPanel, MissionCard } from '@/components/adventure';
import { useSubscription } from '@/context/SubscriptionContext';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useVoiceAreas } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { PurposeColor, PurposeLabelKey } from '@/theme/purpose';
import { PRACTICE_AREAS, activityCount } from '@/practice/engine';

/**
 * Listen & Talk — the practice pathway.
 *
 * A PATHWAY, deliberately, where Speech Practice is a grid: these are areas of development that
 * build on each other and carry progress, so they are full-width cards you read down a list. Speech
 * Practice is a set of interchangeable activities you pick from, so it is a grid of tiles. Two
 * layouts, because the two things are shaped differently.
 *
 * Everything else is shared with Speech Practice and the rest of the app: the same `ChildScreen`
 * header, the same `HeroPanel` banner, the same `MissionCard` rows used by lessons and writing
 * levels — same radius, shadow, disc, typography, press animation and progress bar. This screen
 * styles almost nothing of its own, which is the point: a screen with its own card is a screen
 * that will drift.
 *
 * The bars show HOW MUCH OF AN AREA HAS BEEN TRIED, never how well anything went, and the note at
 * the end says so — a row of progress bars next to a child's name is read as a verdict unless the
 * app states plainly that it is not one.
 */
export function VoiceCommHomeScreen({ navigation }: RootScreenProps<'VoiceComm'>) {
  const theme = useTheme();
  const { t } = useI18n();
  const { data: areas } = useVoiceAreas();
  const night = !!theme.night;

  const byId = new Map(areas.map((a) => [a.category, a]));
  /** The first area with nothing done yet — marked as the one to try next. */
  // The speech-sound ladder is Speech Practice's, not this section's: listing it here would be
  // the same activities in two places, which is exactly what we are removing.
  const areasShown = PRACTICE_AREAS.filter((a) => !a.ownedElsewhere);
  const { can } = useSubscription();
  const nextUp = areasShown.find((cat) => (byId.get(cat.id)?.activities ?? 0) === 0)?.id;

  return (
    <ChildScreen title={t('vcTitle')} subtitle={t('vcSubtitle')} emoji="🎵" art="speech" back>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroPanel color="lagoon" art="practice" title={t('vcTitle')} subtitle={t('vcSubtitle')} mascot>
          <MissionCard
            title={t('vcSessionCta')}
            subtitle={t('vcSessionCtaSub')}
            glyph="⏱️"
            color="sun"
            compact
            onPress={() => navigation.navigate('PracticeSession')}
            accessibilityLabel={`${t('vcSessionCta')}. ${t('vcSessionCtaSub')}.`}
          />
        </HeroPanel>

        {areasShown.map((cat, i) => {
          const progress = byId.get(cat.id);
          const total = activityCount(cat.id);
          const done = progress?.activities ?? 0;
          // Free covers the developmental beginning — attention, early communication, understanding.
          const locked = !can('listenTalk', i).allowed;
          return (
            <MissionCard
              key={cat.id}
              locked={locked}
              title={t(cat.titleKey)}
              subtitle={t(cat.subtitleKey)}
              eyebrow={t(PurposeLabelKey[cat.purpose])}
              glyph={cat.emoji}
              color={PurposeColor[cat.purpose]}
              progress={{ value: total > 0 ? done / total : 0, label: `${done} / ${total}` }}
              current={cat.id === nextUp}
              currentLabel={t('vcStartHere')}
              onPress={() => {
                if (locked) return navigation.navigate('Plus');
                navigation.navigate('VoiceArea', { category: cat.id });
              }}
              accessibilityLabel={`${t(cat.titleKey)}. ${t(cat.subtitleKey)}. ${t('vcPractised')} ${done} / ${total}.${locked ? '. Needs TalkEasy Plus' : ''}`}
            />
          );
        })}

        <Text
          style={[styles.note, { color: night ? 'rgba(255,255,255,0.78)' : theme.colors.textMuted }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('vcNotAssessment')}
        </Text>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.xl * 2 },
  note: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 17, textAlign: 'center', paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm },
});
