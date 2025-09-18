// KYC Provider Component
import React, { createContext, useContext, ReactNode } from 'react';
import { KYCConfig } from '../types/KYCConfig';
import { useKYCSDK, UseKYCSDKReturn } from '../hooks/useKYCSDK';

interface KYCContextValue extends UseKYCSDKReturn {
  config: KYCConfig;
}

const KYCContext = createContext<KYCContextValue | null>(null);

interface KYCProviderProps {
  config: KYCConfig;
  children: ReactNode;
}

export function KYCProvider({ config, children }: KYCProviderProps) {
  const sdkHook = useKYCSDK(config);

  const contextValue: KYCContextValue = {
    ...sdkHook,
    config
  };

  return (
    <KYCContext.Provider value={contextValue}>
      {children}
    </KYCContext.Provider>
  );
}

export function useKYCContext(): KYCContextValue {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYCContext must be used within a KYCProvider');
  }
  return context;
}
