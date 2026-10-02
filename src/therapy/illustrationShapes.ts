/**
 * The shape (width / height) of each therapy picture that is NOT square.
 *
 * Pure data, no `require()`, so `check:therapy` can import it under Node and compare it with the real
 * files. Anything not listed is square, which is what almost every picture is.
 *
 * WHY A TABLE AND NOT ASKING THE IMAGE. Reading a picture's size at run time means
 * `Image.resolveAssetSource` or `Image.getSize`: the first does not exist in react-native-web (it
 * crashed every therapy screen on web — and TypeScript could not see it, because the type exists for
 * native), and the second is asynchronous, so the screen would lay out square and then jump. A number
 * written down here is available on the first frame on every platform, and the check fails if it
 * ever disagrees with the file it describes.
 */
export const ILLUSTRATION_SHAPES: Record<string, number> = {
  // A landscape strip of four panels, 1536 x 1024.
  'self-care': 1536 / 1024,
};

/** Width / height for a picture key; square unless the table says otherwise. */
export function illustrationRatio(key: string | undefined): number {
  return (key && ILLUSTRATION_SHAPES[key]) || 1;
}
