// KYC Configuration Types
import type { KYCStep, KYCData, KYCProgress, KYCVerificationResult } from './KYCTypes';

export interface KYCAuthConfig {
  apiKey: string;
  tenantId?: string;
  userId?: string;
  sessionToken?: string;
  callbackUrl?: string;
  backendApiKey?: string; // API key for backend service endpoints
}

export interface KYCConfig {
  // Authentication
  auth: KYCAuthConfig;
  
  // API Configuration
  apiBaseUrl?: string;
  sessionId?: string;
  
  // Feature Flags
  enableAutoOCR?: boolean;
  enableFaceVerification?: boolean;
  enableProgressTracking?: boolean;
  enableLocalStorage?: boolean;
  
  // UI Configuration
  customStyles?: KYCCustomStyles;
  supportedIDTypes?: KYCIDType[];
  
  // Event Handlers
  onStepChange?: (step: KYCStep, data: KYCData) => void;
  onProgressUpdate?: (progress: KYCProgress) => void;
  onVerificationComplete?: (result: KYCVerificationResult) => void;
  onError?: (error: Error) => void;
  
  // Advanced Configuration
  timeout?: number;
  retryAttempts?: number;
  debug?: boolean;
}

export interface KYCCustomStyles {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  buttonStyle?: 'default' | 'rounded' | 'minimal';
  theme?: 'light' | 'dark' | 'auto';
}

export interface KYCIDType {
  id: string;
  name: string;
  code: string;
  requiresFront: boolean;
  requiresBack: boolean;
  requiresSelfie: boolean;
  description?: string;
  icon?: string;
}
