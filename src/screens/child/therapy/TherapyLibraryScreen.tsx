import React from 'react';
import type { ColorArtName } from '@/components/adventure/ColorArt';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ChildScreen, SectionTitle } from '@/components/common';
import { MissionCard } from '@/components/adventure';
import { SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSubscription } from '@/context/SubscriptionContext';
import type { RootScreenProps } from '@/navigation/types';
import { THERAPY_GROUP_META, activitiesInGroup } from '@/therapy/content';
import { parseHidden } from '@/therapy/day';
import type { TherapyGroup } from '@/therapy/types';

const GROUP_COLOR: Record<TherapyGroup, 'sky' | 'grass' | 'grape' | 'sun'> = {
  grossMotor: 'sky',
  handFineMotor: 'grass',
  movementFlexibility: 'grape',
  functional: 'sun',
};

/**
 * Therapy Activities — the whole library, grouped by what it practises.
 *
 * The four groups are the Free/Plus boundary: Gross Motor and Hand & Fine Motor are free, because
 * between them they carry the everyday practice most home programmes begin with, and a family
 * should be able to use this section properly without paying. A locked group still OPENS its own
 * card — tapping explains Plus rather than doing nothing.
 */
export function TherapyLibraryScreen({ navigation }: RootScreenProps<'TherapyLibrary'>) {
  const { settings } = useSettings();
  const { can } = useSubscription();
  const hidden = parseHidden(settings.therapyHidden);
  const groups = Object.keys(THERAPY_GROUP_META) as TherapyGroup[];

  return (
    <ChildScreen title="Therapy Activities" emoji="🤸" subtitle="Practice ideas, by what they help with" back>
      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((group, i) => {
          const meta = THERAPY_GROUP_META[group];
          const items = activitiesInGroup(group).filter((a) => !hidden.has(a.id));
          if (items.length === 0) return null;
          const locked = !can('therapy', i).allowed;
          return (
            <View key={group} style={styles.block}>
              <SectionTitle title={meta.label} emoji="•" />
              {items.map((a) => (
                <MissionCard
                  key={a.id}
                  title={a.name}
                  subtitle={a.goal}
                  eyebrow={`About ${a.suggestedMinutes} min`}
                  colorArt={`therapy:${a.id}` as ColorArtName}
                  color={GROUP_COLOR[group]}
                  locked={locked}
                  onPress={() => {
                    if (locked) return navigation.navigate('Plus');
                    navigation.navigate('TherapyActivity', { activityId: a.id });
                  }}
                  accessibilityLabel={`${a.name}. ${a.goal}${locked ? '. Needs TalkEasy Plus' : ''}`}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  block: { gap: SPACING.md },
});
