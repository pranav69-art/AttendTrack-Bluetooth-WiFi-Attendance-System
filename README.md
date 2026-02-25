# 📡 AttendTrack – Bluetooth & WiFi Attendance System

A full React Native APK app for automated attendance using **Bluetooth BLE** and **WiFi proximity detection**.

---

## 🗂️ Project Structure

```
AttendanceApp/
├── App.tsx                          # Root entry point
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx          # Login & user roles
│   │   └── AttendanceContext.tsx    # Session & record management
│   ├── services/
│   │   └── ConnectivityService.ts  # BLE scan + WiFi detection logic
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AdminNavigator.tsx
│   │   └── StudentNavigator.tsx
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── admin/
│       │   ├── AdminDashboard.tsx
│       │   ├── CreateSessionScreen.tsx
│       │   ├── SessionsListScreen.tsx
│       │   └── AllUsersScreen.tsx
│       └── student/
│           ├── StudentDashboard.tsx
│           ├── MarkAttendanceScreen.tsx
│           ├── MyRecordsScreen.tsx
│           └── ProfileScreen.tsx
└── android/
    └── AndroidManifest.xml         # All required permissions
```

---

## ✨ Features

### Admin
- 📊 Dashboard with live stats (active sessions, today's count)
- ➕ Create sessions with:
  - Auto-generate BLE Beacon ID
  - Auto-detect current WiFi SSID
- 📋 View all sessions + attendance records per session
- ✏️ Manual mark attendance for any user
- 🛑 End sessions
- 👥 View all users with attendance stats

### Student / Employee
- 🏠 Dashboard with personal attendance summary
- ✅ One-tap check-in via WiFi + BLE scan
- 📅 Full attendance history
- 👤 Profile with method stats (Bluetooth / WiFi / Manual)

---

## 🔧 How the Attendance Detection Works

```
Student taps "Check In"
         │
         ▼
  Request Permissions
  (Location, Bluetooth)
         │
         ▼
  Check WiFi SSID ──── Match? ──► Mark Present (WiFi)
         │
       No match
         │
         ▼
  Scan BLE for beacon ─ Found & RSSI > -75dBm? ──► Mark Present (BT)
         │
       Not found
         │
         ▼
     "Not Detected" (retry)
```

---

## 🚀 Build Instructions

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | nodejs.org |
| React Native CLI | Latest | `npm install -g react-native-cli` |
| Java JDK | 17 | adoptium.net |
| Android Studio | Latest | developer.android.com |
| Android SDK | API 33+ | Via Android Studio |

### Step 1 – Install dependencies

```bash
cd AttendanceApp
npm install
```

### Step 2 – Link native modules

```bash
# iOS (skip for Android-only)
cd ios && pod install && cd ..
```

### Step 3 – Run on device/emulator (debug)

```bash
# Start Metro bundler
npx react-native start

# In another terminal:
npx react-native run-android
```

### Step 4 – Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📲 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Student | alice@school.com | pass123 |
| Student | bob@school.com | pass123 |
| Employee | john@company.com | pass123 |

---

## 📋 Required Android Permissions

The following are declared in `android/AndroidManifest.xml`:

- `BLUETOOTH_SCAN` – Scan for BLE devices
- `BLUETOOTH_CONNECT` – Connect to BLE devices
- `BLUETOOTH_ADVERTISE` – Beacon mode (future)
- `ACCESS_FINE_LOCATION` – Required to read WiFi SSID (Android 8+)
- `ACCESS_WIFI_STATE` / `CHANGE_WIFI_STATE` – WiFi detection
- `INTERNET` – Network info

---

## 🧪 Testing the BLE Flow (Without Real Beacon)

During development, you can simulate detection by:

1. Admin creates a session with a known WiFi SSID (your hotspot/router)
2. Student device connects to same WiFi
3. Tap Check In → WiFi detection succeeds instantly

For Bluetooth testing:
- Use a BLE beacon app on the admin's device (e.g. "nRF Connect") advertising a name matching the Beacon ID
- Or deploy a physical BLE beacon (iBeacon, Eddystone)

---

## 🔮 Future Enhancements

- [ ] Firebase backend for multi-device sync
- [ ] QR code fallback check-in
- [ ] Face recognition verification
- [ ] Export CSV reports
- [ ] Push notifications when session starts
- [ ] Geofencing support
- [ ] Web admin dashboard

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `react-native-ble-plx` | Bluetooth Low Energy scanning |
| `@react-native-community/netinfo` | WiFi SSID detection |
| `@react-navigation/*` | Navigation & tab bars |
| `@react-native-async-storage` | Local data persistence |
| `date-fns` | Date formatting |
