import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { format } from 'date-fns';

export default function AdminDashboard({ navigation }: any) {
  const { user, logout } = useAuth();
  const { sessions, records, getActiveSessions } = useAttendance();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayRecords = records.filter(r => r.date === todayStr);
  const activeSessions = getActiveSessions();

  const stats = [
    { label: "Today's Sessions", value: todaySessions.length, emoji: '📚', color: '#1a73e8' },
    { label: 'Active Now',       value: activeSessions.length, emoji: '🔴', color: '#e53935' },
    { label: 'Total Check-ins',  value: todayRecords.length,   emoji: '✅', color: '#43a047' },
    { label: 'Total Sessions',   value: sessions.length,       emoji: '📊', color: '#fb8c00' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.greeting}>👋 Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d yyyy')}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Today's Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={styles.statEmoji}>{s.emoji}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Active Sessions */}
      <Text style={styles.sectionTitle}>🔴 Active Sessions</Text>
      {activeSessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active sessions</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('NewSession')}>
            <Text style={styles.actionBtnText}>➕ Start a Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        activeSessions.map(sess => {
          const count = records.filter(r => r.sessionId === sess.id).length;
          return (
            <View key={sess.id} style={styles.sessionCard}>
              <View style={styles.sessionDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionName}>{sess.name}</Text>
                <Text style={styles.sessionMeta}>
                  Beacon: {sess.beaconId}  •  WiFi: {sess.wifiSSID || 'N/A'}
                </Text>
                <Text style={styles.sessionCount}>👥 {count} checked in</Text>
              </View>
            </View>
          );
        })
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#1a73e8' }]} onPress={() => navigation.navigate('NewSession')}>
          <Text style={styles.quickBtnText}>➕ New Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#43a047' }]} onPress={() => navigation.navigate('Sessions')}>
          <Text style={styles.quickBtnText}>📋 View All</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff', padding: 16 },
  welcomeCard: {
    backgroundColor: '#1a73e8',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statEmoji: { fontSize: 28 },
  statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 2 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: { color: '#aaa', marginBottom: 12 },
  actionBtn: { backgroundColor: '#1a73e8', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  actionBtnText: { color: '#fff', fontWeight: '600' },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  sessionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e53935', marginRight: 12 },
  sessionName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  sessionMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  sessionCount: { fontSize: 13, color: '#43a047', marginTop: 4, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  quickBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  quickBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
