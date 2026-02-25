import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AdminDashboard from '../screens/admin/AdminDashboard';
import CreateSessionScreen from '../screens/admin/CreateSessionScreen';
import SessionsListScreen from '../screens/admin/SessionsListScreen';
import AllUsersScreen from '../screens/admin/AllUsersScreen';

const Tab = createBottomTabNavigator();

const Icon = ({ name }: { name: string }) => (
  <Text style={{ fontSize: 22 }}>{name}</Text>
);

export default function AdminNavigator() {
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
        name="Dashboard"
        component={AdminDashboard}
        options={{ tabBarIcon: () => <Icon name="📊" />, title: 'Dashboard' }}
      />
      <Tab.Screen
        name="NewSession"
        component={CreateSessionScreen}
        options={{ tabBarIcon: () => <Icon name="➕" />, title: 'New Session' }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsListScreen}
        options={{ tabBarIcon: () => <Icon name="📋" />, title: 'Sessions' }}
      />
      <Tab.Screen
        name="Users"
        component={AllUsersScreen}
        options={{ tabBarIcon: () => <Icon name="👥" />, title: 'Users' }}
      />
    </Tab.Navigator>
  );
}
