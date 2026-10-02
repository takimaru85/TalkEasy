import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ChildScreen } from '@/components/common';
import type { ColorArtName } from '@/components/adventure/ColorArt';
import { SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import type { GameIconName } from './GameIcon';
import { GalaxyFooter } from './GalaxyFooter';

interface Props {
  title: string;
  subtitle?: string;
  /** The illustration beside the title: this section's own drawing. */
  colorArt?: ColorArtName;
  art?: GameIconName;
  emoji?: string;
  emojiTint?: string;
  /** A back arrow (a nested screen) rather than the Home button. The navigation hierarchy is the caller's. */
  back?: boolean;
  children: React.ReactNode;
}

/**
 * The frame every Speech Practice screen shares: the child header, the galaxy backdrop and a scrolling
 * body with the standard padding and gap.
 *
 * It exists so five stages, a target and the main screen cannot drift apart: the header is the shared
 * `ChildScreen` header, the moon and clouds are always behind the content (first in the tree, so
 * the content paints over them — on web positioned elements paint in tree order), and the scroll
 * spacing is one number, not a guess per screen. It does NOT decide where Back goes: `back` only picks
 * the arrow, and the navigation each screen already had is untouched.
 */
export function SpeechPracticeLayout({ title, subtitle, colorArt, art, emoji, emojiTint, back, children }: Props) {
  const sizes = useSizes();
  return (
    <ChildScreen title={title} subtitle={subtitle} colorArt={colorArt} art={art} emoji={emoji} emojiTint={emojiTint} back={back}>
      <View style={styles.flex}>
        <GalaxyFooter />
        <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          {children}
        </ScrollView>
      </View>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl * 2 },
});
