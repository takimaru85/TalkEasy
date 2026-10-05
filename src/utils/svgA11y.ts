import { Platform } from 'react-native';

/**
 * Spread onto a decorative `<Svg>`: hides it from screen readers on Android and iOS. react-native-svg on
 * the web copies unknown props onto the DOM, where `accessible={false}` is logged as an invalid attribute,
 * so on the web nothing is passed (the drawing is a plain <svg> there and the control that holds it is named).
 */
export const SVG_DECORATIVE: { accessible?: boolean } = Platform.OS === 'web' ? {} : { accessible: false };
