# TalkEasySchool

Nunito with exactly one glyph changed: lowercase **a** is the single-storey (infant /
school-print) form used when teaching children to read and write. Everything else — uppercase A
included — is Nunito's original outline, so size, stroke weight, rounded terminals and spacing
are unchanged.

The new **a** is built from Nunito's own **d**: the stem's rounded cap is translated down to the
bowl's top (x-height + overshoot) and the glyph is scaled horizontally onto the width of **o**,
so it sits with the other round letters. Two weights are generated, matching the faces the
handwriting screens use: ExtraBold (tracing guide) and Black (the model letter above the canvas).

Used via `Fonts.school` / `Fonts.schoolBlack` in `src/theme/tokens.ts` — only on the
handwriting / tracing surfaces. The rest of the app keeps unmodified Nunito.

Licence: Nunito is SIL OFL 1.1 (see `OFL.txt`). The OFL allows modification but reserves the
name "Nunito", which is why these files are named **TalkEasySchool**.

Regenerate: `scratchpad/fonttool/make-school-font.js` (opentype.js) — it reads the Nunito TTFs
from `node_modules/@expo-google-fonts/nunito` and writes the two files here.
