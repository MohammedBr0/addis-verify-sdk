// KYC Local Storage Utilities
import { KYCState } from '../services/KYCStateManager';

export class KYCStorage {
  private readonly storageKey = 'kyc_sdk_state';
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  saveState(state: KYCState): void {
    if (!this.enabled || !this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(this.storageKey, serializedState);
    } catch (error) {
      console.warn('Failed to save KYC state to localStorage:', error);
    }
  }

  loadState(): KYCState | null {
    if (!this.enabled || !this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const serializedState = localStorage.getItem(this.storageKey);
      if (!serializedState) {
        return null;
      }

      return JSON.parse(serializedState);
    } catch (error) {
      console.warn('Failed to load KYC state from localStorage:', error);
      return null;
    }
  }

  clearState(): void {
    if (!this.enabled || !this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear KYC state from localStorage:', error);
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
