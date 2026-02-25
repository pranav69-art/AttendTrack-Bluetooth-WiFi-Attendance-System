import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { format } from 'date-fns';

export default function StudentDashboard({ navigation }: any) {
  const { user, logout } = useAuth();
  const { records, getActiveSessions } = useAttendance();

  const myRecords = records.filter(r => r.userId === user?.id);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayRecords = myRecords.filter(r => r.date === todayStr);
  const activeSessions = getActiveSessions();
  const totalDays = new Set(myRecords.map(r => r.date)).size;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, 👋</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.studentId || user?.employeeId || ''} · {user?.department}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderTopColor: '#1a73e8' }]}>
          <Text style={styles.statVal}>{myRecords.length}</Text>
          <Text style={styles.statLabel}>Total Present</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#43a047' }]}>
          <Text style={[styles.statVal, { color: '#43a047' }]}>{todayRecords.length}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#fb8c00' }]}>
          <Text style={[styles.statVal, { color: '#fb8c00' }]}>{totalDays}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
      </View>

      {/* Active Sessions alert */}
      {activeSessions.length > 0 && (
        <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Mark')}>
          <Text style={styles.alertEmoji}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{activeSessions.length} Active Session(s) Now!</Text>
            <Text style={styles.alertSub}>Tap to check in with Bluetooth/WiFi</Text>
          </View>
          <Text style={{ fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      )}

      {/* Recent Records */}
      <Text style={styles.sectionTitle}>Recent Attendance</Text>
      {myRecords.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={styles.emptyText}>No attendance records yet</Text>
        </View>
      ) : (
        [...myRecords].reverse().slice(0, 5).map(r => (
          <View key={r.id} style={styles.recordCard}>
            <View style={styles.recordLeft}>
              <Text style={styles.methodIcon}>
                {r.method === 'bluetooth' ? '📶' : r.method === 'wifi' ? '📡' : '✏️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordSession} numberOfLines={1}>{r.sessionId}</Text>
              <Text style={styles.recordTime}>{format(new Date(r.timestamp), 'MMM d, HH:mm')} · via {r.method}</Text>
            </View>
            <View style={styles.presentBadge}>
              <Text style={styles.presentText}>Present</Text>
            </View>
          </View>
        ))
      )}

      {myRecords.length > 5 && (
        <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('Records')}>
          <Text style={styles.viewAllText}>View All Records →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff', padding: 16 },
  header: {
    backgroundColor: '#1a73e8', borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 8,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  meta: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },
  date: { color: '#888', fontSize: 13, marginBottom: 16, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', borderTopWidth: 3, elevation: 2,
  },
  statVal: { fontSize: 24, fontWeight: 'bold', color: '#1a73e8' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  alertCard: {
    backgroundColor: '#fff8e1', borderRadius: 14, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#f9a825', elevation: 2,
  },
  alertEmoji: { fontSize: 28, marginRight: 12 },
  alertTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  alertSub: { color: '#888', fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  empty: { alignItems: 'center', padding: 30 },
  emptyText: { color: '#aaa', marginTop: 8 },
  recordCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8, elevation: 1,
  },
  recordLeft: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f0fe',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  methodIcon: { fontSize: 20 },
  recordSession: { fontWeight: '600', color: '#333', fontSize: 13 },
  recordTime: { color: '#888', fontSize: 12, marginTop: 2 },
  presentBadge: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  presentText: { color: '#43a047', fontWeight: '600', fontSize: 12 },
  viewAll: { alignItems: 'center', padding: 12 },
  viewAllText: { color: '#1a73e8', fontWeight: '600' },
});
