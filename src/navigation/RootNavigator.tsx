import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/theme';
import { ChildHomeScreen } from '@/screens/child/ChildHomeScreen';
import { CommunicateScreen } from '@/screens/child/CommunicateScreen';
import { FeelingsScreen } from '@/screens/child/FeelingsScreen';
import { SchoolModeScreen } from '@/screens/child/SchoolModeScreen';
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
import { ParentPinScreen } from '@/screens/parent/ParentPinScreen';
import { ParentStack } from './ParentStack';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        <Stack.Screen name="ChildHome" component={ChildHomeScreen} />
        <Stack.Screen name="Communicate" component={CommunicateScreen} />
        <Stack.Screen name="Feelings" component={FeelingsScreen} />
        <Stack.Screen name="SchoolMode" component={SchoolModeScreen} />
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
        <Stack.Screen name="AdaptiveLesson" component={AdaptiveLessonScreen} />
        <Stack.Screen name="WritingPractice" component={WritingPracticeScreen} />
        <Stack.Screen name="WritingCanvas" component={WritingCanvasScreen} />
        <Stack.Screen name="SpeakPractice" component={SpeakPracticeScreen} />
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
