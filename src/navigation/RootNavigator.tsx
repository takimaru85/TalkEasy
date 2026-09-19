import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { ParentPinScreen } from '@/screens/parent/ParentPinScreen';
import { ChildTabs } from './ChildTabs';
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
 * Root: the child tabs are the initial route. Parent Mode sits behind a PIN modal.
 * There is no deep-linking configuration — the app never opens URLs.
 */
export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ChildTabs">
        <Stack.Screen name="ChildTabs" component={ChildTabs} />
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
