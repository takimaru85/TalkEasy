import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChoiceRow, ListRow, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { Colors } from '@/constants/colors';
import { DIFFICULTY_META } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { learningRepo } from '@/database';
import { useLearningBest, useLearningConfigs } from '@/hooks';
import { LEARNING_SUBJECTS } from '@/learning';
import type { ParentScreenProps } from '@/navigation/types';
import type { Difficulty } from '@/types/models';

const DIFF_CHOICES = (Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => ({ value: d, label: DIFFICULTY_META[d].label }));

/**
 * Turn learning activities on/off and set difficulty (global default + per-activity override).
 * Content is bundled with the app; nothing is downloaded.
 */
export function ManageLearningScreen({ navigation }: ParentScreenProps<'ManageLearning'>) {
  const { settings, updateSetting } = useSettings();
  const { data: configs } = useLearningConfigs();
  const { data: best } = useLearningBest();

  const cycle = (key: string) => {
    const current = configs.get(key)?.difficulty ?? null;
    const order: (Difficulty | null)[] = [null, 'easy', 'medium', 'hard'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    learningRepo.setDifficulty(key, next);
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Learning" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <ChoiceRow<Difficulty> label="Difficulty for all activities" value={settings.learningDifficulty} onChange={(v) => updateSetting('learningDifficulty', v)} choices={DIFF_CHOICES} />
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Easy = 2 answer choices and small numbers. Medium = 3 choices. Hard = 4 choices and bigger numbers.
          The star button on an activity sets its own difficulty (tap to cycle: default → Easy → Medium → Hard).
          These are supportive practice activities, not a replacement for the teacher's lessons.
        </Text>

        {LEARNING_SUBJECTS.map((subject) => (
          <View key={subject.key} style={styles.group}>
            <SectionTitle title={subject.name} emoji={subject.emoji} />
            {subject.activities.map((a) => {
              const cfg = configs.get(a.key);
              const enabled = cfg?.isEnabled ?? true;
              const own = cfg?.difficulty ?? null;
              const b = best.get(a.key);
              return (
                <ListRow
                  key={a.key}
                  title={`${a.emoji} ${a.title}`}
                  subtitle={[
                    a.description,
                    `Difficulty: ${own ? DIFFICULTY_META[own].label : `Default (${DIFFICULTY_META[settings.learningDifficulty].label})`}` +
                      (b !== undefined ? ` · Best ${Math.round(b * 100)}%` : ''),
                  ].join('\n')}
                  dimmed={!enabled}
                  actions={[
                    {
                      icon: enabled ? 'toggle-switch' : 'toggle-switch-off-outline',
                      label: enabled ? 'Turn off' : 'Turn on',
                      color: enabled ? Colors.success : Colors.textMuted,
                      onPress: () => learningRepo.setEnabled(a.key, !enabled),
                    },
                    { icon: own ? DIFFICULTY_META[own].icon : 'star-off', label: 'Change difficulty', onPress: () => cycle(a.key) },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 15, lineHeight: 21 },
  group: { gap: SPACING.sm },
});
