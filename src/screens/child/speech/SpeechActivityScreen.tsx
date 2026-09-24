import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, ChildScreen, IconTile, PressableScale, ProgressBar } from '@/components/common';
import { ExerciseView, type PracticeKit } from '@/components/speech';
import { ItemPicture } from '@/components/speech/ItemPicture';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { speechPracticeRepo } from '@/database';
import { useMyWords, useSizes, useSoundRecorder, useSpeak, useVisibleButtons } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { soundPracticeAudio } from '@/services/soundPracticeAudio';
import { stopSpeaking } from '@/services/speech';
import { getActivityDef } from '@/speechpractice/activities';
import { buildExercises, categoriesFor, exerciseItemText } from '@/speechpractice/engine';
import type { ActivityId, Exercise, SpeechEventKind, SpeechItem } from '@/speechpractice/types';
import type { CommunicationButton } from '@/types/models';
import { Fonts, useTheme } from '@/theme';

/** Visits shorter than this are a mis-tap, not practice time. */
const MIN_SESSION_MS = 3000;

/** "Water." / "water" / "Water!" are the same word for matching a Talk card. */
function normalise(text: string): string {
  return text.trim().toLowerCase().replace(/[.!?]+$/, '');
}

/**
 * Runs any Speech Practice activity: the group picker (when the activity has groups), then its
 * exercises one at a time, then a short "All done".
 *
 * This screen owns audio, the microphone and tracking, and hands them to the exercise views
 * through a `PracticeKit`. Tracking records that practice happened — attempts, exercises,
 * finished activities, minutes — and never how it went.
 */
export function SpeechActivityScreen({ route, navigation }: RootScreenProps<'SpeechActivity'>) {
  const { activityId, category } = route.params;
  const def = getActivityDef(activityId);
  const sizes = useSizes();
  const theme = useTheme();
  const { t, tContent } = useI18n();
  const { settings } = useSettings();
  const { speakButton, speakFeedback } = useSpeak();
  const recorder = useSoundRecorder();
  const { data: myWords, loading: wordsLoading } = useMyWords();
  const { data: talkButtons } = useVisibleButtons();

  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [micDeclined, setMicDeclined] = useState(false);
  const [praiseIndex, setPraiseIndex] = useState(0);
  const attempted = useRef(false);
  const scroll = useRef<ScrollView>(null);

  const id = def?.id as ActivityId;
  const categories = def ? categoriesFor(id, myWords) : null;
  const pickingCategory = !!categories && !category;
  const group = categories?.find((c) => c.key === category);

  const exercises = useMemo<Exercise[]>(
    () => (def && !wordsLoading && !pickingCategory ? buildExercises(id, { category, myWords }) : []),
    // `round` reshuffles for "Practice again".
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, category, wordsLoading, pickingCategory, myWords, round],
  );
  const exercise = exercises[index];

  const log = useCallback(
    (kind: SpeechEventKind, item?: string, durationMs?: number) => {
      if (!def) return;
      speechPracticeRepo.record({ activityId: id, kind, item, durationMs }).catch(() => {});
    },
    [def, id],
  );

  // Practice time: one session per visit (not while choosing a group). Speech stops on leaving.
  const practising = useRef(!pickingCategory);
  practising.current = !pickingCategory;
  useEffect(() => {
    const startedAt = Date.now();
    return () => {
      const ms = Date.now() - startedAt;
      if (practising.current && ms >= MIN_SESSION_MS) log('session', undefined, ms);
      stopSpeaking();
    };
  }, [log]);

  const talkByText = useMemo(() => {
    const map = new Map<string, CommunicationButton>();
    for (const b of talkButtons) {
      if (!map.has(normalise(b.label))) map.set(normalise(b.label), b);
      if (!map.has(normalise(b.phrase))) map.set(normalise(b.phrase), b);
    }
    return map;
  }, [talkButtons]);

  const label = useCallback((item: SpeechItem) => (item.labelKey ? t(item.labelKey) : item.text), [t]);

  const kit: PracticeKit = {
    play: (items) => {
      soundPracticeAudio.playSequence(items, settings).catch(() => {});
    },
    modelStatus: (item) => soundPracticeAudio.modelStatus(item, settings),
    speakUi: (text) => {
      speakFeedback(text).catch(() => {});
    },
    label,
    attempt: (item, durationMs) => {
      attempted.current = true;
      log('attempt', item, durationMs);
    },
    finish: () => setCanNext(true),
    recorder,
    micDeclined,
    declineMic: () => setMicDeclined(true),
    praiseIndex,
    nextPraise: () => setPraiseIndex((i) => i + 1),
    talkButtonFor: (item) => {
      if (item.id.startsWith('my-')) {
        const buttonId = Number(item.id.slice(3).replace(/-phrase$/, ''));
        return talkButtons.find((b) => b.id === buttonId) ?? null;
      }
      return talkByText.get(normalise(item.text)) ?? null;
    },
    sayAsTalk: (button) => {
      speakButton(button).catch(() => {});
    },
  };

  // Listen first: each exercise plays its model (or reads its question) as it opens.
  useEffect(() => {
    if (!exercise || finished) return;
    switch (exercise.kind) {
      case 'say':
        kit.play([exercise.item]);
        break;
      case 'clap':
        kit.play([exercise.item]);
        break;
      case 'choose':
        if (exercise.preview?.length) kit.speakUi(t('spLookCarefully'));
        else if (exercise.listen.length) kit.play(exercise.listen);
        else kit.speakUi(exercise.promptKey ? t(exercise.promptKey) : exercise.prompt ?? '');
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id, round, finished]);

  if (!def) return <ChildScreen title={t('spTitle')} back />;
  const groupName = (key: string, name: string) => (key === 'my' ? t('spMyWords') : tContent(name));
  const title = group ? `${t(def.titleKey)} · ${groupName(group.key, group.name)}` : t(def.titleKey);

  // ---- Group picker -------------------------------------------------------------------------
  if (pickingCategory) {
    const tileWidth = `${Math.floor(100 / sizes.gridColumns) - 2}%` as const;
    return (
      <ChildScreen title={t(def.titleKey)} emoji={def.icon} emojiTint={def.tint} back>
        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Text style={[styles.lead, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('spChooseGroup')}
          </Text>
          <View style={[styles.grid, { gap: sizes.gap }]}>
            {categories!.map((c) => (
              <PressableScale
                key={c.key}
                onPress={() => navigation.push('SpeechActivity', { activityId: id, category: c.key })}
                accessibilityRole="button"
                accessibilityLabel={groupName(c.key, c.name)}
                hitSlop={4}
                style={{ width: tileWidth }}
              >
                <Card color={theme.colors.primarySoft} style={[styles.tile, { minHeight: Math.max(sizes.tileHeight * 0.8, 112) }]}>
                  <ItemPicture item={{ id: c.key, text: c.name, picture: c.picture }} size={sizes.iconSize - 6} />
                  <Text style={[styles.tileLabel, { fontSize: sizes.tileLabel - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                    {groupName(c.key, c.name)}
                  </Text>
                </Card>
              </PressableScale>
            ))}
          </View>
        </ScrollView>
      </ChildScreen>
    );
  }

  const next = () => {
    if (exercise && attempted.current) log('exercise', exerciseItemText(exercise));
    attempted.current = false;
    recorder.discard();
    setCanNext(false);
    if (index + 1 >= exercises.length) {
      log('complete');
      setFinished(true);
      kit.speakUi(t('spAllDone'));
    } else {
      setIndex(index + 1);
    }
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const again = () => {
    recorder.discard();
    setFinished(false);
    setCanNext(false);
    setIndex(0);
    setRound((r) => r + 1);
  };

  // Story and Turn Taking run their own steps; "Next" appears when they reach the end.
  const selfPaced = exercise?.kind === 'story' || exercise?.kind === 'turns';
  const last = index + 1 >= exercises.length;

  return (
    <ChildScreen title={title} emoji={def.icon} emojiTint={def.tint} back>
      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {wordsLoading ? null : exercises.length === 0 ? (
          <Card>
            <Text style={[styles.lead, { fontSize: sizes.body + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('spNoWords')}
            </Text>
          </Card>
        ) : finished ? (
          <>
            <Card color={theme.colors.successSoft} style={styles.done}>
              <IconTile name="star-outline" size={76} tint="#FFF1C2" />
              <Text style={[styles.doneText, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
                {t('spAllDone')}
              </Text>
            </Card>
            <BigButton label={t('spPracticeAgain')} icon="replay" minHeight={80} onPress={again} />
            <BigButton label={t('spMoreActivities')} icon="view-grid" variant="secondary" minHeight={72} onPress={() => navigation.navigate('SpeechPractice')} />
          </>
        ) : exercise ? (
          <>
            {exercises.length > 1 ? (
              <ProgressBar value={index / exercises.length} label={t('spProgress', { n: index + 1, total: exercises.length })} color={theme.colors.primary} />
            ) : null}
            <ExerciseView key={`${round}-${exercise.id}`} exercise={exercise} kit={kit} />
            {!selfPaced || canNext ? (
              <BigButton
                label={last ? t('actionDone') : t('actionNext')}
                icon={last ? 'check' : 'arrow-right'}
                variant="success"
                minHeight={80}
                onPress={next}
                style={styles.next}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  lead: { fontFamily: Fonts.semibold, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: SPACING.sm },
  tileLabel: { fontFamily: Fonts.extrabold, textAlign: 'center', alignSelf: 'stretch' },
  next: { marginTop: SPACING.sm },
  done: { alignItems: 'center', gap: SPACING.sm },
  doneEmoji: { fontSize: 64, lineHeight: 76 },
  doneText: { fontFamily: Fonts.black, textAlign: 'center' },
});
