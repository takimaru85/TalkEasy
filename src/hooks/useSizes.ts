import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { BUTTON_SIZE_PRESETS, SPACING, TEXT_SIZE_PRESETS } from '@/constants/sizes';

/**
 * Converts the parent's "button size" and "text size" settings into concrete numbers.
 * Every child-facing component reads from this so the whole UI scales together.
 */
export function useSizes() {
  const { settings } = useSettings();
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const button = BUTTON_SIZE_PRESETS[settings.buttonSize];
    const text = TEXT_SIZE_PRESETS[settings.textSize];

    // Wider screens (tablets, landscape) get extra columns so tiles do not become absurdly wide.
    const isTablet = Math.min(width, height) >= 600;
    const isWide = width >= 700;
    const extra = width >= 1000 ? 2 : width >= 700 ? 1 : 0;
    const columns = button.columns + extra;
    const gap = SPACING.md;
    const horizontalPadding = SPACING.lg;
    const tileWidth = Math.floor((width - horizontalPadding * 2 - gap * (columns - 1)) / columns);

    return {
      isTablet,
      isWide,
      /** Columns for section/subject grids (2 on phones, 4 on wide screens). */
      gridColumns: width >= 1000 ? 4 : width >= 700 ? 3 : 2,
      columns,
      gap,
      horizontalPadding,
      tileWidth,
      tileHeight: button.tileHeight,
      iconSize: button.iconSize,
      tileLabel: text.tileLabel,
      phrase: text.phrase,
      body: text.body,
      heading: text.heading,
      buttonLabel: text.buttonLabel,
    };
  }, [settings.buttonSize, settings.textSize, width, height]);
}

export type Sizes = ReturnType<typeof useSizes>;
