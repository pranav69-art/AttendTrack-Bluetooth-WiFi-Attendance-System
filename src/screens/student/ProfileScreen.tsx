import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { records } = useAttendance();
  const myRecords = records.filter(r => r.userId === user?.id);

  const methodCounts = {
    bluetooth: myRecords.filter(r => r.method === 'bluetooth').length,
    wifi: myRecords.filter(r => r.method === 'wifi').length,
    manual: myRecords.filter(r => r.method === 'manual').length,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        {[
          { label: 'Student/Employee ID', value: user?.studentId || user?.employeeId || 'N/A' },
          { label: 'Department', value: user?.department || 'N/A' },
          { label: 'Total Attendance', value: `${myRecords.length} sessions` },
        ].map((item, i) => (
          <View key={i} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Detection Method Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Check-In Methods</Text>
        <View style={styles.methodRow}>
          <View style={[styles.methodStat, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.methodIcon}>📶</Text>
            <Text style={styles.methodVal}>{methodCounts.bluetooth}</Text>
            <Text style={styles.methodLabel}>Bluetooth</Text>
          </View>
          <View style={[styles.methodStat, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.methodIcon}>📡</Text>
            <Text style={styles.methodVal}>{methodCounts.wifi}</Text>
            <Text style={styles.methodLabel}>WiFi</Text>
          </View>
          <View style={[styles.methodStat, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.methodIcon}>✏️</Text>
            <Text style={styles.methodVal}>{methodCounts.manual}</Text>
            <Text style={styles.methodLabel}>Manual</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff' },
  avatarSection: { backgroundColor: '#1a73e8', alignItems: 'center', paddingTop: 40, paddingBottom: 30 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#fff',
  },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  rolePill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 14, marginTop: 10 },
  roleText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  infoSection: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 20, borderRadius: 14, overflow: 'hidden', elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#333', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: '#fff', margin: 16, borderRadius: 14, padding: 16, elevation: 2 },
  cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 14 },
  methodRow: { flexDirection: 'row', gap: 10 },
  methodStat: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  methodIcon: { fontSize: 28 },
  methodVal: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 4 },
  methodLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#ffebee', borderRadius: 12, marginHorizontal: 16,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e53935',
  },
  logoutText: { color: '#e53935', fontWeight: 'bold', fontSize: 15 },
});
