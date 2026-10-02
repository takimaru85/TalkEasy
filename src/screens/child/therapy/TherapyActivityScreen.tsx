import React, { useState } from 'react';
import { ColorArt, type ColorArtName } from '@/components/adventure/ColorArt';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BigButton, Card, ChildScreen, Glyph, Icon } from '@/components/common';
import { Celebration } from '@/components/common/Celebration';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useRecordTherapyPractice, useTherapyDoneToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { therapyIllustration } from '@/components/therapy/illustrations';
import { TherapyTimer } from '@/components/therapy/TherapyTimer';
import { therapyActivity } from '@/therapy/content';
import { illustrationRatio } from '@/therapy/illustrationShapes';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * One therapy activity: what to do, what it is for, how to help, and what to watch for.
 *
 * ORDER MATTERS HERE. For an activity marked `therapistLedOnly` the deferral comes FIRST, before
 * anything that could be read as an instruction — because a parent skimming a screen takes the top
 * line as the instruction, and for stretching the only correct instruction is "as your therapist
 * showed you".
 *
 * The safety note is never collapsed, never behind a tap, and never below the button. A note a
 * parent has to go looking for is a note that did not get read.
 *
 * "Done" records that practice happened and nothing else — no measurement, no rating, no "how did
 * it go?". There is nothing here for a family to score themselves against.
 */
export function TherapyActivityScreen({ route, navigation }: RootScreenProps<'TherapyActivity'>) {
  const theme = useTheme();
  const c = theme.colors;
  const activity = therapyActivity(route.params.activityId);
  const record = useRecordTherapyPractice();
  const { data: doneToday } = useTherapyDoneToday();
  const [burst, setBurst] = useState(0);

  if (!activity) {
    return <ChildScreen title="Therapy" emoji="🤸" back />;
  }

  const alreadyDone = doneToday.includes(activity.id);
  const illustration = therapyIllustration(activity.illustration);
  // Sized EXPLICITLY rather than with aspectRatio: react-native-web did not constrain the height
  // from `aspectRatio`, so the picture rendered at its full 1254px and pushed the whole screen
  // down. A square derived from the floored window width behaves the same on web and on a phone.
  const { width: windowWidth } = useWindowDimensions();
  const artSize = Math.max(MIN_SUPPORTED_WIDTH, windowWidth) - SPACING.lg * 2;
  // Most pictures are square, but not all (Self-Care is landscape). Boxing a wide picture in a
  // square would leave empty bands above and below it, so the height follows the picture's own
  // shape, from `ILLUSTRATION_SHAPES`. Still EXPLICIT — a width and a height, never aspectRatio,
  // which react-native-web ignores. NOT read from the image itself: `Image.resolveAssetSource` does
  // not exist in react-native-web and crashed this screen on web (see illustrationShapes.ts).
  const artHeight = Math.round(artSize / illustrationRatio(activity.illustration));

  const complete = () => {
    // No duration is recorded: with the Start button gone nothing marks when practice began, and a
    // time measured from opening the screen would claim a length of practice that never happened.
    // The session still counts, which is all this section ever reports.
    record(activity.id, activity.group, 0);
    setBurst((b) => b + 1);
    setTimeout(() => navigation.goBack(), 1200);
  };

  return (
    <ChildScreen title={activity.name} emoji="🤸" subtitle={activity.goal} back>
      <Celebration trigger={burst} />
      <ScrollView contentContainerStyle={styles.content}>
{/*
          ORDER MATTERS, AND IT DEPENDS ON THE ACTIVITY.
          For an ordinary activity the picture leads: it shows the movement, which an icon cannot.
          For a THERAPIST-LED one the deferral leads and the picture follows, because a parent
          skimming a screen takes the top thing as the instruction — and for stretching the only
          correct instruction is "as your therapist showed you". A picture of six stretches placed
          above that sentence would quietly become the instruction instead of it.
          Either way the written steps stay: words baked into an image cannot be read aloud, do not
          grow with the OS font size and are invisible to a screen reader.
        */}
        {illustration && !activity.therapistLedOnly ? (
          <Image
            source={illustration}
            style={[styles.illustration, { width: artSize, height: artHeight }]}
            resizeMode="contain"
            accessible
            accessibilityLabel={`${activity.name}: ${activity.whatToDo}`}
          />
        ) : null}
        {!illustration ? (
          <View style={styles.art}>
            <ColorArt name={`therapy:${activity.id}` as ColorArtName} size={96} />
          </View>
        ) : null}

        {/*
          The practice timer sits directly under the picture. NOT on a therapist-led activity: there
          the deferral must be the first thing read, and a countdown beside a stretching picture could
          be taken for a hold time, which is the therapist's to set. It records nothing and completes
          nothing; "Done for today" below stays the only thing that records practice. Keyed by activity
          so each one starts from its own suggested length.
        */}
        {!activity.therapistLedOnly ? <TherapyTimer key={activity.id} defaultMinutes={activity.suggestedMinutes} /> : null}

        {/*
          An ordinary activity has NO "WHAT TO DO" card any more (removed by request): the picture,
          the goal in the header and "WHAT IT HELPS WITH" carry it, and `whatToDo` is still in the
          data and in the picture's accessibility label.

          The THERAPIST-LED card below is a different thing and stays: it has no "WHAT TO DO"
          heading, it is the deferral to the child's therapist, and for stretching it is the only
          correct instruction. For that activity it is safety guidance, and it comes first.
        */}
        {activity.therapistLedOnly ? (
          <Card color={c.primarySoft}>
            <View style={styles.row}>
              <Icon name="account-heart-outline" size={24} color={c.primary} />
              <Text style={[styles.lead, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {activity.whatToDo}
              </Text>
            </View>
          </Card>
        ) : null}

        {/*
          A therapist-led activity's picture, AFTER the deferral, and captioned so it cannot be
          mistaken for a set of instructions the app is giving.
        */}
        {illustration && activity.therapistLedOnly ? (
          <>
            <Image
              source={illustration}
              style={[styles.illustration, { width: artSize, height: artHeight }]}
              resizeMode="contain"
              accessible
              accessibilityLabel={`Examples of stretches. ${activity.whatToDo}`}
            />
            <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Examples only, to help you recognise what you were shown. Do only the stretches your
              child&apos;s therapist has given you, the way they showed you — not the ones in this picture.
            </Text>
          </>
        ) : null}

        <Card>
          <Text style={[styles.label, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>WHAT IT HELPS WITH</Text>
          <Text style={[styles.body, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{activity.goal}</Text>
          <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Usually about {activity.suggestedMinutes} minutes — stop sooner if your child has had enough.
          </Text>
        </Card>

        <Card>
          <Text style={[styles.label, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>A TIP FOR GROWN-UPS</Text>
          <Text style={[styles.body, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{activity.parentGuidance}</Text>
        </Card>

        {/* Always visible, always above the button. */}
        <Card>
          <View style={styles.row}>
            <Icon name="shield-alert-outline" size={22} color={c.danger} />
            <Text style={[styles.safety, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {activity.safetyNote}
            </Text>
          </View>
          <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Stop if your child has pain, dizziness, difficulty breathing or unusual distress.
          </Text>
        </Card>

        {/*
          The practice TIMER is the only thing that starts, pauses or resets a countdown; there is no
          Start button down here any more. This is the one control that RECORDS practice, and it is
          always available: it used to appear only after Start was pressed, so with Start removed it
          would have been unreachable and nothing could ever be marked practised.
        */}
        <BigButton label="Done for today" icon="check-bold" variant="success" minHeight={MIN_CHILD_TARGET} onPress={complete} />
        {alreadyDone ? (
          <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Practised today. Another go is always fine.
          </Text>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  art: { alignItems: 'center', paddingVertical: SPACING.sm },
  // Square source, so a square box with contain shows it whole on any width without cropping a
  // step out of the sequence.
  illustration: { borderRadius: Radius.lg, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  label: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8, marginBottom: 4 },
  body: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 22 },
  lead: { fontFamily: Fonts.extrabold, fontSize: 15, lineHeight: 22, flex: 1 },
  safety: { fontFamily: Fonts.extrabold, fontSize: 14, lineHeight: 20, flex: 1 },
  meta: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.sm },
});
