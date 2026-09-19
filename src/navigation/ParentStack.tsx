import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParentHomeScreen } from '@/screens/parent/ParentHomeScreen';
import { ManageButtonsScreen } from '@/screens/parent/ManageButtonsScreen';
import { EditButtonScreen } from '@/screens/parent/EditButtonScreen';
import { ManageFavoritesScreen } from '@/screens/parent/ManageFavoritesScreen';
import { ManageRoutineScreen } from '@/screens/parent/ManageRoutineScreen';
import { ManageExercisesScreen } from '@/screens/parent/ManageExercisesScreen';
import { EditExerciseScreen } from '@/screens/parent/EditExerciseScreen';
import { CareNotesScreen } from '@/screens/parent/CareNotesScreen';
import { EditNoteScreen } from '@/screens/parent/EditNoteScreen';
import { SettingsScreen } from '@/screens/parent/SettingsScreen';
import type { ParentStackParamList } from './types';

const Stack = createNativeStackNavigator<ParentStackParamList>();

/** Parent Mode. Screens draw their own large headers, so native headers are off. */
export function ParentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
      <Stack.Screen name="ManageButtons" component={ManageButtonsScreen} />
      <Stack.Screen name="EditButton" component={EditButtonScreen} />
      <Stack.Screen name="ManageFavorites" component={ManageFavoritesScreen} />
      <Stack.Screen name="ManageRoutine" component={ManageRoutineScreen} />
      <Stack.Screen name="ManageExercises" component={ManageExercisesScreen} />
      <Stack.Screen name="EditExercise" component={EditExerciseScreen} />
      <Stack.Screen name="CareNotes" component={CareNotesScreen} />
      <Stack.Screen name="EditNote" component={EditNoteScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
