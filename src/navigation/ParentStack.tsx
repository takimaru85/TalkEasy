import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/screens/parent/DashboardScreen';
import { ManageButtonsScreen } from '@/screens/parent/ManageButtonsScreen';
import { EditButtonScreen } from '@/screens/parent/EditButtonScreen';
import { ManageFavoritesScreen } from '@/screens/parent/ManageFavoritesScreen';
import { ManageSubjectsScreen } from '@/screens/parent/ManageSubjectsScreen';
import { EditSubjectScreen } from '@/screens/parent/EditSubjectScreen';
import { ManageAssignmentsScreen } from '@/screens/parent/ManageAssignmentsScreen';
import { EditAssignmentScreen } from '@/screens/parent/EditAssignmentScreen';
import { ManageEventsScreen } from '@/screens/parent/ManageEventsScreen';
import { EditEventScreen } from '@/screens/parent/EditEventScreen';
import { ManageLearningScreen } from '@/screens/parent/ManageLearningScreen';
import { ManageRoutineScreen } from '@/screens/parent/ManageRoutineScreen';
import { ManageTherapyScreen } from '@/screens/parent/ManageTherapyScreen';
import { EditTherapyScreen } from '@/screens/parent/EditTherapyScreen';
import { CareNotesScreen } from '@/screens/parent/CareNotesScreen';
import { EditNoteScreen } from '@/screens/parent/EditNoteScreen';
import { ProgressScreen } from '@/screens/parent/ProgressScreen';
import { SettingsScreen } from '@/screens/parent/SettingsScreen';
import type { ParentStackParamList } from './types';

const Stack = createNativeStackNavigator<ParentStackParamList>();

/** Parent Mode. Screens draw their own large headers, so native headers are off. */
export function ParentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ManageButtons" component={ManageButtonsScreen} />
      <Stack.Screen name="EditButton" component={EditButtonScreen} />
      <Stack.Screen name="ManageFavorites" component={ManageFavoritesScreen} />
      <Stack.Screen name="ManageSubjects" component={ManageSubjectsScreen} />
      <Stack.Screen name="EditSubject" component={EditSubjectScreen} />
      <Stack.Screen name="ManageAssignments" component={ManageAssignmentsScreen} />
      <Stack.Screen name="EditAssignment" component={EditAssignmentScreen} />
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
      <Stack.Screen name="ManageLearning" component={ManageLearningScreen} />
      <Stack.Screen name="ManageRoutine" component={ManageRoutineScreen} />
      <Stack.Screen name="ManageTherapy" component={ManageTherapyScreen} />
      <Stack.Screen name="EditTherapy" component={EditTherapyScreen} />
      <Stack.Screen name="CareNotes" component={CareNotesScreen} />
      <Stack.Screen name="EditNote" component={EditNoteScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
