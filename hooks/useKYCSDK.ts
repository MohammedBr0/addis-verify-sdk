// React Hook for KYC SDK
import { useState, useEffect, useCallback, useRef } from 'react';
import { KYCWebSDK } from '../KYCWebSDK';
import { KYCConfig, KYCAuthConfig } from '../types/KYCConfig';
import { KYCStep, KYCData, KYCProgress, KYCVerificationResult, KYCSession } from '../types/KYCTypes';
import { KYCError } from '../utils/KYCError';

export interface UseKYCSDKReturn {
  // SDK instance
  sdk: KYCWebSDK | null;
  
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: KYCError | null;
  
  // Current state
  currentStep: KYCStep;
  data: KYCData;
  progress: KYCProgress;
  session: KYCSession | null;
  verificationResult: KYCVerificationResult | null;
  
  // Actions
  initialize: () => Promise<void>;
  startVerification: (session?: KYCSession) => Promise<void>;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  goToStep: (step: KYCStep) => void;
  updateData: (updates: Partial<KYCData>) => void;
  completeVerification: () => Promise<KYCVerificationResult>;
  reset: () => void;
  destroy: () => void;
  updateCredentials: (auth: KYCAuthConfig) => void;
}

export function useKYCSDK(config: KYCConfig): UseKYCSDKReturn {
  const [sdk, setSdk] = useState<KYCWebSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<KYCError | null>(null);
  
  const [currentStep, setCurrentStep] = useState<KYCStep>('welcome');
  const [data, setData] = useState<KYCData>({
    idType: '',
    idFront: null,
    idBack: null,
    selfie: null,
    ocrData: {
      fullName: '',
      dateOfBirth: '',
      dateOfExpiry: '2025-12-31',
      gender: '',
      idNumber: '',
      issuingAuthority: 'Government of Ethiopia'
    }
  });
  const [progress, setProgress] = useState<KYCProgress>({
    currentStep: 'welcome',
    currentStepIndex: 0,
    totalSteps: 9,
    progressSteps: [],
    canGoNext: false,
    canGoBack: false
  });
  const [session, setSession] = useState<KYCSession | null>(null);
  const [verificationResult, setVerificationResult] = useState<KYCVerificationResult | null>(null);

  const sdkRef = useRef<KYCWebSDK | null>(null);

  // Initialize SDK
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const kycSDK = new KYCWebSDK({
        ...config,
        onStepChange: (step, kycData) => {
          setCurrentStep(step);
          setData(kycData);
        },
        onProgressUpdate: (progressData) => {
          setProgress(progressData);
        },
        onVerificationComplete: (result) => {
          setVerificationResult(result);
        },
        onError: (err) => {
          setError(err instanceof KYCError ? err : new KYCError(err.message, err));
        }
      });

      await kycSDK.initialize();
      
      sdkRef.current = kycSDK;
      setSdk(kycSDK);
      setIsInitialized(true);
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to initialize KYC SDK', err as Error);
      setError(kycError);
      throw kycError;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Start verification
  const startVerification = useCallback(async (sessionData?: KYCSession) => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      await sdkRef.current.startVerification(sessionData);
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to start verification', err as Error);
      setError(kycError);
      throw kycError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Next step
  const nextStep = useCallback(async () => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      await sdkRef.current.nextStep();
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to proceed to next step', err as Error);
      setError(kycError);
      throw kycError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Previous step
  const previousStep = useCallback(() => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setError(null);
      sdkRef.current.previousStep();
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to go to previous step', err as Error);
      setError(kycError);
    }
  }, []);

  // Go to specific step
  const goToStep = useCallback((step: KYCStep) => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setError(null);
      sdkRef.current.goToStep(step);
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to go to step', err as Error);
      setError(kycError);
    }
  }, []);

  // Update data
  const updateData = useCallback((updates: Partial<KYCData>) => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setError(null);
      sdkRef.current.updateData(updates);
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to update data', err as Error);
      setError(kycError);
    }
  }, []);

  // Complete verification
  const completeVerification = useCallback(async (): Promise<KYCVerificationResult> => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await sdkRef.current.completeVerification();
      return result;
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to complete verification', err as Error);
      setError(kycError);
      throw kycError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset
  const reset = useCallback(() => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setError(null);
      sdkRef.current.reset();
      
      // Reset local state
      setCurrentStep('welcome');
      setData({
        idType: '',
        idFront: null,
        idBack: null,
        selfie: null,
        ocrData: {
          fullName: '',
          dateOfBirth: '',
          dateOfExpiry: '2025-12-31',
          gender: '',
          idNumber: '',
          issuingAuthority: 'Government of Ethiopia'
        }
      });
      setSession(null);
      setVerificationResult(null);
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to reset', err as Error);
      setError(kycError);
    }
  }, []);

  // Destroy
  const destroy = useCallback(() => {
    if (sdkRef.current) {
      sdkRef.current.destroy();
      sdkRef.current = null;
    }
    
    setSdk(null);
    setIsInitialized(false);
    setIsLoading(false);
    setError(null);
    setCurrentStep('welcome');
    setData({
      idType: '',
      idFront: null,
      idBack: null,
      selfie: null,
      ocrData: {
        fullName: '',
        dateOfBirth: '',
        dateOfExpiry: '2025-12-31',
        gender: '',
        idNumber: '',
        issuingAuthority: 'Government of Ethiopia'
      }
    });
    setProgress({
      currentStep: 'welcome',
      currentStepIndex: 0,
      totalSteps: 9,
      progressSteps: [],
      canGoNext: false,
      canGoBack: false
    });
    setSession(null);
    setVerificationResult(null);
  }, []);

  // Update credentials
  const updateCredentials = useCallback((auth: KYCAuthConfig) => {
    if (!sdkRef.current) {
      throw new KYCError('SDK not initialized');
    }

    try {
      setError(null);
      sdkRef.current.updateCredentials(auth);
    } catch (err) {
      const kycError = err instanceof KYCError ? err : new KYCError('Failed to update credentials', err as Error);
      setError(kycError);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy();
      }
    };
  }, []);

  return {
    sdk,
    isInitialized,
    isLoading,
    error,
    currentStep,
    data,
    progress,
    session,
    verificationResult,
    initialize,
    startVerification,
    nextStep,
    previousStep,
    goToStep,
    updateData,
    completeVerification,
    reset,
    destroy,
    updateCredentials
  };
}
