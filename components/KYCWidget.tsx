// KYC Widget Component
import React, { useEffect, useState } from 'react';
import { useKYCContext } from './KYCProvider';
import { KYCStep } from '../types/KYCTypes';

interface KYCWidgetProps {
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  onStepChange?: (step: KYCStep) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function KYCWidget({ 
  onComplete, 
  onError, 
  onStepChange, 
  className = '', 
  style = {} 
}: KYCWidgetProps) {
  const {
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
    config
  } = useKYCContext();

  const [isStarted, setIsStarted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  // Handle step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle completion
  useEffect(() => {
    if (verificationResult && onComplete) {
      onComplete(verificationResult);
    }
  }, [verificationResult, onComplete]);

  // Start verification when initialized
  useEffect(() => {
    if (isInitialized && !isStarted) {
      startVerification().then(() => {
        setIsStarted(true);
      }).catch(console.error);
    }
  }, [isInitialized, isStarted, startVerification]);

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="kyc-loading">
          <div className="kyc-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="kyc-error">
          <h3>Error</h3>
          <p>{error.message}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      );
    }

    switch (currentStep) {
      case 'welcome':
        return (
          <div className="kyc-welcome">
            <h2>Welcome to KYC Verification</h2>
            <p>Please complete your identity verification to continue.</p>
            <button onClick={() => nextStep()}>Start Verification</button>
          </div>
        );

      case 'idTypeSelection':
        return (
          <div className="kyc-id-selection">
            <h3>Select ID Type</h3>
            <div className="kyc-id-options">
              {config.supportedIDTypes?.map((idType) => (
                <button
                  key={idType.id}
                  onClick={() => {
                    updateData({ idType: idType.id });
                    nextStep();
                  }}
                  className="kyc-id-option"
                >
                  <h4>{idType.name}</h4>
                  <p>{idType.description}</p>
                </button>
              ))}
            </div>
            <button onClick={previousStep}>Back</button>
          </div>
        );

      case 'idScanFront':
        return (
          <div className="kyc-scan">
            <h3>Scan Front of ID</h3>
            <p>Please capture a clear photo of the front of your {data.idType}.</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateData({ idFront: file });
                  nextStep();
                }
              }}
            />
            <button onClick={previousStep}>Back</button>
          </div>
        );

      case 'idScanBack':
        return (
          <div className="kyc-scan">
            <h3>Scan Back of ID</h3>
            <p>Please capture a clear photo of the back of your {data.idType}.</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateData({ idBack: file });
                  nextStep();
                }
              }}
            />
            <button onClick={previousStep}>Back</button>
          </div>
        );

      case 'ocrPreview':
        return (
          <div className="kyc-ocr-preview">
            <h3>Review Information</h3>
            <div className="kyc-ocr-data">
              <div>
                <label>Full Name:</label>
                <input
                  type="text"
                  value={data.ocrData.fullName}
                  onChange={(e) => updateData({
                    ocrData: { ...data.ocrData, fullName: e.target.value }
                  })}
                />
              </div>
              <div>
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={data.ocrData.dateOfBirth}
                  onChange={(e) => updateData({
                    ocrData: { ...data.ocrData, dateOfBirth: e.target.value }
                  })}
                />
              </div>
              <div>
                <label>ID Number:</label>
                <input
                  type="text"
                  value={data.ocrData.idNumber}
                  onChange={(e) => updateData({
                    ocrData: { ...data.ocrData, idNumber: e.target.value }
                  })}
                />
              </div>
            </div>
            <button onClick={() => nextStep()}>Continue</button>
            <button onClick={previousStep}>Back</button>
          </div>
        );

      case 'selfie':
        return (
          <div className="kyc-selfie">
            <h3>Take Selfie</h3>
            <p>Please take a photo of yourself for verification.</p>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateData({ selfie: file });
                  nextStep();
                }
              }}
            />
            <button onClick={previousStep}>Back</button>
          </div>
        );

      case 'review':
        return (
          <div className="kyc-review">
            <h3>Review & Confirm</h3>
            <div className="kyc-review-data">
              <p><strong>ID Type:</strong> {data.idType}</p>
              <p><strong>Name:</strong> {data.ocrData.fullName}</p>
              <p><strong>ID Number:</strong> {data.ocrData.idNumber}</p>
            </div>
            <button onClick={() => nextStep()}>Confirm & Submit</button>
            <button onClick={previousStep}>Back</button>
          </div>
        );

      case 'processing':
        return (
          <div className="kyc-processing">
            <div className="kyc-spinner"></div>
            <h3>Processing Verification</h3>
            <p>Please wait while we verify your identity...</p>
          </div>
        );

      case 'result':
        return (
          <div className="kyc-result">
            <h3>Verification Result</h3>
            {verificationResult && (
              <div className={`kyc-result-status kyc-${verificationResult.status}`}>
                <h4>{verificationResult.status.toUpperCase()}</h4>
                <p>{verificationResult.message}</p>
              </div>
            )}
            <button onClick={reset}>Start New Verification</button>
          </div>
        );

      default:
        return (
          <div className="kyc-unknown">
            <p>Unknown step: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`kyc-widget ${className}`}
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        ...style
      }}
    >
      {renderStep()}
      
      {/* Progress indicator */}
      {progress.progressSteps.length > 0 && (
        <div className="kyc-progress">
          <div className="kyc-progress-bar">
            {progress.progressSteps.map((step, index) => (
              <div
                key={step.step}
                className={`kyc-progress-step ${
                  step.isCompleted ? 'completed' : 
                  step.isCurrent ? 'current' : ''
                }`}
              >
                <span className="kyc-step-number">{index + 1}</span>
                <span className="kyc-step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
