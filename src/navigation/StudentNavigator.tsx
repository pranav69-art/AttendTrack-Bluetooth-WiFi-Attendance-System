import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import StudentDashboard from '../screens/student/StudentDashboard';
import MarkAttendanceScreen from '../screens/student/MarkAttendanceScreen';
import MyRecordsScreen from '../screens/student/MyRecordsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

const Icon = ({ name }: { name: string }) => (
  <Text style={{ fontSize: 22 }}>{name}</Text>
);

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentDashboard}
        options={{ tabBarIcon: () => <Icon name="🏠" />, title: 'Home' }}
      />
      <Tab.Screen
        name="Mark"
        component={MarkAttendanceScreen}
        options={{ tabBarIcon: () => <Icon name="✅" />, title: 'Check In' }}
      />
      <Tab.Screen
        name="Records"
        component={MyRecordsScreen}
        options={{ tabBarIcon: () => <Icon name="📅" />, title: 'My Records' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Icon name="👤" />, title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
