// KYC SDK Type Definitions

export type KYCStep = 
  | 'welcome'
  | 'idTypeSelection'
  | 'idScanFront'
  | 'idScanBack'
  | 'ocrPreview'
  | 'selfie'
  | 'review'
  | 'processing'
  | 'result';

export type VerificationStatus = 'approved' | 'pending' | 'rejected' | 'under_review';

export interface OCRFieldMapping {
  fullName: string;
  fullNameAmharic?: string;
  dateOfBirth: string;
  dateOfBirthEthiopian?: string;
  dateOfIssue?: string;
  dateOfIssueEthiopian?: string;
  dateOfExpiry: string;
  dateOfExpiryEthiopian?: string;
  gender: string;
  idNumber: string;
  documentType?: string;
  issuingAuthority: string;
  sex?: string;
  documentStatus?: {
    is_valid: boolean;
    is_older_than_18: boolean;
    is_document_accepted: boolean;
  };
}

export interface KYCData {
  idType: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  ocrData: OCRFieldMapping;
}

export interface KYCStepInfo {
  step: KYCStep;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  canGoBack: boolean;
}

export interface KYCProgress {
  currentStep: KYCStep;
  currentStepIndex: number;
  totalSteps: number;
  progressSteps: KYCStepInfo[];
  canGoNext: boolean;
  canGoBack: boolean;
}

export interface KYCVerificationResult {
  status: VerificationStatus;
  decision?: string;
  review_required?: boolean;
  message?: string;
  uiData?: any;
  apiResponse?: any;
  timestamp: Date;
}

export interface KYCSession {
  id: string;
  token?: string;
  status: string;
  decision?: string;
  expiresAt?: string;
  piiData?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
  uiData?: any;
  metadata?: any;
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

export interface KYCAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface KYCAPICredentials {
  apiKey: string;
  tenantId?: string;
  userId?: string;
  sessionToken?: string;
}

export interface KYCStepConfig {
  step: KYCStep;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  validation?: (data: KYCData) => boolean | string;
  autoAdvance?: boolean;
  skipIf?: (data: KYCData) => boolean;
}
