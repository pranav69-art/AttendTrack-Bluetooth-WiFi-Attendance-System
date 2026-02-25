import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert
} from 'react-native';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function SessionsListScreen() {
  const { sessions, records, endSession, manualMark } = useAttendance();
  const { getAllUsers } = useAuth();
  const [selected, setSelected] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const allUsers = getAllUsers().filter(u => u.role !== 'admin');

  const openSession = (session: any) => {
    setSelected(session);
    setModalVisible(true);
  };

  const handleManualMark = async (user: any) => {
    if (!selected) return;
    const result = await manualMark({
      userId: user.id,
      userName: user.name,
      sessionId: selected.id,
    });
    if (result.success) {
      Alert.alert('✅', `${user.name} marked present manually`);
    } else {
      Alert.alert('ℹ️', result.message);
    }
  };

  const sessionRecords = (sessionId: string) => records.filter(r => r.sessionId === sessionId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.pageTitle}>All Sessions ({sessions.length})</Text>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>No sessions yet. Create one from the "New Session" tab.</Text>
        </View>
      ) : (
        [...sessions].reverse().map(session => {
          const count = sessionRecords(session.id).length;
          return (
            <TouchableOpacity key={session.id} style={styles.sessionCard} onPress={() => openSession(session)}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionName}>{session.name}</Text>
                <View style={[styles.badge, session.active ? styles.activeBadge : styles.endedBadge]}>
                  <Text style={styles.badgeText}>{session.active ? 'LIVE' : 'ENDED'}</Text>
                </View>
              </View>
              <Text style={styles.sessionDate}>
                📅 {format(new Date(session.createdAt), 'MMM d, yyyy HH:mm')}
              </Text>
              <View style={styles.sessionFooter}>
                <Text style={styles.sessionMeta}>📶 {session.beaconId}</Text>
                <Text style={styles.attendCount}>👥 {count} present</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Session Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          {selected && (
            <>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selected.name}</Text>
                  <Text style={styles.modalDate}>
                    {format(new Date(selected.createdAt), 'MMMM d, yyyy · HH:mm')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>✕ Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Session Info */}
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Beacon ID</Text>
                    <Text style={styles.infoValue}>{selected.beaconId}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>WiFi SSID</Text>
                    <Text style={styles.infoValue}>{selected.wifiSSID || 'N/A'}</Text>
                  </View>
                </View>

                {/* Attendance Records */}
                <Text style={styles.sectionLabel}>
                  ✅ Checked In ({sessionRecords(selected.id).length})
                </Text>
                {sessionRecords(selected.id).length === 0 ? (
                  <Text style={styles.noRecords}>No attendance recorded yet</Text>
                ) : (
                  sessionRecords(selected.id).map(r => (
                    <View key={r.id} style={styles.recordRow}>
                      <View style={styles.avatar}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                          {r.userName.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recordName}>{r.userName}</Text>
                        <Text style={styles.recordTime}>
                          {format(new Date(r.timestamp), 'HH:mm:ss')} · {r.method}
                        </Text>
                      </View>
                      <View style={[styles.methodBadge,
                        r.method === 'bluetooth' ? styles.btBadge :
                        r.method === 'wifi' ? styles.wifiBadge : styles.manualBadge]}>
                        <Text style={styles.methodText}>
                          {r.method === 'bluetooth' ? '📶' : r.method === 'wifi' ? '📡' : '✏️'}
                        </Text>
                      </View>
                    </View>
                  ))
                )}

                {/* Manual Mark */}
                {selected.active && (
                  <>
                    <Text style={styles.sectionLabel}>✏️ Manual Mark Attendance</Text>
                    {allUsers.map(u => {
                      const alreadyMarked = sessionRecords(selected.id).find(r => r.userId === u.id);
                      return (
                        <View key={u.id} style={styles.userRow}>
                          <View style={styles.avatar}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{u.name.charAt(0)}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recordName}>{u.name}</Text>
                            <Text style={styles.recordTime}>{u.studentId || u.employeeId || ''} · {u.department}</Text>
                          </View>
                          {alreadyMarked ? (
                            <View style={styles.markedBadge}>
                              <Text style={{ color: '#43a047', fontSize: 12, fontWeight: '600' }}>✅ Present</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.markBtn}
                              onPress={() => handleManualMark(u)}
                            >
                              <Text style={styles.markBtnText}>Mark</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}

                {/* End Session */}
                {selected.active && (
                  <TouchableOpacity
                    style={styles.endBtn}
                    onPress={() => {
                      endSession(selected.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.endBtnText}>🛑 End This Session</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff', padding: 16 },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  empty: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: '#888', textAlign: 'center', fontSize: 15 },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sessionName: { fontSize: 16, fontWeight: 'bold', color: '#222', flex: 1 },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, marginLeft: 8 },
  activeBadge: { backgroundColor: '#e53935' },
  endedBadge: { backgroundColor: '#9e9e9e' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  sessionDate: { color: '#888', fontSize: 12, marginBottom: 8 },
  sessionFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionMeta: { color: '#555', fontSize: 12 },
  attendCount: { color: '#43a047', fontWeight: 'bold', fontSize: 13 },
  // Modal
  modal: { flex: 1, backgroundColor: '#f5f7ff' },
  modalHeader: {
    backgroundColor: '#1a73e8',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modalDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8, marginLeft: 12 },
  infoRow: { flexDirection: 'row', padding: 16, gap: 12 },
  infoItem: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12,
    elevation: 1, shadowOpacity: 0.05,
  },
  infoLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  noRecords: { color: '#aaa', textAlign: 'center', padding: 20 },
  recordRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 12,
    elevation: 1,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a73e8',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  recordName: { fontSize: 14, fontWeight: '600', color: '#333' },
  recordTime: { fontSize: 12, color: '#888', marginTop: 2 },
  methodBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btBadge: { backgroundColor: '#e3f2fd' },
  wifiBadge: { backgroundColor: '#e8f5e9' },
  manualBadge: { backgroundColor: '#fff3e0' },
  methodText: { fontSize: 16 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 12, elevation: 1,
  },
  markBtn: { backgroundColor: '#1a73e8', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  markBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  markedBadge: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  endBtn: {
    backgroundColor: '#e53935', borderRadius: 12, margin: 16,
    padding: 16, alignItems: 'center', marginTop: 24,
  },
  endBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
