import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChildScreen, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { KIND_META, STATUS_META } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { assignmentsRepo } from '@/database';
import { useAssignment, useSizes, useSpeak, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { confirm } from '@/utils/confirm';
import { describeDueDate, formatShortDate } from '@/utils/date';

/** Large, simple view of one assignment with "Read it to me" and a big Finished button. */
export function AssignmentDetailScreen({ navigation, route }: RootScreenProps<'AssignmentDetail'>) {
  const sizes = useSizes();
  const { settings } = useSettings();
  const { isoDate } = useToday();
  const { data: a } = useAssignment(route.params.assignmentId);
  const { speakPhrase } = useSpeak();

  if (!a) return <ChildScreen title="Assignment" back />;

  const done = a.status === 'done';
  const subjectName = a.subject?.name ?? KIND_META[a.kind].label;
  const spoken = `${subjectName} ${KIND_META[a.kind].label}. ${a.title}. ${a.description} ${a.dueDate ? `Due ${describeDueDate(a.dueDate, isoDate)}.` : ''} ${STATUS_META[a.status].childLabel}.`;

  const toggle = async () => {
    if (!done && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${a.title}" as finished?`, 'Yes, finished');
      if (!ok) return;
    }
    await assignmentsRepo.setStatus(a.id, done ? 'todo' : 'done');
    speakPhrase(done ? 'Not finished yet.' : 'Finished! Great job.');
    if (!done) navigation.goBack();
  };

  return (
    <ChildScreen title={subjectName} back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <View style={[styles.hero, { backgroundColor: done ? '#E8E8E8' : a.subject?.color ?? '#FFF3A8' }]}>
          <Icon name={done ? 'check-circle' : (a.subject?.icon ?? KIND_META[a.kind].icon)} size={sizes.iconSize + 16} color={done ? Colors.success : Colors.text} />
          <Text style={[styles.title, { fontSize: sizes.phrase - 6 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {a.title}
          </Text>
          <Text style={[styles.line, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {KIND_META[a.kind].label} · {a.dueDate ? `📅 Due ${describeDueDate(a.dueDate, isoDate)} (${formatShortDate(a.dueDate)})` : 'No due date'}
          </Text>
          <Text style={[styles.line, styles.status, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {done ? '✅ Completed' : `⬜ ${STATUS_META[a.status].childLabel}`}
          </Text>
        </View>

        {a.description ? (
          <Text style={[styles.description, { fontSize: sizes.body + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{a.description}</Text>
        ) : null}

        {a.photoUri ? (
          <Image source={{ uri: a.photoUri }} style={styles.photo} accessibilityLabel="Assignment photo" accessibilityIgnoresInvertColors />
        ) : null}

        <BigButton label="Read it to me" icon="volume-high" variant="secondary" minHeight={80} onPress={() => speakPhrase(spoken)} />
        <BigButton
          label={done ? 'Not finished yet' : 'Finished!'}
          icon={done ? 'close' : 'check-bold'}
          variant={done ? 'secondary' : 'success'}
          minHeight={96}
          onPress={toggle}
        />
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xl },
  hero: {
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  title: { fontWeight: '900', color: Colors.text, textAlign: 'center' },
  line: { fontWeight: '700', color: Colors.text, textAlign: 'center' },
  status: { color: Colors.textMuted },
  description: { color: Colors.text, lineHeight: 34, textAlign: 'center' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: RADIUS.tile, borderWidth: 3, borderColor: Colors.border },
});
