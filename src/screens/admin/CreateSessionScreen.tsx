import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import NetInfo from '@react-native-community/netinfo';

export default function CreateSessionScreen({ navigation }: any) {
  const { user } = useAuth();
  const { createSession, endSession, getActiveSessions } = useAttendance();
  const [name, setName] = useState('');
  const [beaconId, setBeaconId] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingWifi, setDetectingWifi] = useState(false);

  const activeSessions = getActiveSessions();

  const autoDetectWifi = async () => {
    setDetectingWifi(true);
    try {
      const state = await NetInfo.fetch();
      if (state.type === 'wifi' && state.details) {
        const ssid = (state.details as any).ssid;
        if (ssid) {
          setWifiSSID(ssid);
          Alert.alert('✅ WiFi Detected', `SSID: ${ssid}`);
        } else {
          Alert.alert('⚠️', 'Connected to WiFi but SSID not available. Location permission may be needed.');
        }
      } else {
        Alert.alert('⚠️', 'Not connected to WiFi. Connect first then try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to detect WiFi');
    }
    setDetectingWifi(false);
  };

  const generateBeaconId = () => {
    const id = 'ATD_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setBeaconId(id);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }
    if (!beaconId && !wifiSSID) {
      Alert.alert('Error', 'Please set at least a Beacon ID or WiFi SSID for detection');
      return;
    }
    setLoading(true);
    try {
      const session = await createSession({
        name: name.trim(),
        beaconId: beaconId.trim(),
        wifiSSID: wifiSSID.trim(),
        adminId: user?.id,
      });
      Alert.alert(
        '✅ Session Created!',
        `Session "${session.name}" is now active.\n\nBeacon ID: ${session.beaconId}\nWiFi SSID: ${session.wifiSSID || 'N/A'}\n\nShare these with your students/employees.`,
        [{ text: 'OK', onPress: () => { setName(''); setBeaconId(''); setWifiSSID(''); } }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to create session');
    }
    setLoading(false);
  };

  const handleEndSession = (sessionId: string, sessionName: string) => {
    Alert.alert(
      'End Session',
      `Are you sure you want to end "${sessionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', style: 'destructive', onPress: () => endSession(sessionId) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <View style={styles.activeSection}>
          <Text style={styles.activeTitle}>🔴 Currently Active Sessions</Text>
          {activeSessions.map(s => (
            <View key={s.id} style={styles.activeCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeSessionName}>{s.name}</Text>
                <Text style={styles.activeSessionMeta}>Beacon: {s.beaconId}</Text>
                <Text style={styles.activeSessionMeta}>WiFi: {s.wifiSSID || 'N/A'}</Text>
              </View>
              <TouchableOpacity
                style={styles.endBtn}
                onPress={() => handleEndSession(s.id, s.name)}
              >
                <Text style={styles.endBtnText}>End</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Create Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>➕ Create New Session</Text>

        <Text style={styles.label}>Session Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. CS101 - Morning Lecture"
          placeholderTextColor="#aaa"
        />

        {/* Bluetooth */}
        <Text style={styles.sectionLabel}>📶 Bluetooth Beacon</Text>
        <Text style={styles.hint}>Students nearby will detect this beacon ID via BLE scan</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={beaconId}
            onChangeText={setBeaconId}
            placeholder="e.g. ATD_ABC123"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.autoBtn} onPress={generateBeaconId}>
            <Text style={styles.autoBtnText}>Generate</Text>
          </TouchableOpacity>
        </View>

        {/* WiFi */}
        <Text style={styles.sectionLabel}>📡 WiFi Network</Text>
        <Text style={styles.hint}>Students on the same WiFi will be auto-detected</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={wifiSSID}
            onChangeText={setWifiSSID}
            placeholder="e.g. SchoolWiFi-5G"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.autoBtn} onPress={autoDetectWifi} disabled={detectingWifi}>
            {detectingWifi
              ? <ActivityIndicator size="small" color="#1a73e8" />
              : <Text style={styles.autoBtnText}>Detect</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 How it works: Students open the app and tap "Check In". The app first checks if they're on
            the same WiFi, then scans for your Bluetooth beacon. If either matches, attendance is automatically marked.
          </Text>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.createBtnText}>🚀 Start Session</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff', padding: 16 },
  activeSection: { marginBottom: 20 },
  activeTitle: { fontWeight: 'bold', color: '#e53935', fontSize: 15, marginBottom: 10 },
  activeCard: {
    backgroundColor: '#fff3f3',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e53935',
  },
  activeSessionName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  activeSessionMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  endBtn: { backgroundColor: '#e53935', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  endBtnText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#1a73e8', marginTop: 16, marginBottom: 4 },
  hint: { fontSize: 12, color: '#888', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  autoBtn: {
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a73e8',
    minWidth: 75,
    alignItems: 'center',
    marginBottom: 8,
  },
  autoBtnText: { color: '#1a73e8', fontWeight: '600', fontSize: 13 },
  infoBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#43a047',
  },
  infoText: { color: '#2e7d32', fontSize: 13, lineHeight: 19 },
  createBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
