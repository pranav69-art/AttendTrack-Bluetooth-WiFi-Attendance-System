import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Animated,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import connectivityService from '../../services/ConnectivityService';

type Phase = 'idle' | 'requesting' | 'scanning' | 'success' | 'failed';

export default function MarkAttendanceScreen() {
  const { user } = useAuth();
  const { getActiveSessions, markAttendance, records } = useAttendance();

  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<{ method: string; sessionName: string } | null>(null);
  const [scanProgress] = useState(new Animated.Value(0));

  const activeSessions = getActiveSessions();

  const isAlreadyMarked = (sessionId: string) =>
    records.some(r => r.userId === user?.id && r.sessionId === sessionId);

  const startCheckIn = async () => {
    if (activeSessions.length === 0) {
      Alert.alert('No Active Sessions', 'No sessions are currently active. Please wait for your admin to start one.');
      return;
    }

    setPhase('requesting');
    const hasPerms = await connectivityService.requestPermissions();
    if (!hasPerms) {
      Alert.alert(
        'Permissions Required',
        'Location and Bluetooth permissions are needed to detect your proximity.\n\nPlease grant them in Settings and try again.',
      );
      setPhase('idle');
      return;
    }

    setPhase('scanning');
    // Animate progress bar
    Animated.timing(scanProgress, { toValue: 1, duration: 15000, useNativeDriver: false }).start();

    let checkedIn = false;

    for (const session of activeSessions) {
      if (isAlreadyMarked(session.id)) continue;

      try {
        const detection = await connectivityService.detectPresence({
          beaconId: session.beaconId,
          wifiSSID: session.wifiSSID,
        });

        if (detection.detected && detection.method) {
          const outcome = await markAttendance({
            userId: user!.id,
            userName: user!.name,
            sessionId: session.id,
            method: detection.method,
          });
          if (outcome.success) {
            checkedIn = true;
            setResult({ method: detection.method, sessionName: session.name });
            break;
          }
        }
      } catch (e) {
        console.warn('Detection error for session:', session.name, e);
      }
    }

    scanProgress.setValue(0);

    if (checkedIn) {
      setPhase('success');
    } else {
      setPhase('failed');
    }
  };

  const reset = () => {
    setPhase('idle');
    setResult(null);
    scanProgress.setValue(0);
  };

  const progressWidth = scanProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
      {/* Active Sessions Banner */}
      <View style={styles.sessionsBanner}>
        <Text style={styles.bannerTitle}>
          {activeSessions.length === 0
            ? '😴 No Active Sessions'
            : `📢 ${activeSessions.length} Active Session(s)`}
        </Text>
        {activeSessions.map(s => (
          <View key={s.id} style={styles.sessionPill}>
            <Text style={styles.sessionPillDot}>●</Text>
            <Text style={styles.sessionPillText}>{s.name}</Text>
            {isAlreadyMarked(s.id) && <Text style={styles.alreadyMark}> ✅</Text>}
          </View>
        ))}
      </View>

      {/* Main Check-in Area */}
      <View style={styles.checkinArea}>
        {phase === 'idle' && (
          <>
            <Text style={styles.instructions}>
              Ensure you are{'\n'}in the classroom / office{'\n'}then tap Check In
            </Text>
            <TouchableOpacity style={styles.bigBtn} onPress={startCheckIn} disabled={activeSessions.length === 0}>
              <Text style={styles.bigBtnIcon}>📡</Text>
              <Text style={styles.bigBtnText}>Check In</Text>
              <Text style={styles.bigBtnSub}>WiFi + Bluetooth</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'requesting' && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.statusText}>Requesting permissions...</Text>
          </View>
        )}

        {phase === 'scanning' && (
          <View style={styles.statusBox}>
            <Text style={styles.scanEmoji}>🔍</Text>
            <Text style={styles.statusTitle}>Scanning...</Text>
            <Text style={styles.statusText}>Detecting WiFi network and Bluetooth beacons nearby</Text>
            <View style={styles.progressBg}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.scanHint}>Please stay within range of the beacon</Text>
          </View>
        )}

        {phase === 'success' && result && (
          <View style={styles.statusBox}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Checked In!</Text>
            <Text style={styles.successSession}>{result.sessionName}</Text>
            <View style={styles.methodChip}>
              <Text style={styles.methodChipText}>
                {result.method === 'wifi' ? '📡 Via WiFi' : '📶 Via Bluetooth'}
              </Text>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'failed' && (
          <View style={styles.statusBox}>
            <Text style={styles.failEmoji}>❌</Text>
            <Text style={styles.failTitle}>Not Detected</Text>
            <Text style={styles.failText}>
              You were not detected near any active session. Make sure you are:
            </Text>
            <Text style={styles.tip}>• Connected to the class WiFi network</Text>
            <Text style={styles.tip}>• Within Bluetooth range of the admin device</Text>
            <Text style={styles.tip}>• Location permission is granted</Text>
            <Text style={styles.tip}>• Bluetooth is turned on</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryBtnText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* How it works */}
      {phase === 'idle' && (
        <View style={styles.howBox}>
          <Text style={styles.howTitle}>How Check-In Works</Text>
          <Text style={styles.howStep}>1️⃣ Admin starts a session and shares the WiFi SSID or Bluetooth beacon ID</Text>
          <Text style={styles.howStep}>2️⃣ You tap "Check In" here</Text>
          <Text style={styles.howStep}>3️⃣ App checks if you're on the same WiFi (instant)</Text>
          <Text style={styles.howStep}>4️⃣ If not, scans for the admin's Bluetooth beacon</Text>
          <Text style={styles.howStep}>5️⃣ If detected within range, attendance is auto-marked ✅</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff' },
  sessionsBanner: {
    backgroundColor: '#1a73e8', padding: 16, paddingTop: 20,
  },
  bannerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  sessionPill: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  sessionPillDot: { color: '#4caf50', marginRight: 6 },
  sessionPillText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  alreadyMark: { color: '#a5d6a7' },
  checkinArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 360 },
  instructions: { textAlign: 'center', color: '#555', fontSize: 16, lineHeight: 26, marginBottom: 32 },
  bigBtn: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowOpacity: 0.3, shadowRadius: 10,
  },
  bigBtnIcon: { fontSize: 50 },
  bigBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginTop: 6 },
  bigBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  statusBox: { alignItems: 'center', padding: 20, width: '100%' },
  scanEmoji: { fontSize: 60, marginBottom: 16 },
  statusTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  statusText: { color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  progressBg: { width: '100%', height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#1a73e8', borderRadius: 4 },
  scanHint: { color: '#aaa', fontSize: 12 },
  successEmoji: { fontSize: 70, marginBottom: 12 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#43a047', marginBottom: 8 },
  successSession: { fontSize: 16, color: '#555', marginBottom: 16, textAlign: 'center' },
  methodChip: { backgroundColor: '#e8f5e9', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 24 },
  methodChipText: { color: '#2e7d32', fontWeight: '600' },
  resetBtn: { backgroundColor: '#1a73e8', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32 },
  resetBtnText: { color: '#fff', fontWeight: 'bold' },
  failEmoji: { fontSize: 60, marginBottom: 12 },
  failTitle: { fontSize: 24, fontWeight: 'bold', color: '#e53935', marginBottom: 12 },
  failText: { color: '#666', textAlign: 'center', marginBottom: 12 },
  tip: { color: '#555', fontSize: 13, marginBottom: 4, alignSelf: 'flex-start' },
  retryBtn: { backgroundColor: '#1a73e8', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: 20 },
  retryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  howBox: { backgroundColor: '#fff', borderRadius: 14, margin: 16, padding: 16, elevation: 2 },
  howTitle: { fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 12 },
  howStep: { color: '#555', fontSize: 13, lineHeight: 22, marginBottom: 4 },
});
