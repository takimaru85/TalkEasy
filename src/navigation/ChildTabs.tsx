import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/common/Icon';
import { HomeScreen } from '@/screens/child/HomeScreen';
import { FeelingsScreen } from '@/screens/child/FeelingsScreen';
import { FavoritesScreen } from '@/screens/child/FavoritesScreen';
import { RoutineScreen } from '@/screens/child/RoutineScreen';
import { ActivitiesScreen } from '@/screens/child/ActivitiesScreen';
import type { ChildTabParamList } from './types';

const Tab = createBottomTabNavigator<ChildTabParamList>();

const TAB_ICONS: Record<keyof ChildTabParamList, string> = {
  Talk: 'message-text',
  Feelings: 'emoticon-happy',
  Favorites: 'star',
  Routine: 'calendar-check',
  Activities: 'dumbbell',
};

/**
 * Child mode. Five large tabs in fixed positions; the tab bar is taller than the
 * platform default so each tab is an easy target.
 */
export function ChildTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarActiveBackgroundColor: '#FFF7CC',
        tabBarLabelStyle: { fontSize: 14, fontWeight: '800' },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 96 : 84,
          paddingTop: 6,
          borderTopWidth: 3,
          borderTopColor: Colors.border,
          backgroundColor: Colors.background,
        },
        tabBarItemStyle: { paddingVertical: 4, borderRadius: 12 },
        tabBarIcon: ({ color }) => <Icon name={TAB_ICONS[route.name]} size={34} color={color} />,
        tabBarAccessibilityLabel: `${route.name} tab`,
      })}
    >
      <Tab.Screen name="Talk" component={HomeScreen} />
      <Tab.Screen name="Feelings" component={FeelingsScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Routine" component={RoutineScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
    </Tab.Navigator>
  );
}
