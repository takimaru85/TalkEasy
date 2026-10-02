import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameIcon, type GameIconName } from '@/components/adventure/GameIcon';
import { WorldArt } from '@/components/adventure/WorldArt';
import type { WorldArtName } from '@/adventure/worlds';
import { useTheme } from '@/theme';

/**
 * Lesson and activity pictures are emoji (offline-safe, AGENTS.md). Where TalkEasy has its own
 * illustration of the same thing, it can be drawn instead — but ONLY when every picture in the set
 * has one (see `illustratedSet`), so one question never mixes two styles side by side.
 */
type Art = { kind: 'game'; name: GameIconName } | { kind: 'world'; name: WorldArtName };

const ART: Record<string, Art> = {
  '🍎': { kind: 'game', name: 'hungry' },
  '💧': { kind: 'game', name: 'water' },
  '🥤': { kind: 'game', name: 'water' },
  '🚽': { kind: 'game', name: 'bathroom' },
  '🧸': { kind: 'game', name: 'teddy' },
  '😊': { kind: 'game', name: 'happy' },
  '🙂': { kind: 'game', name: 'happy' },
  '😢': { kind: 'game', name: 'sad' },
  '😠': { kind: 'game', name: 'angry' },
  '🤕': { kind: 'game', name: 'hurt' },
  '🎒': { kind: 'game', name: 'school' },
  '🎮': { kind: 'game', name: 'controller' },
  '⭐': { kind: 'world', name: 'star' },
  '🌟': { kind: 'world', name: 'star' },
  '🌍': { kind: 'world', name: 'earth' },
  '🌎': { kind: 'world', name: 'earth' },
  '🌏': { kind: 'world', name: 'earth' },
  '🌙': { kind: 'world', name: 'moon' },
  '🪐': { kind: 'world', name: 'saturn' },
  '🚀': { kind: 'world', name: 'rocket' },
  '🥚': { kind: 'world', name: 'egg' },
  '🦴': { kind: 'world', name: 'fossil' },
  '🦕': { kind: 'world', name: 'brontosaurus' },
  '🦖': { kind: 'world', name: 't-rex' },
  '🐶': { kind: 'world', name: 'dog' },
  '🐕': { kind: 'world', name: 'dog' },
  '🐱': { kind: 'world', name: 'cat' },
  '🐈': { kind: 'world', name: 'cat' },
  '🐵': { kind: 'world', name: 'monkey' },
  '🐒': { kind: 'world', name: 'monkey' },
  '🐬': { kind: 'world', name: 'dolphin' },
  '🦁': { kind: 'world', name: 'lion' },
  '🚗': { kind: 'world', name: 'car' },
  '🚙': { kind: 'world', name: 'car' },
  '🚒': { kind: 'world', name: 'fire-truck' },
  '🚜': { kind: 'world', name: 'tractor' },
  '🚂': { kind: 'world', name: 'train' },
};

/** Emoji compare without the invisible "draw as emoji" selector. */
const key = (emoji: string) => emoji.replace(/️/g, '').trim();

/** True when every picture in the set has a TalkEasy illustration. */
export function illustratedSet(pictures: (string | undefined)[]): boolean {
  const present = pictures.filter((p): p is string => !!p);
  return present.length > 0 && present.length === pictures.length && present.every((p) => !!ART[key(p)]);
}

interface Props {
  emoji: string;
  /** Plate size; the picture is drawn at a fixed share of it. */
  size: number;
  /** Draw the TalkEasy illustration (decided per set with `illustratedSet`). */
  illustrated?: boolean;
}

/**
 * One answer picture: always the same plate, the same proportion and the same soft shadow, so a
 * row of pictures reads as one family whatever the emoji font draws.
 */
export function AnswerPicture({ emoji, size, illustrated }: Props) {
  const theme = useTheme();
  const art = illustrated ? ART[key(emoji)] : undefined;
  const plate = theme.night
    ? { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.16)' }
    : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft };
  const glyph = Math.round(size * 0.62);
  return (
    <View style={[styles.plate, plate, { width: size, height: size, borderRadius: Math.round(size * 0.3) }]} accessibilityElementsHidden importantForAccessibility="no">
      {art?.kind === 'game' ? (
        <GameIcon name={art.name} size={Math.round(size * 0.86)} />
      ) : art?.kind === 'world' ? (
        <WorldArt name={art.name} size={Math.round(size * 0.86)} />
      ) : (
        <Text style={[styles.emoji, { fontSize: glyph, lineHeight: Math.round(glyph * 1.22) }]} allowFontScaling={false}>
          {emoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, overflow: 'hidden' },
  emoji: { textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 3 },
});
