import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { useSettings } from '@/context/SettingsContext';
import { AdventureZone, useTheme } from '@/theme';
import { ChildHomeScreen } from '@/screens/child/ChildHomeScreen';
import { CommunicateScreen } from '@/screens/child/CommunicateScreen';
import { FeelingsScreen } from '@/screens/child/FeelingsScreen';
import { SchoolModeScreen } from '@/screens/child/SchoolModeScreen';
import { PlusScreen } from '@/screens/parent/PlusScreen';
import { ScanAssignmentScreen } from '@/screens/child/scan/ScanAssignmentScreen';
import { ScanReviewScreen } from '@/screens/child/scan/ScanReviewScreen';
import { TherapyActivityScreen } from '@/screens/child/therapy/TherapyActivityScreen';
import { TherapyDayScreen } from '@/screens/child/therapy/TherapyDayScreen';
import { TherapyGoalsScreen } from '@/screens/child/therapy/TherapyGoalsScreen';
import { TherapyHomeScreen } from '@/screens/child/therapy/TherapyHomeScreen';
import { TherapyLibraryScreen } from '@/screens/child/therapy/TherapyLibraryScreen';
import { SchoolScreen } from '@/screens/child/SchoolScreen';
import { SubjectDetailScreen } from '@/screens/child/SubjectDetailScreen';
import { AssignmentsScreen } from '@/screens/child/AssignmentsScreen';
import { AssignmentDetailScreen } from '@/screens/child/AssignmentDetailScreen';
import { CalendarScreen } from '@/screens/child/CalendarScreen';
import { LearnScreen } from '@/screens/child/LearnScreen';
import { LearnSubjectScreen } from '@/screens/child/LearnSubjectScreen';
import { LearnActivityScreen } from '@/screens/child/LearnActivityScreen';
import { MyDayScreen } from '@/screens/child/MyDayScreen';
import { ActivitiesScreen } from '@/screens/child/ActivitiesScreen';
import { FavoritesScreen } from '@/screens/child/FavoritesScreen';
import { AdaptiveHomeScreen } from '@/screens/child/adaptive/AdaptiveHomeScreen';
import { AdaptiveSubjectsScreen } from '@/screens/child/adaptive/AdaptiveSubjectsScreen';
import { AdaptiveLessonScreen } from '@/screens/child/adaptive/AdaptiveLessonScreen';
import { WritingPracticeScreen } from '@/screens/child/adaptive/WritingPracticeScreen';
import { WritingCanvasScreen } from '@/screens/child/adaptive/WritingCanvasScreen';
import { SpeakPracticeScreen } from '@/screens/child/adaptive/SpeakPracticeScreen';
import { SoundPracticeScreen } from '@/screens/child/sound/SoundPracticeScreen';
import { SoundPracticeDetailScreen } from '@/screens/child/sound/SoundPracticeDetailScreen';
import { SpeechPracticeScreen } from '@/screens/child/speech/SpeechPracticeScreen';
import { SpacePetScreen } from '@/screens/child/SpacePetScreen';
import { AdventureMapScreen } from '@/screens/child/AdventureMapScreen';
import { MyProgressScreen } from '@/screens/child/MyProgressScreen';
import { AchievementsScreen } from '@/screens/child/AchievementsScreen';
import { RewardsShopScreen } from '@/screens/child/RewardsShopScreen';
import { SpeechActivityScreen } from '@/screens/child/speech/SpeechActivityScreen';
import { SpeechStageScreen } from '@/screens/child/speech/SpeechStageScreen';
import { SoundTargetScreen } from '@/screens/child/speech/SoundTargetScreen';
import { PracticeSessionScreen, VoiceActivityScreen, VoiceAreaScreen, VoiceCommHomeScreen } from '@/screens/child/voice';
import { ChooseAdventureScreen } from '@/screens/child/ChooseAdventureScreen';
import { CollectionScreen } from '@/screens/child/CollectionScreen';
import { ParentPinScreen } from '@/screens/parent/ParentPinScreen';
import { ParentStack } from './ParentStack';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Screens where a finger drags across a drawing canvas. The iOS edge swipe-back would claim a stroke that
 * starts near the left edge and slide the whole screen away, so it is off here; the Back button remains.
 */
const NO_SWIPE_BACK = { gestureEnabled: false, fullScreenGestureEnabled: false } as const;

/**
 * Every child screen lives in the adventure zone — the space-adventure theme — from the navigator
 * down, so a screen's OWN colours (read in its body with useTheme) are the night ones too, not only
 * the shared components it renders. Parent Mode and the PIN screen are outside it on purpose.
 */
const childZone = ({ children }: { children: React.ReactNode }) => <AdventureZone>{children}</AdventureZone>;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    primary: Colors.primary,
    text: Colors.text,
    border: Colors.border,
    card: Colors.background,
  },
};

/**
 * Child mode is a single stack: Home grid + one screen per section. Parent Mode sits behind
 * the PIN modal. No deep linking — the app never opens URLs.
 */
export function RootNavigator() {
  const { settings } = useSettings();
  const t = useTheme();
  const navTheme = { ...theme, colors: { ...theme.colors, background: t.colors.background, primary: t.colors.primary, text: t.colors.text } };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: t.reducedMotion ? 'none' : 'slide_from_right', animationDuration: 220 }}
        initialRouteName={settings.schoolModeAtStart ? 'SchoolMode' : 'ChildHome'}
      >
        <Stack.Group screenLayout={childZone}>
        <Stack.Screen name="ChildHome" component={ChildHomeScreen} />
        <Stack.Screen name="Communicate" component={CommunicateScreen} />
        <Stack.Screen name="Feelings" component={FeelingsScreen} />
        <Stack.Screen name="SchoolMode" component={SchoolModeScreen} />
        <Stack.Screen name="Plus" component={PlusScreen} />
        <Stack.Screen name="ScanAssignment" component={ScanAssignmentScreen} />
        <Stack.Screen name="ScanReview" component={ScanReviewScreen} />
        <Stack.Screen name="TherapyHome" component={TherapyHomeScreen} />
        <Stack.Screen name="TherapyDay" component={TherapyDayScreen} />
        <Stack.Screen name="TherapyLibrary" component={TherapyLibraryScreen} />
        <Stack.Screen name="TherapyActivity" component={TherapyActivityScreen} />
        <Stack.Screen name="TherapyGoals" component={TherapyGoalsScreen} />
        <Stack.Screen name="School" component={SchoolScreen} />
        <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
        <Stack.Screen name="Assignments" component={AssignmentsScreen} />
        <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Learn" component={LearnScreen} />
        <Stack.Screen name="LearnSubject" component={LearnSubjectScreen} />
        <Stack.Screen name="LearnActivity" component={LearnActivityScreen} />
        <Stack.Screen name="MyDay" component={MyDayScreen} />
        <Stack.Screen name="Activities" component={ActivitiesScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="AdaptiveHome" component={AdaptiveHomeScreen} />
        <Stack.Screen name="AdaptiveSubjects" component={AdaptiveSubjectsScreen} />
        <Stack.Screen name="AdaptiveLesson" component={AdaptiveLessonScreen} options={NO_SWIPE_BACK} />
        <Stack.Screen name="WritingPractice" component={WritingPracticeScreen} />
        <Stack.Screen name="WritingCanvas" component={WritingCanvasScreen} options={NO_SWIPE_BACK} />
        <Stack.Screen name="SpeakPractice" component={SpeakPracticeScreen} />
        <Stack.Screen name="SoundPractice" component={SoundPracticeScreen} />
        <Stack.Screen name="SoundPracticeDetail" component={SoundPracticeDetailScreen} />
        <Stack.Screen name="SpeechPractice" component={SpeechPracticeScreen} />
        <Stack.Screen name="MyProgress" component={MyProgressScreen} />
        <Stack.Screen name="AdventureMap" component={AdventureMapScreen} />
        <Stack.Screen name="SpacePet" component={SpacePetScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="RewardsShop" component={RewardsShopScreen} />
        <Stack.Screen name="SpeechActivity" component={SpeechActivityScreen} />
        <Stack.Screen name="SpeechStage" component={SpeechStageScreen} />
        <Stack.Screen name="SoundTarget" component={SoundTargetScreen} />
        <Stack.Screen name="VoiceComm" component={VoiceCommHomeScreen} />
        <Stack.Screen name="VoiceArea" component={VoiceAreaScreen} />
        <Stack.Screen name="VoiceActivity" component={VoiceActivityScreen} />
        <Stack.Screen name="PracticeSession" component={PracticeSessionScreen} />
        <Stack.Screen name="ChooseAdventure" component={ChooseAdventureScreen} />
        <Stack.Screen name="Collection" component={CollectionScreen} />
        </Stack.Group>
        <Stack.Screen
          name="ParentPin"
          component={ParentPinScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Parent" component={ParentStack} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
