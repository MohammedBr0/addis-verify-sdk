// React Integration Example
import React, { useState } from 'react';
import { KYCProvider, KYCWidget, useKYCSDK, KYCConfig } from '../index';

// Example 1: Using KYCWidget component
function KYCDemoApp() {
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const config: KYCConfig = {
    auth: {
      apiKey: 'your-api-key-here',
      tenantId: 'your-tenant-id',
      userId: 'user-123'
    },
    apiBaseUrl: 'https://api.addisverify.com',
    enableAutoOCR: true,
    enableFaceVerification: true,
    enableLocalStorage: true,
    customStyles: {
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      backgroundColor: '#F8FAFC',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'rounded',
      theme: 'light'
    }
  };

  const handleComplete = (result: any) => {
    setVerificationResult(result);
    console.log('Verification completed:', result);
  };

  const handleError = (error: Error) => {
    setError(error);
    console.error('Verification error:', error);
  };

  const handleStepChange = (step: string) => {
    console.log('Step changed to:', step);
  };

  return (
    <div className="app">
      <h1>KYC Verification Demo</h1>
      
      {error && (
        <div className="error-banner">
          <h3>Error</h3>
          <p>{error.message}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {verificationResult && (
        <div className="result-banner">
          <h3>Verification Result</h3>
          <p>Status: {verificationResult.status}</p>
          <p>Message: {verificationResult.message}</p>
          <button onClick={() => setVerificationResult(null)}>Start New Verification</button>
        </div>
      )}

      <KYCProvider config={config}>
        <KYCWidget 
          onComplete={handleComplete}
          onError={handleError}
          onStepChange={handleStepChange}
          className="custom-kyc-widget"
          style={{ 
            maxWidth: '600px',
            margin: '20px auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        />
      </KYCProvider>
    </div>
  );
}

// Example 2: Using useKYCSDK hook for custom UI
function CustomKYCDemo() {
  const {
    isInitialized,
    isLoading,
    error,
    currentStep,
    data,
    progress,
    nextStep,
    previousStep,
    updateData,
    completeVerification,
    reset
  } = useKYCSDK({
    auth: {
      apiKey: 'your-api-key-here',
      tenantId: 'your-tenant-id'
    },
    apiBaseUrl: 'https://api.addisverify.com',
    enableAutoOCR: true,
    enableFaceVerification: true
  } as KYCConfig);

  const [isStarted, setIsStarted] = useState(false);

  React.useEffect(() => {
    if (isInitialized && !isStarted) {
      setIsStarted(true);
    }
  }, [isInitialized, isStarted]);

  if (!isInitialized) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Initializing KYC SDK...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error.message}</p>
        <button onClick={reset}>Try Again</button>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="step-content">
            <h2>Welcome to KYC Verification</h2>
            <p>Please complete your identity verification to continue.</p>
            <button 
              onClick={nextStep}
              disabled={isLoading}
              className="primary-button"
            >
              {isLoading ? 'Loading...' : 'Start Verification'}
            </button>
          </div>
        );

      case 'idTypeSelection':
        return (
          <div className="step-content">
            <h3>Select ID Type</h3>
            <div className="id-options">
              {['national_id', 'passport', 'driver_license'].map((idType) => (
                <button
                  key={idType}
                  onClick={() => {
                    updateData({ idType });
                    nextStep();
                  }}
                  className="id-option"
                >
                  {idType.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={previousStep} className="secondary-button">
              Back
            </button>
          </div>
        );

      case 'idScanFront':
        return (
          <div className="step-content">
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
              className="file-input"
            />
            <button onClick={previousStep} className="secondary-button">
              Back
            </button>
          </div>
        );

      case 'idScanBack':
        return (
          <div className="step-content">
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
              className="file-input"
            />
            <button onClick={previousStep} className="secondary-button">
              Back
            </button>
          </div>
        );

      case 'ocrPreview':
        return (
          <div className="step-content">
            <h3>Review Information</h3>
            <div className="ocr-form">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={data.ocrData.fullName}
                  onChange={(e) => updateData({
                    ocrData: { ...data.ocrData, fullName: e.target.value }
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={data.ocrData.dateOfBirth}
                  onChange={(e) => updateData({
                    ocrData: { ...data.ocrData, dateOfBirth: e.target.value }
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>ID Number:</label>
                <input
                  type="text"
                  value={data.ocrData.idNumber}
                  onChange={(e) => updateData({
                    ocrData: { ...data.ocrData, idNumber: e.target.value }
                  })}
                  className="form-input"
                />
              </div>
            </div>
            <button onClick={nextStep} className="primary-button">
              Continue
            </button>
            <button onClick={previousStep} className="secondary-button">
              Back
            </button>
          </div>
        );

      case 'selfie':
        return (
          <div className="step-content">
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
              className="file-input"
            />
            <button onClick={previousStep} className="secondary-button">
              Back
            </button>
          </div>
        );

      case 'review':
        return (
          <div className="step-content">
            <h3>Review & Confirm</h3>
            <div className="review-data">
              <p><strong>ID Type:</strong> {data.idType}</p>
              <p><strong>Name:</strong> {data.ocrData.fullName}</p>
              <p><strong>ID Number:</strong> {data.ocrData.idNumber}</p>
            </div>
            <button onClick={nextStep} className="primary-button">
              Confirm & Submit
            </button>
            <button onClick={previousStep} className="secondary-button">
              Back
            </button>
          </div>
        );

      case 'processing':
        return (
          <div className="step-content">
            <div className="spinner"></div>
            <h3>Processing Verification</h3>
            <p>Please wait while we verify your identity...</p>
          </div>
        );

      case 'result':
        return (
          <div className="step-content">
            <h3>Verification Complete</h3>
            <p>Your verification has been processed successfully.</p>
            <button onClick={reset} className="primary-button">
              Start New Verification
            </button>
          </div>
        );

      default:
        return (
          <div className="step-content">
            <p>Unknown step: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div className="custom-kyc-demo">
      <h1>Custom KYC Verification</h1>
      
      {/* Progress indicator */}
      {progress.progressSteps.length > 0 && (
        <div className="progress-bar">
          {progress.progressSteps.map((step, index) => (
            <div
              key={step.step}
              className={`progress-step ${
                step.isCompleted ? 'completed' : 
                step.isCurrent ? 'current' : ''
              }`}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="step-container">
        {renderStepContent()}
      </div>
    </div>
  );
}

// Example 3: App with both approaches
function App() {
  const [demoType, setDemoType] = useState<'widget' | 'custom'>('widget');

  return (
    <div className="app">
      <header>
        <h1>KYC SDK Demo</h1>
        <nav>
          <button 
            onClick={() => setDemoType('widget')}
            className={demoType === 'widget' ? 'active' : ''}
          >
            Widget Demo
          </button>
          <button 
            onClick={() => setDemoType('custom')}
            className={demoType === 'custom' ? 'active' : ''}
          >
            Custom Demo
          </button>
        </nav>
      </header>

      <main>
        {demoType === 'widget' ? <KYCDemoApp /> : <CustomKYCDemo />}
      </main>
    </div>
  );
}

export default App;
