import { useFonts } from 'expo-font';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';

/**
 * Loads the five Nunito weights the app uses (importing per weight keeps the other eleven
 * variants out of the bundle) plus the two TalkEasySchool faces used on the handwriting
 * surfaces. Returns `true` once ready OR if loading failed — the app must never block on a
 * font; React Native falls back to the system font.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    // Nunito with a single-storey lowercase "a" for handwriting practice (see assets/fonts).
    TalkEasySchool_ExtraBold: require('../../assets/fonts/TalkEasySchool-ExtraBold.ttf'),
    TalkEasySchool_Black: require('../../assets/fonts/TalkEasySchool-Black.ttf'),
  });
  return loaded || !!error;
}
