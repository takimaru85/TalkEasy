import React from 'react';
import { ScreenContainer, ScreenHeader, EmptyState } from '@/components/common';
import { PhraseBanner, TileGrid } from '@/components/communication';
import { useCategoryByKey, useVisibleButtons, useSpeak } from '@/hooks';
import type { ChildTabScreenProps } from '@/navigation/types';

/** Feelings board — the tiles in the "feelings" category. */
export function FeelingsScreen({ navigation }: ChildTabScreenProps<'Feelings'>) {
  const { data: category } = useCategoryByKey('feelings');
  const { data: buttons, loading } = useVisibleButtons(category?.id);
  const { lastPhrase, lastButtonId, speakButton, repeat } = useSpeak();

  // Until the category id is known, show nothing rather than "All".
  const visible = category ? buttons : [];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="How do I feel?"
        rightIcon="lock"
        rightLabel="Parent"
        onRightPress={() => navigation.navigate('ParentPin')}
      />
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} placeholder="Tap how you feel" />
      {!loading && category && visible.length === 0 ? (
        <EmptyState icon="emoticon-happy" title="No feelings yet" message="A parent can add feelings in Parent Mode." />
      ) : (
        <TileGrid buttons={visible} selectedId={lastButtonId} onPress={speakButton} />
      )}
    </ScreenContainer>
  );
}
