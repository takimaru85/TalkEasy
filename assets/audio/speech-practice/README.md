# Speech Practice model recordings

Every practice model the child hears should be a real recording of the **intended**
pronunciation, not a text-to-speech guess. This folder holds the bundled recordings.

```
speech-practice/
  en/   fil/   ceb/            one folder per pronunciation set
    sounds/     b.m4a          isolated sounds       (key sound:b)
    syllables/  ba.m4a         BA BE BI BO BU …      (key syllable:ba)
    words/      v-ball.m4a     vocabulary words      (key word:v-ball)
    phrases/    ph-water.m4a   phrases               (key phrase:ph-water)
```

The intended pronunciation of each syllable (IPA and a "sounds like" guide per set) is in
`src/speechpractice/pronunciation.ts`, and Parent Mode → Speech Practice → Model recordings
shows it next to each item.

Recording guidelines:

- One clear, natural repetition at a normal pace; a syllable is ONE sound ("ba"), never the
  letter names ("bee-ay").
- Trim leading/trailing silence; mono is fine; `.m4a` (AAC) or `.mp3`, around 64–128 kbps.
- Same speaker and same room for a whole set, so every model sounds consistent.
- Ideally recorded or reviewed by a speech-language pathologist.

## Isolated sounds (phonemes)

`sounds/<id>.m4a` is the ISOLATED PHONEME — for G, /ɡ/ alone, as at the start of "goat": not the
letter name "gee", and no vowel after it ("guh" is /ɡə/). For a stop (b d g k p t) that is one
short release with no voicing after it; for a continuant (m n s f) about half a second, held
steadily; for a vowel (a = /æ/ as in apple) the vowel alone. The target of each sound (phoneme,
example word, IPA) is in `src/soundpractice/content.ts`; Parent Mode → Pronunciation test →
Sounds shows which ones are still missing. Phonemes live in `en/` only. Register as
`'sound:g': require('../../assets/audio/speech-practice/en/sounds/g.m4a')` under `en`.

Until a sound has its recording, "Play sound" plays the example word instead (a development
fallback, flagged on screen for grown-ups) — never a voice-engine attempt at the sound.

After adding a file, register it in `src/speechpractice/modelAudio.ts` (Metro needs a literal
`require`). A bundled file overrides a parent's on-device recording of the same item.
