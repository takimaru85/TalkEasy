import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from './ScreenContainer';
import { ScreenHeader } from './ScreenHeader';
import { useI18n } from '@/i18n';
import { AdventureZone } from '@/theme';
import type { GameIconName } from '@/components/adventure/GameIcon';

interface Props {
  title: string;
  children?: React.ReactNode;
  /** Use a "back" arrow instead of the Home button (for nested child screens). */
  back?: boolean;
  rightIcon?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  emoji?: string;
  emojiTint?: string;
  /** Illustrated game icon beside the title (shown on the night sky; `emoji` elsewhere). */
  art?: GameIconName;
  subtitle?: string;
}

/**
 * Standard child-mode screen: safe area + header whose left button is always "Home"
 * (or a back arrow on nested screens). Same layout on every section so the child always
 * knows where the way back is.
 */
export function ChildScreen({ title, children, back = false, rightIcon, rightLabel, onRightPress, emoji, emojiTint, art, subtitle }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const goHome = () => navigation.navigate('ChildHome');
  const { t } = useI18n();
  return (
    <AdventureZone>
      <ScreenContainer>
      <ScreenHeader
        title={title}
        onBack={back ? () => navigation.goBack() : goHome}
        backIcon={back ? 'arrow-left' : 'home'}
        backLabel={back ? undefined : t('actionHome')}
        rightIcon={rightIcon}
        rightLabel={rightLabel}
        onRightPress={onRightPress}
        emoji={emoji}
        emojiTint={emojiTint}
        art={art}
        subtitle={subtitle}
      />
        {children}
      </ScreenContainer>
    </AdventureZone>
  );
}
