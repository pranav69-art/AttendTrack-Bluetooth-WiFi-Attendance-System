import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pre-seeded demo data
const DEMO_USERS = [
  { id: 'admin1', name: 'Dr. Admin', email: 'admin@school.com', password: 'admin123', role: 'admin', department: 'Administration' },
  { id: 'std1',   name: 'Alice Johnson', email: 'alice@school.com', password: 'pass123', role: 'student', studentId: 'STU001', department: 'Computer Science' },
  { id: 'std2',   name: 'Bob Smith',     email: 'bob@school.com',   password: 'pass123', role: 'student', studentId: 'STU002', department: 'Computer Science' },
  { id: 'std3',   name: 'Carol White',   email: 'carol@school.com', password: 'pass123', role: 'student', studentId: 'STU003', department: 'Mathematics' },
  { id: 'emp1',   name: 'John Doe',      email: 'john@company.com', password: 'pass123', role: 'employee', employeeId: 'EMP001', department: 'Engineering' },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}
    setLoading(false);
  };

  const login = async (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    await AsyncStorage.setItem('currentUser', JSON.stringify(safeUser));
    return safeUser;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  const getAllUsers = () => DEMO_USERS.map(({ password: _, ...u }) => u);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
