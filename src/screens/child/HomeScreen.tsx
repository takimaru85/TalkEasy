import React, { useState } from 'react';
import { ScreenContainer, ScreenHeader, EmptyState } from '@/components/common';
import { CategoryBar, PhraseBanner, TileGrid } from '@/components/communication';
import { useHomeCategories, useVisibleButtons, useSpeak } from '@/hooks';
import type { ChildTabScreenProps } from '@/navigation/types';

/**
 * Talk screen — the main communication board.
 * Layout (top to bottom, never changes): header, phrase banner, category bar, tile grid.
 */
export function HomeScreen({ navigation }: ChildTabScreenProps<'Talk'>) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const { data: categories } = useHomeCategories();
  const { data: buttons, loading } = useVisibleButtons(categoryId ?? undefined);
  const { lastPhrase, lastButtonId, speakButton, repeat } = useSpeak();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Talk"
        rightIcon="lock"
        rightLabel="Parent"
        onRightPress={() => navigation.navigate('ParentPin')}
      />
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} />
      <CategoryBar categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      {!loading && buttons.length === 0 ? (
        <EmptyState icon="message-text" title="No buttons yet" message="A parent can add buttons in Parent Mode." />
      ) : (
        <TileGrid buttons={buttons} selectedId={lastButtonId} onPress={speakButton} />
      )}
    </ScreenContainer>
  );
}
