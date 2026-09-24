import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import type { CommunicationButton } from '@/types/models';
import { useI18n } from '@/i18n';
import { CommunicationTile, tileMetrics } from './CommunicationTile';

interface Props {
  buttons: CommunicationButton[];
  selectedId: number | null;
  onPress: (button: CommunicationButton) => void;
  /** Rendered above the tiles inside the scroll area (e.g. a section title). */
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Grid of tiles in fixed positions. Vertical scroll only — no horizontal paging,
 * no gestures. Column count comes from the parent's button-size setting.
 */
export function TileGrid({ buttons, selectedId, onPress, header, footer }: Props) {
  const sizes = useSizes();
  const { tContent } = useI18n();
  // One label size for the whole board — the largest that fits EVERY card — so "Hot" and
  // "Blanket" read as the same size instead of each card shrinking its own word.
  const labelSize = useMemo(() => {
    const { fit } = tileMetrics(sizes, false, undefined);
    return buttons.reduce((min, b) => Math.min(min, fit(tContent(b.label))), sizes.tileLabel);
  }, [buttons, sizes, tContent]);
  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {header}
      <View style={[styles.grid, { gap: sizes.gap }]}>
        {buttons.map((b) => (
          <CommunicationTile key={b.id} button={b} selected={b.id === selectedId} onPress={onPress} labelSize={labelSize} />
        ))}
      </View>
      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
