#!/usr/bin/env node

/**
 * KYC SDK Node.js Integration Example
 * 
 * This example demonstrates how to use the KYC SDK in a Node.js environment
 * with your valid API key.
 * 
 * Usage:
 * 1. Replace 'YOUR_API_KEY_HERE' with your actual API key
 * 2. Run: node node-integration.js
 */

// Mock browser APIs for Node.js
global.fetch = require('node-fetch');
global.File = class File {
  constructor(content, name, options = {}) {
    this.content = content;
    this.name = name;
    this.type = options.type || 'application/octet-stream';
    this.size = content.length;
  }
};
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }
  append(key, value) {
    this.data.set(key, value);
  }
  get(key) {
    return this.data.get(key);
  }
};

console.log('🚀 KYC SDK Node.js Integration Example');
console.log('=====================================\n');

async function runKYCSDKExample() {
  try {
    // Import the SDK
    console.log('📦 Importing KYC SDK...');
    const { KYCWebSDK, KYCValidator } = await import('./index.js');
    console.log('✅ SDK imported successfully\n');

    // Configuration - REPLACE WITH YOUR ACTUAL API KEY
    const config = {
      auth: {
        apiKey: 'YOUR_API_KEY_HERE', // 🔑 Replace this with your valid API key
        tenantId: 'your-tenant-id',   // Optional: Replace with your tenant ID
        userId: 'user-123'            // Optional: Replace with your user ID
      },
      apiBaseUrl: 'https://api.addisverify.com',
      enableAutoOCR: true,
      enableFaceVerification: true,
      enableLocalStorage: false, // Disabled for Node.js
      debug: true,
      timeout: 30000,
      retryAttempts: 3
    };

    // Validate configuration
    console.log('🔍 Validating configuration...');
    const validator = new KYCValidator();
    validator.validateConfig(config);
    validator.validateCredentials(config.auth);
    console.log('✅ Configuration validation passed\n');

    // Create SDK instance
    console.log('🏗️ Creating SDK instance...');
    const kycSDK = new KYCWebSDK(config);
    console.log('✅ SDK instance created\n');

    // Initialize SDK
    console.log('🚀 Initializing SDK...');
    await kycSDK.initialize();
    console.log('✅ SDK initialized successfully\n');

    // Display SDK information
    console.log('📋 SDK Information:');
    const credentialsInfo = kycSDK.getCredentialsInfo();
    console.log(`   - Has API Key: ${credentialsInfo.hasApiKey}`);
    console.log(`   - Tenant ID: ${credentialsInfo.tenantId || 'Not set'}`);
    console.log(`   - User ID: ${credentialsInfo.userId || 'Not set'}`);
    console.log('');

    // Display initial state
    console.log('📊 Initial State:');
    const initialState = kycSDK.getCurrentStep();
    const initialData = kycSDK.getData();
    const initialProgress = kycSDK.getProgress();
    
    console.log(`   - Current Step: ${initialState}`);
    console.log(`   - Progress: ${initialProgress.currentStepIndex + 1}/${initialProgress.totalSteps}`);
    console.log(`   - Can Go Next: ${initialProgress.canGoNext}`);
    console.log(`   - Can Go Back: ${initialProgress.canGoBack}`);
    console.log('');

    // Simulate starting verification
    console.log('🎯 Starting verification process...');
    await kycSDK.startVerification();
    console.log('✅ Verification started\n');

    // Display updated state
    console.log('📊 Updated State:');
    const updatedState = kycSDK.getCurrentStep();
    const updatedProgress = kycSDK.getProgress();
    
    console.log(`   - Current Step: ${updatedState}`);
    console.log(`   - Progress: ${updatedProgress.currentStepIndex + 1}/${updatedProgress.totalSteps}`);
    console.log('');

    // Simulate step navigation
    console.log('🔄 Simulating step navigation...');
    
    // Go to ID type selection
    kycSDK.goToStep('idTypeSelection');
    console.log(`   - Navigated to: ${kycSDK.getCurrentStep()}`);
    
    // Update data
    kycSDK.updateData({ idType: 'national_id' });
    console.log('   - Updated ID type to: national_id');
    
    // Go to front scan
    kycSDK.goToStep('idScanFront');
    console.log(`   - Navigated to: ${kycSDK.getCurrentStep()}`);
    
    // Simulate file capture
    const mockFile = new File(['mock image data'], 'front.jpg', { type: 'image/jpeg' });
    kycSDK.updateData({ idFront: mockFile });
    console.log('   - Simulated front image capture');
    
    // Go to back scan
    kycSDK.goToStep('idScanBack');
    console.log(`   - Navigated to: ${kycSDK.getCurrentStep()}`);
    
    // Simulate back image capture
    const mockBackFile = new File(['mock back image data'], 'back.jpg', { type: 'image/jpeg' });
    kycSDK.updateData({ idBack: mockBackFile });
    console.log('   - Simulated back image capture');
    
    // Go to OCR preview
    kycSDK.goToStep('ocrPreview');
    console.log(`   - Navigated to: ${kycSDK.getCurrentStep()}`);
    
    // Simulate OCR data
    const mockOCRData = {
      fullName: 'John Doe',
      dateOfBirth: '1990-01-01',
      dateOfExpiry: '2025-12-31',
      gender: 'Male',
      idNumber: '123456789',
      issuingAuthority: 'Government of Ethiopia'
    };
    kycSDK.updateData({ ocrData: mockOCRData });
    console.log('   - Simulated OCR data extraction');
    
    // Go to selfie
    kycSDK.goToStep('selfie');
    console.log(`   - Navigated to: ${kycSDK.getCurrentStep()}`);
    
    // Simulate selfie capture
    const mockSelfie = new File(['mock selfie data'], 'selfie.jpg', { type: 'image/jpeg' });
    kycSDK.updateData({ selfie: mockSelfie });
    console.log('   - Simulated selfie capture');
    
    // Go to review
    kycSDK.goToStep('review');
    console.log(`   - Navigated to: ${kycSDK.getCurrentStep()}`);
    
    // Validate current step
    const validationResult = validator.validateStep('review', kycSDK.getData());
    console.log(`   - Step validation: ${validationResult.isValid ? 'PASSED' : 'FAILED'}`);
    if (!validationResult.isValid) {
      console.log(`   - Validation errors: ${validationResult.errors.join(', ')}`);
    }
    
    console.log('');

    // Display final state
    console.log('📊 Final State:');
    const finalState = kycSDK.getState();
    const finalProgress = kycSDK.getProgress();
    
    console.log(`   - Current Step: ${finalState.currentStep}`);
    console.log(`   - Progress: ${finalProgress.currentStepIndex + 1}/${finalProgress.totalSteps}`);
    console.log(`   - Total Steps: ${finalProgress.totalSteps}`);
    console.log(`   - Can Go Next: ${finalProgress.canGoNext}`);
    console.log(`   - Can Go Back: ${finalProgress.canGoBack}`);
    console.log('');

    // Display captured data
    console.log('📋 Captured Data:');
    const finalData = kycSDK.getData();
    console.log(`   - ID Type: ${finalData.idType}`);
    console.log(`   - Front Image: ${finalData.idFront ? 'Captured' : 'Not captured'}`);
    console.log(`   - Back Image: ${finalData.idBack ? 'Captured' : 'Not captured'}`);
    console.log(`   - Selfie: ${finalData.selfie ? 'Captured' : 'Not captured'}`);
    console.log(`   - OCR Data: ${finalData.ocrData ? 'Available' : 'Not available'}`);
    
    if (finalData.ocrData) {
      console.log(`     - Full Name: ${finalData.ocrData.fullName}`);
      console.log(`     - Date of Birth: ${finalData.ocrData.dateOfBirth}`);
      console.log(`     - ID Number: ${finalData.ocrData.idNumber}`);
    }
    console.log('');

    // Test reset functionality
    console.log('🔄 Testing reset functionality...');
    kycSDK.reset();
    const resetState = kycSDK.getCurrentStep();
    const resetData = kycSDK.getData();
    console.log(`   - Reset to step: ${resetState}`);
    console.log(`   - Data cleared: ${resetData.idType === '' ? 'Yes' : 'No'}`);
    console.log('');

    // Clean up
    console.log('🧹 Cleaning up...');
    kycSDK.destroy();
    console.log('✅ SDK destroyed successfully');
    console.log('');

    console.log('🎉 KYC SDK integration example completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Replace "YOUR_API_KEY_HERE" with your actual API key');
    console.log('   2. Update the API base URL if needed');
    console.log('   3. Add your tenant ID and user ID if required');
    console.log('   4. Integrate with your actual backend API');
    console.log('   5. Handle real file uploads and API responses');

  } catch (error) {
    console.error('❌ Error running KYC SDK example:', error.message);
    
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    
    if (error.details) {
      console.error(`   Details: ${error.details}`);
    }
    
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Make sure you have a valid API key');
    console.error('   2. Check your internet connection');
    console.error('   3. Verify the API base URL is correct');
    console.error('   4. Ensure all required dependencies are installed');
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the example
runKYCSDKExample().catch(error => {
  console.error('Failed to run example:', error);
  process.exit(1);
});
