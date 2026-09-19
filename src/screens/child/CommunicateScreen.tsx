import React, { useState } from 'react';
import { ChildScreen, EmptyState } from '@/components/common';
import { CategoryBar, PhraseBanner, TileGrid } from '@/components/communication';
import { useHomeCategories, useVisibleButtons, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';

/**
 * Communication board. Layout (top to bottom, never changes):
 * header, phrase banner, category bar, tile grid.
 */
export function CommunicateScreen(_props: RootScreenProps<'Communicate'>) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const { data: categories } = useHomeCategories();
  const { data: buttons, loading } = useVisibleButtons(categoryId ?? undefined);
  const { lastPhrase, lastButtonId, speakButton, repeat } = useSpeak();

  return (
    <ChildScreen title="Talk">
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} />
      <CategoryBar categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      {!loading && buttons.length === 0 ? (
        <EmptyState icon="message-text" title="No buttons yet" message="A parent can add buttons in Parent Mode." />
      ) : (
        <TileGrid buttons={buttons} selectedId={lastButtonId} onPress={speakButton} />
      )}
    </ChildScreen>
  );
}
