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
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const button = BUTTON_SIZE_PRESETS[settings.buttonSize];
    const text = TEXT_SIZE_PRESETS[settings.textSize];

    // Tablets get one extra column so tiles do not become absurdly wide.
    const columns = width >= 700 ? button.columns + 1 : button.columns;
    const gap = SPACING.md;
    const horizontalPadding = SPACING.lg;
    const tileWidth = Math.floor((width - horizontalPadding * 2 - gap * (columns - 1)) / columns);

    return {
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
  }, [settings.buttonSize, settings.textSize, width]);
}

export type Sizes = ReturnType<typeof useSizes>;
