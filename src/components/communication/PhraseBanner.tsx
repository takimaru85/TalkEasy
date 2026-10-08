import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, shade, useTheme } from '@/theme';
import { Icon } from '@/components/common/Icon';
import { IconTile } from '@/components/common/IconTile';
import { useI18n } from '@/i18n';

interface Props {
  phrase: string | null;
  onRepeat: () => void;
  placeholder?: string;
  /** Sentence starter waiting for its ending ("I want …"). Shown with a blinking-free cue. */
  pending?: string | null;
  onClear?: () => void;
}

/**
 * Fixed area at the top of every communication screen. Shows the last phrase in very large
 * text with a big "Again" button. When a starter like "I want..." is active it shows
 * "I want ___" so the child knows the next tap completes the sentence.
 */
export function PhraseBanner({ phrase, onRepeat, placeholder, pending, onClear }: Props) {
  const { t } = useI18n();
  const sizes = useSizes();
  const theme = useTheme();
  const hasPhrase = !!phrase;
  const text = pending ? `${pending.replace(/\.\.\.$/, '').trim()} ___` : (phrase ?? placeholder ?? t('talkPlaceholder'));
  const active = hasPhrase || !!pending;

  return (
    <View
      style={[
        styles.banner,
        theme.shadow,
        {
          backgroundColor: theme.night && !theme.highContrast ? 'rgba(14,20,86,0.92)' : theme.colors.surface,
          borderColor: theme.night && !theme.highContrast ? (active ? '#7CF0FF' : '#4D6BFF') : active ? theme.colors.primary : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
          borderWidth: theme.night && !theme.highContrast ? 3 : active ? 2.5 : theme.highContrast ? theme.borderWidth : 1,
          borderRadius: theme.night && !theme.highContrast ? 34 : Radius.lg,
        },
      ]}
    >
      {/* A speaker cue: this is where TalkEasy speaks. */}
      <IconTile name={active ? 'volume-high' : 'message-processing-outline'} size={52} tint={theme.colors.primarySoft} muted={!active} />
      <View style={styles.textCol}>
        <Text
          style={[
            styles.phrase,
            { fontSize: active ? sizes.phrase : sizes.body + 2, color: active ? theme.colors.text : theme.colors.textMuted },
            !active && styles.placeholder,
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={3}
          adjustsFontSizeToFit
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
        >
          {text}
        </Text>
        {pending ? (
          <Text style={[styles.hint, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('talkPending')}
          </Text>
        ) : null}
      </View>

      {pending && onClear ? (
        <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel={t('actionCancel')} hitSlop={6} style={[styles.side, { backgroundColor: theme.night ? theme.colors.surfaceAlt : theme.colors.surface, borderColor: theme.colors.borderSoft }, theme.night && { borderBottomWidth: 5, borderBottomColor: shade(theme.colors.surfaceAlt, 0.6) }]}>
          <Icon name="close" size={30} color={theme.colors.text} />
          <Text style={[styles.sideLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>{t('actionCancel')}</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onRepeat}
          disabled={!hasPhrase}
          accessibilityRole="button"
          accessibilityLabel={t('actionAgain')}
          accessibilityState={{ disabled: !hasPhrase }}
          hitSlop={6}
          style={({ pressed }) => [
            styles.side,
            { backgroundColor: hasPhrase ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: hasPhrase ? theme.colors.primaryDark : 'transparent' },
            // On the night sky: a solid game button with a darker base.
            theme.night && { borderColor: shade(hasPhrase ? theme.colors.primary : theme.colors.surfaceAlt, 1.4), borderBottomWidth: 5, borderBottomColor: shade(hasPhrase ? theme.colors.primary : theme.colors.surfaceAlt, 0.62) },
            theme.night && !theme.highContrast && { borderRadius: 999, backgroundColor: hasPhrase ? '#2F5BFF' : 'rgba(120,130,190,0.35)', borderColor: hasPhrase ? '#9FB6FF' : 'rgba(255,255,255,0.25)', borderWidth: 2.5, borderBottomWidth: 2.5 },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="replay" size={32} color={hasPhrase ? '#FFFFFF' : theme.colors.textMuted} />
          <Text style={[styles.sideLabel, { color: hasPhrase ? '#FFFFFF' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {t('actionAgain')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    paddingLeft: SPACING.md,
    minHeight: 104,
    borderRadius: Radius.lg,
  },
  textCol: { flex: 1, gap: 2 },
  phrase: { fontFamily: Fonts.black },
  placeholder: { fontFamily: Fonts.semibold },
  hint: { fontFamily: Fonts.bold, fontSize: 15 },
  // The one thing to tap in this bar. A rounded square, matching the cards, so the label has
  // square corners to sit in rather than being clipped against a circle.
  side: {
    width: MIN_CHILD_TARGET + 16,
    height: MIN_CHILD_TARGET + 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  sideLabel: { fontFamily: Fonts.bold, fontSize: 13, marginTop: -2 },
  pressed: { opacity: 0.85 },
});
