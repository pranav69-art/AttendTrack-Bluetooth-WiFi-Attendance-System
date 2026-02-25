import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    }
    setLoading(false);
  };

  const fillDemo = (type: string) => {
    const demos: any = {
      admin:   { email: 'admin@school.com',   password: 'admin123' },
      student: { email: 'alice@school.com',    password: 'pass123' },
      employee:{ email: 'john@company.com',    password: 'pass123' },
    };
    setEmail(demos[type].email);
    setPassword(demos[type].password);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📡</Text>
          <Text style={styles.title}>AttendTrack</Text>
          <Text style={styles.subtitle}>Bluetooth & WiFi Attendance System</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        {/* Demo Accounts */}
        <Text style={styles.demoTitle}>🎯 Demo Accounts (tap to fill)</Text>
        <View style={styles.demoRow}>
          {['admin', 'student', 'employee'].map(type => (
            <TouchableOpacity key={type} style={styles.demoBtn} onPress={() => fillDemo(type)}>
              <Text style={styles.demoBtnText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.credBox}>
          <Text style={styles.credTitle}>Demo Credentials</Text>
          <Text style={styles.credText}>Admin: admin@school.com / admin123</Text>
          <Text style={styles.credText}>Student: alice@school.com / pass123</Text>
          <Text style={styles.credText}>Employee: john@company.com / pass123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a73e8', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  demoTitle: { textAlign: 'center', color: '#555', marginBottom: 12, fontWeight: '600' },
  demoRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  demoBtn: {
    backgroundColor: '#e8f0fe',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  demoBtnText: { color: '#1a73e8', fontWeight: '600', fontSize: 13 },
  credBox: {
    backgroundColor: '#fff9e6',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#f9a825',
  },
  credTitle: { fontWeight: 'bold', color: '#555', marginBottom: 6 },
  credText: { color: '#666', fontSize: 13, marginBottom: 2 },
});
