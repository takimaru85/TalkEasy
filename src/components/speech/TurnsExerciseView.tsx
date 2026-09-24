import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card } from '@/components/common';
import { ChoiceCard, ChoiceGrid } from '@/components/adaptive/ChoiceCard';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import type { SpeechItem, TurnsExercise } from '@/speechpractice/types';
import { Fonts, useTheme } from '@/theme';
import type { PracticeKit } from './kit';
import { useChoiceLayout } from './useChoiceLayout';

type Step = 'app' | 'child' | 'handBack' | 'done';

/**
 * Turn Taking: the app takes a turn, the child says "My turn" and takes theirs, then says
 * "Your turn" to hand it back. Cooperative — no points, nobody wins, nothing is timed.
 * The two buttons are the phrases being practised.
 */
export function TurnsExerciseView({ exercise, kit }: { exercise: TurnsExercise; kit: PracticeKit }) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { game } = exercise;
  const layout = useChoiceLayout(game.options.length);
  const [round, setRound] = useState(0);
  const [step, setStep] = useState<Step>('app');
  const [appPick, setAppPick] = useState<SpeechItem>(() => randomOption());
  const [childPick, setChildPick] = useState<SpeechItem | null>(null);
  const [nudge, setNudge] = useState(false);

  function randomOption(): SpeechItem {
    return game.options[Math.floor(Math.random() * game.options.length)];
  }

  // The app's turn: announce it, show what it got.
  useEffect(() => {
    if (step !== 'app') return;
    kit.speakUi(`${t('spItsMyTurn')} ${t('spIGot', { thing: kit.label(appPick) })}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, round]);

  const childTakes = (pick: SpeechItem) => {
    setChildPick(pick);
    setStep('handBack');
    kit.attempt(game.item.text);
    kit.speakUi(t('spYouGot', { thing: kit.label(pick) }));
  };

  const big = (item: SpeechItem) => (
    <Card color={theme.colors.primarySoft} style={styles.result}>
      <Text style={[styles.resultEmoji, { fontSize: sizes.iconSize + 24, lineHeight: sizes.iconSize + 44 }]} allowFontScaling={false}>{item.picture}</Text>
      <Text style={[styles.resultText, { fontSize: sizes.heading, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{kit.label(item)}</Text>
    </Card>
  );

  const heading = (text: string) => (
    <Text style={[styles.heading, { fontSize: sizes.heading - 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
      {text}
    </Text>
  );

  return (
    <View style={styles.wrap}>
      <Text style={[styles.game, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {game.item.picture} {game.item.text} · {t('spProgress', { n: Math.min(round + 1, game.rounds), total: game.rounds })}
      </Text>

      {step === 'app' ? (
        <>
          {heading(`🤖 ${t('spIGot', { thing: kit.label(appPick) })}`)}
          {big(appPick)}
          {heading(t('spWhoseTurn'))}
          <View style={styles.row}>
            <BigButton
              label={`🙋 ${t('spMyTurn')}`}
              variant={nudge ? 'success' : 'primary'}
              minHeight={96}
              style={styles.half}
              onPress={() => {
                setNudge(false);
                setStep('child');
                kit.attempt(t('spMyTurn'));
                kit.speakUi(t('spMyTurn'));
              }}
            />
            <BigButton
              label={`👉 ${t('spYourTurnButton')}`}
              variant="outline"
              minHeight={96}
              style={styles.half}
              onPress={() => {
                // Gentle: tell them whose turn it is and light up the right button.
                setNudge(true);
                kit.speakUi(t('spItsYourTurn'));
              }}
            />
          </View>
          {nudge ? heading(t('spItsYourTurn')) : null}
        </>
      ) : step === 'child' ? (
        <>
          {heading(t('spItsYourTurn'))}
          {game.style === 'roll' ? (
            <BigButton label={`${game.item.picture} ${game.item.text}`} minHeight={110} onPress={() => childTakes(randomOption())} />
          ) : (
            <ChoiceGrid>
              {game.options.map((o) => (
                <ChoiceCard key={o.id} label={kit.label(o)} emoji={o.picture} pictureMode={layout.pictureMode} width={layout.width} onPress={() => childTakes(o)} />
              ))}
            </ChoiceGrid>
          )}
        </>
      ) : step === 'handBack' && childPick ? (
        <>
          {heading(`🙋 ${t('spYouGot', { thing: kit.label(childPick) })}`)}
          {big(childPick)}
          <BigButton
            label={`👉 ${t('spYourTurnButton')}`}
            minHeight={96}
            onPress={() => {
              kit.attempt(t('spYourTurnButton'));
              kit.speakUi(t('spYourTurnButton'));
              if (round + 1 >= game.rounds) {
                setStep('done');
                kit.finish();
              } else {
                setRound(round + 1);
                setAppPick(randomOption());
                setChildPick(null);
                setStep('app');
              }
            }}
          />
        </>
      ) : (
        <>
          {heading(`⭐ ${t('spAllDone')}`)}
          <BigButton
            label={t('spPlayAgain')}
            icon="replay"
            variant="outline"
            minHeight={72}
            onPress={() => {
              setRound(0);
              setAppPick(randomOption());
              setChildPick(null);
              setStep('app');
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  game: { fontFamily: Fonts.bold, textAlign: 'center' },
  heading: { fontFamily: Fonts.black, textAlign: 'center' },
  result: { alignItems: 'center', gap: SPACING.xs },
  resultEmoji: { textAlign: 'center' },
  resultText: { fontFamily: Fonts.black },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
});
