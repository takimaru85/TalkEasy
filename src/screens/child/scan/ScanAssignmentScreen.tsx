import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, ChildScreen, Glyph, Icon } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { isTextRecognitionAvailable } from '@/services/ocr';
import { SCAN_PRIVACY_NOTE } from '@/constants/privacyCopy';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';

/**
 * Scan Assignment — the way in, from School Mode.
 *
 * ONE JOB: get a photo, by camera or from the library, and say what will happen to it. The flow
 * itself lives on the review screen, which is where everything after the photo happens.
 *
 * ON THE CAMERA. This uses the system camera through `pickPhoto` (services/files.ts) rather than a
 * custom in-app camera. That is a deliberate trade: the system camera already has a preview, a
 * retake, a flash and a focus tap that work on every device, already handles every permission state,
 * and already copies the result into app-private storage — where a custom camera screen would mean
 * a new dependency, a new permission to maintain, and a worse camera. The framing advice that would
 * have been an overlay is given here instead, where a parent reads it BEFORE taking the shot.
 */
export function ScanAssignmentScreen({ navigation }: RootScreenProps<'ScanAssignment'>) {
  const theme = useTheme();
  const c = theme.colors;
  const canRecognise = isTextRecognitionAvailable();

  return (
    <ChildScreen title="Scan Assignment" subtitle="Turn a worksheet into words" emoji="scan-assignment" back>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.art}>
          <Glyph value="scan-assignment" size={104} />
        </View>

        <Text style={[styles.lead, { color: theme.night ? '#FFFFFF' : c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Take a photo of your child&apos;s assignment and TalkEasy will turn it into text you can
          read, edit and have read aloud.
        </Text>

        <Card>
          <Text style={[styles.tipHead, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            FOR THE BEST READING
          </Text>
          {[
            'Keep the page flat and fill the frame.',
            'Good light helps — avoid shadows and glare.',
            'Printed text reads far better than handwriting.',
          ].map((tip) => (
            <View key={tip} style={styles.tip}>
              <Icon name="check" size={18} color={c.success} />
              <Text style={[styles.tipText, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {tip}
              </Text>
            </View>
          ))}
        </Card>

        <BigButton
          label="Take Photo"
          icon="camera"
          minHeight={MIN_CHILD_TARGET}
          onPress={() => navigation.navigate('ScanReview', { source: 'camera' })}
        />
        <BigButton
          label="Choose from Photos"
          icon="image-multiple-outline"
          variant="secondary"
          minHeight={MIN_CHILD_TARGET}
          onPress={() => navigation.navigate('ScanReview', { source: 'library' })}
        />
        {/* Always offered, not just after a failure: some worksheets will never read well, and a
            parent who already knows that should not have to photograph one to find out. */}
        <BigButton
          label="Type it in instead"
          icon="pencil-outline"
          variant="outline"
          minHeight={MIN_CHILD_TARGET}
          onPress={() => navigation.navigate('ScanReview', { source: 'manual' })}
        />

        {canRecognise ? null : (
          <Card>
            <View style={styles.tip}>
              <Icon name="information-outline" size={20} color={c.textMuted} />
              <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Reading text from a photo is not available in this release. You can still type an assignment
                in, and everything else works the same.
              </Text>
            </View>
          </Card>
        )}

        <Text style={[styles.privacy, { color: theme.night ? 'rgba(255,255,255,0.7)' : c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {SCAN_PRIVACY_NOTE}
        </Text>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  art: { alignItems: 'center', paddingVertical: SPACING.sm },
  lead: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 22 },
  tipHead: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8, marginBottom: SPACING.sm },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: 6 },
  tipText: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 20, flex: 1 },
  note: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, flex: 1 },
  privacy: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 18, marginTop: SPACING.sm },
});
