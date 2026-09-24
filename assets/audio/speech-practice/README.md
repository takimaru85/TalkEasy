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

After adding a file, register it in `src/speechpractice/modelAudio.ts` (Metro needs a literal
`require`). A bundled file overrides a parent's on-device recording of the same item.
