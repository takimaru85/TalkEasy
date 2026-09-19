import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { useSettings } from '@/context/SettingsContext';
import { ChildHomeScreen } from '@/screens/child/ChildHomeScreen';
import { CommunicateScreen } from '@/screens/child/CommunicateScreen';
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
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={settings.schoolModeAtStart ? 'SchoolMode' : 'ChildHome'}
      >
        <Stack.Screen name="ChildHome" component={ChildHomeScreen} />
        <Stack.Screen name="Communicate" component={CommunicateScreen} />
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
