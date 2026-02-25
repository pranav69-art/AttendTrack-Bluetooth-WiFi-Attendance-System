/**
 * ConnectivityService
 * Handles BLE scanning and WiFi SSID detection for proximity-based attendance.
 *
 * BLE Flow:
 *  Admin device advertises a beacon UUID via react-native-ble-plx (peripheral mode needs native module).
 *  Student device scans for that UUID. When RSSI > threshold → mark attendance.
 *
 * WiFi Flow:
 *  Admin shares the current WiFi SSID with students.
 *  Student app reads current SSID. If matches session SSID → mark attendance.
 */

import { BleManager, State } from 'react-native-ble-plx';
import NetInfo from '@react-native-community/netinfo';
import { Platform, PermissionsAndroid } from 'react-native';

const bleManager = new BleManager();
const RSSI_THRESHOLD = -75; // dBm — closer devices pass this

class ConnectivityService {
  private scanSubscription: any = null;

  // ─── Permissions ───────────────────────────────────────────────────────────
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
        PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE,
      ]);
      return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    } catch (e) {
      console.warn('Permission error:', e);
      return false;
    }
  }

  // ─── WiFi Detection ────────────────────────────────────────────────────────
  async getCurrentWifiSSID(): Promise<string | null> {
    try {
      const state = await NetInfo.fetch();
      if (state.type === 'wifi' && state.details) {
        return (state.details as any).ssid || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async checkWifiMatch(targetSSID: string): Promise<boolean> {
    const current = await this.getCurrentWifiSSID();
    if (!current) return false;
    return current.toLowerCase().trim() === targetSSID.toLowerCase().trim();
  }

  // ─── Bluetooth Scanning ────────────────────────────────────────────────────
  async startBleScan(targetBeaconId: string, onDetected: () => void): Promise<void> {
    const state = await bleManager.state();
    if (state !== State.PoweredOn) {
      throw new Error('Bluetooth is not enabled. Please turn on Bluetooth.');
    }

    this.stopBleScan(); // Stop any existing scan

    bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.warn('BLE scan error:', error);
        return;
      }
      if (!device) return;

      // Match by device name or local name containing the beacon ID
      const nameMatch = device.name?.includes(targetBeaconId) ||
                        device.localName?.includes(targetBeaconId);
      const rssiOk = (device.rssi || -999) > RSSI_THRESHOLD;

      if (nameMatch && rssiOk) {
        this.stopBleScan();
        onDetected();
      }
    });

    // Auto-stop scan after 30 seconds
    setTimeout(() => this.stopBleScan(), 30000);
  }

  stopBleScan(): void {
    bleManager.stopDeviceScan();
  }

  // ─── Combined Check ────────────────────────────────────────────────────────
  async detectPresence(session: { beaconId: string; wifiSSID: string }): Promise<{
    detected: boolean;
    method: 'bluetooth' | 'wifi' | null;
  }> {
    // 1. Try WiFi first (faster, no scan delay)
    if (session.wifiSSID) {
      const wifiMatch = await this.checkWifiMatch(session.wifiSSID);
      if (wifiMatch) return { detected: true, method: 'wifi' };
    }

    // 2. Try BLE scan
    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.stopBleScan();
          resolve({ detected: false, method: null });
        }
      }, 15000);

      this.startBleScan(session.beaconId, () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({ detected: true, method: 'bluetooth' });
        }
      }).catch(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({ detected: false, method: null });
        }
      });
    });
  }

  destroy(): void {
    this.stopBleScan();
    bleManager.destroy();
  }
}

export const connectivityService = new ConnectivityService();
export default connectivityService;
