// Basic Usage Example
import { KYCWebSDK } from '../index';

async function basicKYCDemo() {
  // Initialize the SDK
  const kycSDK = new KYCWebSDK({
    auth: {
      apiKey: 'your-api-key-here',
      tenantId: 'your-tenant-id',
      userId: 'user-123'
    },
    apiBaseUrl: 'https://api.addisverify.com',
    enableAutoOCR: true,
    enableFaceVerification: true,
    enableLocalStorage: true,
    debug: true,
    onStepChange: (step, data) => {
      console.log('Step changed to:', step);
      console.log('Current data:', data);
    },
    onProgressUpdate: (progress) => {
      console.log('Progress updated:', progress);
    },
    onVerificationComplete: (result) => {
      console.log('Verification completed:', result);
    },
    onError: (error) => {
      console.error('KYC Error:', error);
    }
  });

  try {
    // Initialize the SDK
    await kycSDK.initialize();
    console.log('SDK initialized successfully');

    // Start verification process
    await kycSDK.startVerification();
    console.log('Verification started');

    // Get current state
    const currentStep = kycSDK.getCurrentStep();
    const data = kycSDK.getData();
    const progress = kycSDK.getProgress();

    console.log('Current step:', currentStep);
    console.log('Current data:', data);
    console.log('Progress:', progress);

    // Example: Update data
    kycSDK.updateData({
      idType: 'national_id'
    });

    // Example: Navigate to next step
    await kycSDK.nextStep();

    // Example: Complete verification
    const result = await kycSDK.completeVerification();
    console.log('Verification result:', result);

  } catch (error) {
    console.error('Error in KYC demo:', error);
  } finally {
    // Clean up
    kycSDK.destroy();
  }
}

// Run the demo
basicKYCDemo();
