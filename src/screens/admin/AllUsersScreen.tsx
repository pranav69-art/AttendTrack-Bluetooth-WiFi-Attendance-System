import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';

const roleColors: any = {
  admin: '#9c27b0',
  student: '#1a73e8',
  employee: '#fb8c00',
};

export default function AllUsersScreen() {
  const { user: me, logout, getAllUsers } = useAuth();
  const { records } = useAttendance();
  const allUsers = getAllUsers();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.pageTitle}>Users ({allUsers.length})</Text>

      {allUsers.map(u => {
        const userRecords = records.filter(r => r.userId === u.id);
        const presentDays = new Set(userRecords.map(r => r.date)).size;
        return (
          <View key={u.id} style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: roleColors[u.role] || '#666' }]}>
                <Text style={styles.avatarText}>{u.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.name}</Text>
                <Text style={styles.email}>{u.email}</Text>
                <Text style={styles.dept}>{u.department}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: roleColors[u.role] + '22', borderColor: roleColors[u.role] }]}>
                <Text style={[styles.roleText, { color: roleColors[u.role] }]}>{u.role}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{userRecords.length}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{presentDays}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{u.studentId || u.employeeId || '—'}</Text>
                <Text style={styles.statLabel}>ID</Text>
              </View>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7ff', padding: 16 },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    elevation: 2, shadowOpacity: 0.08, shadowRadius: 5,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 12, color: '#888', marginTop: 2 },
  dept: { fontSize: 12, color: '#555', marginTop: 1 },
  roleBadge: {
    borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  roleText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: 'bold', color: '#1a73e8' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#ffebee', borderRadius: 12, padding: 16, alignItems: 'center',
    marginTop: 8, borderWidth: 1, borderColor: '#e53935',
  },
  logoutText: { color: '#e53935', fontWeight: 'bold', fontSize: 15 },
});
