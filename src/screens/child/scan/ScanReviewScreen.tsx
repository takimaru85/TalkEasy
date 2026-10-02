import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton, Card, ChildScreen, ChoiceRow, Icon } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useScanAssignment } from '@/hooks/useScanAssignment';
import type { RootScreenProps } from '@/navigation/types';
import { failureMessage } from '@/scan/machine';
import { describeType, parseAssignment } from '@/scan/parser';
import { SCAN_LANGUAGES } from '@/scan/language';
import { speakContent, stopSpeaking } from '@/services/speech';
import { Fonts, Radius, useTheme } from '@/theme';
import { alertMessage } from '@/utils/confirm';

/**
 * Everything after the photo: recognise, review, correct, read aloud, keep.
 *
 * ONE SCREEN DRIVEN BY ONE STATE (see scan/machine.ts). Each `state.kind` renders exactly one thing,
 * which is what stops a spinner appearing on top of an error, or an empty editor appearing as
 * though recognition succeeded.
 *
 * THE TEXT IS ALWAYS EDITABLE, and getting to the editor never requires recognition to have worked.
 * Every failure offers "Type it in myself", because text recognition on a photographed worksheet
 * fails for perfectly ordinary reasons — handwriting, a crease, a shadow — and a parent who cannot
 * get the words in has no feature at all.
 *
 * READ ALOUD goes through `speakContent`, the same language-aware path lessons use, so a Filipino
 * worksheet is read by a Filipino voice where the device has one and a pronunciation-safe fallback
 * where it does not. Nothing here is a second TTS implementation.
 */
export function ScanReviewScreen({ route, navigation }: RootScreenProps<'ScanReview'>) {
  const theme = useTheme();
  const c = theme.colors;
  const { settings } = useSettings();
  const { state, send, capture, save, discard, saving, language, setLanguage } = useScanAssignment();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [keepPhoto, setKeepPhoto] = useState(true);
  /** What the engine read. Kept so an edit never destroys the original (scan/types.ts). */
  const original = useRef('');
  const started = useRef(false);

  // Start the flow the way the previous screen asked. Once only — a re-render must not reopen the
  // camera, which on a real device would be a loop a parent cannot escape.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (route.params.source === 'manual') send({ type: 'enterManually' });
    else void capture(route.params.source);
  }, [route.params.source, capture, send]);

  // Carry recognised text into the editor as soon as there is some.
  useEffect(() => {
    if (state.kind === 'ocrSuccess' || state.kind === 'ocrPartial') {
      original.current = state.text;
      setText(state.text);
      send({ type: 'review' });
    }
    if (state.kind === 'review' && original.current === '' && state.text) {
      original.current = state.text;
      setText(state.text);
    }
  }, [state, send]);

  useEffect(() => () => void stopSpeaking(), []);

  const readAloud = () => {
    const toRead = text.trim();
    if (!toRead) return;
    void speakContent(toRead, language, settings);
  };

  const keep = async () => {
    if (!text.trim()) return alertMessage('Nothing to save', 'Add some text first, or take another photo.');
    const id = await save({ title, text, originalText: original.current || text, keepPhoto });
    if (id) {
      // Straight to the assignment it became, so it is obvious where it went.
      navigation.replace('AssignmentDetail', { assignmentId: id });
    }
  };

  const parsed = parseAssignment(text);

  return (
    <ChildScreen title="Review Assignment" subtitle="Check it, fix it, then keep it" emoji="scan-assignment" back>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {state.kind === 'photoCaptured' ? (
          <>
            <PhotoPreview uri={state.imageUri} />
            <BigButton label="Use this photo" icon="check" minHeight={MIN_CHILD_TARGET} onPress={() => send({ type: 'usePhoto' })} />
            <BigButton
              label="Retake"
              icon="camera-retake-outline"
              variant="secondary"
              minHeight={MIN_CHILD_TARGET}
              onPress={() => { send({ type: 'retake' }); void capture('camera'); }}
            />
          </>
        ) : null}

        {state.kind === 'processing' ? (
          <Card>
            <View style={styles.busy}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={[styles.busyTitle, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Reading your assignment…
              </Text>
              <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                This may take a moment.
              </Text>
            </View>
          </Card>
        ) : null}

        {state.kind === 'ocrFailed' ? (
          <>
            <Card>
              <View style={styles.row}>
                <Icon name="alert-circle-outline" size={24} color={c.danger} />
                <View style={styles.flex}>
                  <Text style={[styles.busyTitle, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {failureMessage(state.reason).title}
                  </Text>
                  <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {failureMessage(state.reason).body}
                  </Text>
                </View>
              </View>
            </Card>
            <BigButton
              label="Retake Photo"
              icon="camera"
              minHeight={MIN_CHILD_TARGET}
              onPress={() => { send({ type: 'retake' }); void capture('camera'); }}
            />
            <BigButton
              label="Type it in myself"
              icon="pencil-outline"
              variant="secondary"
              minHeight={MIN_CHILD_TARGET}
              onPress={() => send({ type: 'enterManually' })}
            />
          </>
        ) : null}

        {state.kind === 'review' ? (
          <>
            {state.imageUri && keepPhoto ? <PhotoPreview uri={state.imageUri} small /> : null}

            <Text style={[styles.explain, { color: theme.night ? '#FFFFFF' : c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Check the text before continuing. You can edit anything TalkEasy didn&apos;t read correctly.
            </Text>

            <Card>
              <Text style={[styles.label, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>TITLE</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={parsed.title}
                placeholderTextColor={c.textMuted}
                style={[styles.titleInput, { color: c.text, borderColor: c.borderSoft }]}
                maxLength={80}
              />
            </Card>

            <Card>
              <Text style={[styles.label, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>ASSIGNMENT TEXT</Text>
              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                placeholder="Type the assignment here…"
                placeholderTextColor={c.textMuted}
                style={[styles.editor, { color: c.text, borderColor: c.borderSoft }]}
              />
              <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {describeType(parsed.type)}
                {original.current && text !== original.current ? ' · edited' : ''}
              </Text>
            </Card>

            {/* The language the WORDS are in, which decides the voice — not the app's language. */}
            <ChoiceRow
              label="Read it in"
              value={language}
              onChange={setLanguage}
              choices={SCAN_LANGUAGES.map((l) => ({ value: l.tag, label: l.label }))}
            />

            <BigButton label="Read Aloud" icon="volume-high" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={readAloud} />

            {original.current && text !== original.current ? (
              <BigButton
                label="Back to what was scanned"
                icon="restore"
                variant="outline"
                minHeight={MIN_CHILD_TARGET - 8}
                onPress={() => setText(original.current)}
              />
            ) : null}

            {state.imageUri ? (
              <ChoiceRow
                label="Keep the photo with this assignment"
                value={keepPhoto ? 'yes' : 'no'}
                onChange={(v) => setKeepPhoto(v === 'yes')}
                choices={[{ value: 'yes', label: 'Keep photo' }, { value: 'no', label: "Don't keep" }]}
              />
            ) : null}

            <BigButton
              label={saving ? 'Saving…' : 'Save Assignment'}
              icon="content-save-outline"
              minHeight={MIN_CHILD_TARGET}
              disabled={saving}
              onPress={keep}
            />

            {/* Honest about what the app can and cannot do with the text it has. */}
            <Card>
              <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {parsed.canMakeActivity
                  ? `${describeType(parsed.type)} — once saved, this can be read aloud and practised a line at a time.`
                  : 'TalkEasy will save the assignment text and read it aloud, but it cannot turn this one into an activity yet.'}
              </Text>
              <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                TalkEasy never answers the homework — it reads what is on the page.
              </Text>
            </Card>

            <BigButton
              label="Discard"
              icon="close"
              variant="outline"
              minHeight={MIN_CHILD_TARGET - 8}
              onPress={() => { discard(); navigation.goBack(); }}
            />
          </>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

function PhotoPreview({ uri, small }: { uri: string; small?: boolean }) {
  return (
    <View style={[styles.preview, small && styles.previewSmall]}>
      <Image source={{ uri }} style={styles.previewImage} resizeMode="contain" accessible accessibilityLabel="The photo you took" />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  busy: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  busyTitle: { fontFamily: Fonts.black, fontSize: 17 },
  explain: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8, marginBottom: 6 },
  titleInput: { fontFamily: Fonts.bold, fontSize: 16, borderWidth: 1.5, borderRadius: Radius.md, padding: SPACING.md, minHeight: 52 },
  editor: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 24, borderWidth: 1.5, borderRadius: Radius.md, padding: SPACING.md, minHeight: 200 },
  note: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.sm },
  preview: { height: 260, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.25)' },
  previewSmall: { height: 150 },
  previewImage: { width: '100%', height: '100%' },
});
