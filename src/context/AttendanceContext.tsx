import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);       // Active sessions created by admin
  const [records, setRecords] = useState([]);          // All attendance records
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const s = await AsyncStorage.getItem('sessions');
      const r = await AsyncStorage.getItem('records');
      if (s) setSessions(JSON.parse(s));
      if (r) setRecords(JSON.parse(r));
    } catch (e) {}
  };

  const saveSessions = async (data) => {
    setSessions(data);
    await AsyncStorage.setItem('sessions', JSON.stringify(data));
  };

  const saveRecords = async (data) => {
    setRecords(data);
    await AsyncStorage.setItem('records', JSON.stringify(data));
  };

  // Admin creates a session (class/meeting)
  const createSession = async ({ name, beaconId, wifiSSID, adminId }) => {
    const session = {
      id: Date.now().toString(),
      name,
      beaconId: beaconId || `BEACON_${Date.now()}`,
      wifiSSID: wifiSSID || '',
      adminId,
      createdAt: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      active: true,
    };
    const updated = [...sessions, session];
    await saveSessions(updated);
    setActiveSession(session);
    return session;
  };

  // Admin ends a session
  const endSession = async (sessionId) => {
    const updated = sessions.map(s =>
      s.id === sessionId ? { ...s, active: false, endedAt: new Date().toISOString() } : s
    );
    await saveSessions(updated);
    setActiveSession(null);
  };

  // Student/Employee marks attendance
  const markAttendance = async ({ userId, userName, sessionId, method }) => {
    // Prevent duplicate
    const exists = records.find(r => r.userId === userId && r.sessionId === sessionId);
    if (exists) return { success: false, message: 'Already marked for this session' };

    const record = {
      id: Date.now().toString(),
      userId,
      userName,
      sessionId,
      method,  // 'bluetooth' | 'wifi' | 'manual'
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'present',
    };
    const updated = [...records, record];
    await saveRecords(updated);
    return { success: true, record };
  };

  // Admin manual override
  const manualMark = async ({ userId, userName, sessionId }) => {
    return markAttendance({ userId, userName, sessionId, method: 'manual' });
  };

  const getSessionRecords = (sessionId) => records.filter(r => r.sessionId === sessionId);
  const getUserRecords = (userId) => records.filter(r => r.userId === userId);
  const getActiveSessions = () => sessions.filter(s => s.active);

  return (
    <AttendanceContext.Provider value={{
      sessions, records, activeSession,
      createSession, endSession, markAttendance, manualMark,
      getSessionRecords, getUserRecords, getActiveSessions,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
