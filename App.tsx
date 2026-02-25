import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
          <RootNavigator />
        </NavigationContainer>
      </AttendanceProvider>
    </AuthProvider>
  );
}
