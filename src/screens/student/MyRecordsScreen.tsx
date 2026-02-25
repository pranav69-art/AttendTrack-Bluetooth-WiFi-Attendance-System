import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { format } from 'date-fns';

export default function MyRecordsScreen() {
  const { user } = useAuth();
  const { records, sessions } = useAttendance();

  const myRecords = [...records.filter(r => r.userId === user?.id)].reverse();
  const totalDays = new Set(myRecords.map(r => r.date)).size;

  const getSessionName = (id: string) => {
    const s = sessions.find(s => s.id === id);
    return s?.name || id;
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{myRecords.length}</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{totalDays}</Text>
          <Text style={styles.summaryLabel}>Days Present</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: '#43a047' }]}>100%</Text>
          <Text style={styles.summaryLabel}>Marked Present</Text>
        </View>
      </View>

      <FlatList
        data={myRecords}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={styles.emptyText}>No records yet</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.methodIcon}>
                {item.method === 'bluetooth' ? '📶' : item.method === 'wifi' ? '📡' : '✏️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionName} numberOfLines={1}>{getSessionName(item.sessionId)}</Text>
              <Text style={styles.timestamp}>{format(new Date(item.timestamp), 'EEE, MMM d yyyy · HH:mm')}</Text>
              <View style={styles.methodRow}>
                <View style={[styles.methodBadge,
                  item.method === 'bluetooth' ? { backgroundColor: '#e3f2fd' } :
                  item.method === 'wifi' ? { backgroundColor: '#e8f5e9' } : { backgroundColor: '#fff3e0' }]}>
                  <Text style={styles.methodBadgeText}>
                    {item.method === 'bluetooth' ? 'Bluetooth' : item.method === 'wifi' ? 'WiFi' : 'Manual'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.presentBadge}>
              <Text style={styles.presentText}>✅</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff' },
  summary: {
    backgroundColor: '#1a73e8', flexDirection: 'row',
    padding: 20, justifyContent: 'space-around', alignItems: 'center',
  },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  empty: { alignItems: 'center', padding: 60 },
  emptyText: { color: '#aaa', fontSize: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2,
  },
  cardLeft: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8f0fe',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  methodIcon: { fontSize: 22 },
  sessionName: { fontWeight: 'bold', color: '#222', fontSize: 14 },
  timestamp: { color: '#888', fontSize: 12, marginTop: 3 },
  methodRow: { flexDirection: 'row', marginTop: 6 },
  methodBadge: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 10 },
  methodBadgeText: { fontSize: 11, fontWeight: '600', color: '#555' },
  presentBadge: { padding: 6 },
  presentText: { fontSize: 22 },
});
