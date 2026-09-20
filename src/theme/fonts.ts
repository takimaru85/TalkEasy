import { useFonts } from 'expo-font';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';

/**
 * Loads the five bundled Nunito weights the app uses (importing per weight keeps the other
 * eleven variants out of the bundle). Returns `true` once ready OR if loading failed —
 * the app must never block on a font; React Native falls back to the system font.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  return loaded || !!error;
}
