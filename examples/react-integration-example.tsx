import React, { useState, useEffect } from 'react';
import { 
  KYCProvider, 
  KYCWidget, 
  useKYCSDK 
} from '../index';

// Example configuration for localhost testing
const KYC_CONFIG = {
  auth: {
    apiKey: 'sk_92rh4yzyzn70cfmff8jht823294yq1102tgkyg9c87qn87bef7df8bda74113b3a8a13200c849dbteam0574ck4u7h58bc4431',
    tenantId: 'test-tenant',   // Optional: Replace with your tenant ID
    userId: 'test-user-123'    // Optional: Replace with your user ID
  },
  apiBaseUrl: 'http://localhost:3003', // Local development server
  enableAutoOCR: true,
  enableFaceVerification: true,
  enableLocalStorage: true,
  debug: true,
  customStyles: {
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    theme: 'light' as const
  }
};

// Custom KYC Component using the hook
function CustomKYCComponent() {
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
    reset
  } = useKYCSDK(KYC_CONFIG);

  if (isLoading) {
    return (
      <div className="kyc-loading">
        <div className="spinner"></div>
        <p>Initializing KYC SDK...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kyc-error">
        <h3>❌ Error</h3>
        <p>{error.message}</p>
        <button onClick={reset}>Try Again</button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="kyc-not-initialized">
        <h3>SDK Not Initialized</h3>
        <p>Please wait for the SDK to initialize...</p>
      </div>
    );
  }

  return (
    <div className="custom-kyc">
      <div className="kyc-header">
        <h2>🔐 Custom KYC Verification</h2>
        <div className="kyc-status">
          <span className="status-badge success">Ready</span>
          <span className="step-indicator">Step {progress.currentStepIndex + 1} of {progress.totalSteps}</span>
        </div>
      </div>

      <div className="kyc-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((progress.currentStepIndex + 1) / progress.totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progress.progressSteps[progress.currentStepIndex]?.title || 'Unknown Step'}
        </div>
      </div>

      <div className="kyc-content">
        {currentStep === 'welcome' && (
          <div className="kyc-step welcome-step">
            <h3>Welcome to KYC Verification</h3>
            <p>Please complete the following steps to verify your identity:</p>
            <ul>
              <li>Select your ID type</li>
              <li>Capture front and back images</li>
              <li>Review extracted data</li>
              <li>Take a selfie</li>
              <li>Complete verification</li>
            </ul>
            <button onClick={nextStep} className="btn-primary">
              Get Started
            </button>
          </div>
        )}

        {currentStep === 'idTypeSelection' && (
          <div className="kyc-step id-selection-step">
            <h3>Select ID Type</h3>
            <div className="id-options">
              <label className="id-option">
                <input
                  type="radio"
                  name="idType"
                  value="national_id"
                  checked={data.idType === 'national_id'}
                  onChange={(e) => updateData({ idType: e.target.value })}
                />
                <span className="option-content">
                  <strong>National ID</strong>
                  <small>Ethiopian National ID Card</small>
                </span>
              </label>
              <label className="id-option">
                <input
                  type="radio"
                  name="idType"
                  value="passport"
                  checked={data.idType === 'passport'}
                  onChange={(e) => updateData({ idType: e.target.value })}
                />
                <span className="option-content">
                  <strong>Passport</strong>
                  <small>International Passport</small>
                </span>
              </label>
              <label className="id-option">
                <input
                  type="radio"
                  name="idType"
                  value="driver_license"
                  checked={data.idType === 'driver_license'}
                  onChange={(e) => updateData({ idType: e.target.value })}
                />
                <span className="option-content">
                  <strong>Driver License</strong>
                  <small>Driver License</small>
                </span>
              </label>
            </div>
            <div className="step-actions">
              <button onClick={previousStep} className="btn-secondary">
                Back
              </button>
              <button 
                onClick={nextStep} 
                className="btn-primary"
                disabled={!data.idType}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'idScanFront' && (
          <div className="kyc-step scan-step">
            <h3>Scan Front of ID</h3>
            <p>Please capture a clear image of the front side of your {data.idType}</p>
            <div className="camera-placeholder">
              <div className="camera-icon">📷</div>
              <p>Camera functionality would be implemented here</p>
              <p>For demo: Simulating image capture...</p>
            </div>
            <div className="step-actions">
              <button onClick={previousStep} className="btn-secondary">
                Back
              </button>
              <button 
                onClick={() => {
                  // Simulate image capture
                  const mockFile = new File(['mock front image'], 'front.jpg', { type: 'image/jpeg' });
                  updateData({ idFront: mockFile });
                  nextStep();
                }} 
                className="btn-primary"
              >
                Capture & Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'idScanBack' && (
          <div className="kyc-step scan-step">
            <h3>Scan Back of ID</h3>
            <p>Please capture a clear image of the back side of your {data.idType}</p>
            <div className="camera-placeholder">
              <div className="camera-icon">📷</div>
              <p>Camera functionality would be implemented here</p>
              <p>For demo: Simulating image capture...</p>
            </div>
            <div className="step-actions">
              <button onClick={previousStep} className="btn-secondary">
                Back
              </button>
              <button 
                onClick={() => {
                  // Simulate image capture
                  const mockFile = new File(['mock back image'], 'back.jpg', { type: 'image/jpeg' });
                  updateData({ idBack: mockFile });
                  nextStep();
                }} 
                className="btn-primary"
              >
                Capture & Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'ocrPreview' && (
          <div className="kyc-step ocr-step">
            <h3>Review Extracted Data</h3>
            <p>Please review the information extracted from your ID:</p>
            <div className="ocr-data">
              <div className="data-row">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={data.ocrData?.fullName || ''}
                  onChange={(e) => updateData({ 
                    ocrData: { 
                      fullName: e.target.value,
                      dateOfBirth: data.ocrData?.dateOfBirth || '1990-01-01',
                      idNumber: data.ocrData?.idNumber || '123456789',
                      gender: data.ocrData?.gender || 'Male',
                      dateOfExpiry: data.ocrData?.dateOfExpiry || '2025-12-31',
                      issuingAuthority: data.ocrData?.issuingAuthority || 'Government of Ethiopia'
                    } 
                  })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="data-row">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={data.ocrData?.dateOfBirth || ''}
                  onChange={(e) => updateData({ 
                    ocrData: { 
                      fullName: data.ocrData?.fullName || 'John Doe',
                      dateOfBirth: e.target.value,
                      idNumber: data.ocrData?.idNumber || '123456789',
                      gender: data.ocrData?.gender || 'Male',
                      dateOfExpiry: data.ocrData?.dateOfExpiry || '2025-12-31',
                      issuingAuthority: data.ocrData?.issuingAuthority || 'Government of Ethiopia'
                    } 
                  })}
                />
              </div>
              <div className="data-row">
                <label>ID Number:</label>
                <input
                  type="text"
                  value={data.ocrData?.idNumber || ''}
                  onChange={(e) => updateData({ 
                    ocrData: { 
                      fullName: data.ocrData?.fullName || 'John Doe',
                      dateOfBirth: data.ocrData?.dateOfBirth || '1990-01-01',
                      idNumber: e.target.value,
                      gender: data.ocrData?.gender || 'Male',
                      dateOfExpiry: data.ocrData?.dateOfExpiry || '2025-12-31',
                      issuingAuthority: data.ocrData?.issuingAuthority || 'Government of Ethiopia'
                    } 
                  })}
                  placeholder="Enter ID number"
                />
              </div>
            </div>
            <div className="step-actions">
              <button onClick={previousStep} className="btn-secondary">
                Back
              </button>
              <button onClick={nextStep} className="btn-primary">
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'selfie' && (
          <div className="kyc-step selfie-step">
            <h3>Take Selfie</h3>
            <p>Please take a clear selfie for face verification</p>
            <div className="camera-placeholder">
              <div className="camera-icon">🤳</div>
              <p>Camera functionality would be implemented here</p>
              <p>For demo: Simulating selfie capture...</p>
            </div>
            <div className="step-actions">
              <button onClick={previousStep} className="btn-secondary">
                Back
              </button>
              <button 
                onClick={() => {
                  // Simulate selfie capture
                  const mockFile = new File(['mock selfie'], 'selfie.jpg', { type: 'image/jpeg' });
                  updateData({ selfie: mockFile });
                  nextStep();
                }} 
                className="btn-primary"
              >
                Capture & Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="kyc-step review-step">
            <h3>Review & Submit</h3>
            <p>Please review all information before submitting:</p>
            <div className="review-summary">
              <div className="summary-item">
                <strong>ID Type:</strong> {data.idType}
              </div>
              <div className="summary-item">
                <strong>Front Image:</strong> {data.idFront ? '✅ Captured' : '❌ Missing'}
              </div>
              <div className="summary-item">
                <strong>Back Image:</strong> {data.idBack ? '✅ Captured' : '❌ Missing'}
              </div>
              <div className="summary-item">
                <strong>Selfie:</strong> {data.selfie ? '✅ Captured' : '❌ Missing'}
              </div>
              <div className="summary-item">
                <strong>Name:</strong> {data.ocrData?.fullName || 'Not provided'}
              </div>
              <div className="summary-item">
                <strong>ID Number:</strong> {data.ocrData?.idNumber || 'Not provided'}
              </div>
            </div>
            <div className="step-actions">
              <button onClick={previousStep} className="btn-secondary">
                Back
              </button>
              <button onClick={nextStep} className="btn-primary">
                Submit for Verification
              </button>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="kyc-step processing-step">
            <h3>Processing Verification</h3>
            <div className="processing-animation">
              <div className="spinner"></div>
              <p>Please wait while we verify your information...</p>
              <p className="processing-status">This may take a few moments</p>
            </div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="kyc-step result-step">
            <h3>Verification Complete!</h3>
            <div className="result-content">
              <div className="result-icon success">✅</div>
              <h4>Verification Successful</h4>
              <p>Your identity has been verified successfully.</p>
              <div className="verification-details">
                <p><strong>Verification ID:</strong> VER-{Date.now()}</p>
                <p><strong>Completed:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div className="step-actions">
              <button onClick={reset} className="btn-primary">
                Start New Verification
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="kyc-footer">
        <button onClick={reset} className="btn-reset">
          Reset Verification
        </button>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [useCustomUI, setUseCustomUI] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔐 KYC SDK React Integration</h1>
        <p>Complete KYC verification flow with React</p>
      </header>

      <main className="app-main">
        <div className="ui-toggle">
          <label>
            <input
              type="checkbox"
              checked={useCustomUI}
              onChange={(e) => setUseCustomUI(e.target.checked)}
            />
            Use Custom UI (instead of default KYCWidget)
          </label>
        </div>

        <KYCProvider config={KYC_CONFIG}>
          {useCustomUI ? (
            <CustomKYCComponent />
          ) : (
            <div className="widget-container">
              <h2>🎯 Default KYC Widget</h2>
              <KYCWidget 
                onComplete={(result) => {
                  console.log('KYC completed:', result);
                  alert('KYC verification completed successfully!');
                }}
                onError={(error) => {
                  console.error('KYC error:', error);
                  alert(`KYC error: ${error.message}`);
                }}
              />
            </div>
          )}
        </KYCProvider>
      </main>

      <footer className="app-footer">
        <p>
          <strong>Note:</strong> Replace 'YOUR_API_KEY_HERE' with your actual API key in the KYC_CONFIG
        </p>
      </footer>
    </div>
  );
}

export default App;
