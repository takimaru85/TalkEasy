import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Icon } from '@/components/common';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { THERAPY_SAFETY_NOTICE } from '@/therapy/content';
import { Fonts, useTheme } from '@/theme';

/**
 * The notice a grown-up reads before the first therapy activity.
 *
 * IT IS A GATE, NOT A BANNER. Nothing in the Therapy section opens until somebody has tapped
 * through it, because the one thing this section must never do is let a family start following
 * movement activities without having been told, plainly, that these are not their therapist's
 * instructions and that their therapist's programme comes first.
 *
 * It is addressed to the grown-up and dressed as a grown-up's screen — plain surface, no adventure
 * styling — so a child flicking through cannot mistake it for part of the game and tap past it out
 * of habit. The acknowledgement is stored with a DATE rather than a flag (see AppSettings), so this
 * can be shown again later if it ever needs to be.
 */
export function SafetyNotice({ onAccept }: { onAccept: () => void }) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.head}>
          <Icon name="shield-heart-outline" size={30} color={c.primary} />
          <Text style={[styles.title, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Before you start
          </Text>
        </View>
        {THERAPY_SAFETY_NOTICE.split('\n\n').map((para) => (
          <Text key={para} style={[styles.body, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {para}
          </Text>
        ))}
      </Card>

      <BigButton label="I understand" icon="check" minHeight={MIN_PARENT_TARGET} onPress={onAccept} />

      <Text style={[styles.foot, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        You can read this again at any time in Parent Mode → Therapy goals.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  title: { fontFamily: Fonts.black, fontSize: 20, flex: 1 },
  body: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 22, marginBottom: SPACING.sm },
  foot: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19 },
});
