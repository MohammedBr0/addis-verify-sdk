// KYC Web SDK - Main Entry Point

// Core SDK
export { KYCWebSDK } from './KYCWebSDK';

// Types
export type { KYCConfig, KYCAuthConfig } from './types/KYCConfig';
export type { 
  KYCStep, 
  KYCData, 
  OCRFieldMapping, 
  VerificationStatus,
  KYCProgress,
  KYCVerificationResult,
  KYCSession,
  KYCIDType,
  KYCAPIResponse,
  KYCAPICredentials
} from './types/KYCTypes';

// Utilities
export { KYCError } from './utils/KYCError';
export { KYCValidator } from './utils/KYCValidator';
export { KYCStorage } from './utils/KYCStorage';

// React Integration
export { useKYCSDK } from './hooks/useKYCSDK';
export { KYCProvider, useKYCContext } from './components/KYCProvider';
export { KYCWidget } from './components/KYCWidget';
