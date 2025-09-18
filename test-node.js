#!/usr/bin/env node

// Node.js test script for KYC SDK
// Run with: npx ts-node test-node.ts

console.log('🧪 KYC SDK Node.js Test Suite');
console.log('================================\n');

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

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTest(testName, testFunction) {
  console.log(`\n🧪 Running: ${testName}`);
  console.log('─'.repeat(50));
  
  try {
    await testFunction();
    testResults.passed++;
    log(`${testName} PASSED`, 'success');
    return true;
  } catch (error) {
    testResults.failed++;
    log(`${testName} FAILED: ${error.message}`, 'error');
    return false;
  }
}

// Test 1: Basic SDK Creation
async function testBasicSDKCreation() {
  const { KYCWebSDK } = await import('./KYCWebSDK.ts');
  
  const sdk = new KYCWebSDK({
    auth: {
      apiKey: 'test-api-key-12345',
      tenantId: 'test-tenant',
      userId: 'test-user'
    },
    apiBaseUrl: 'http://localhost:3003',
    enableLocalStorage: false,
    debug: true
  });
  
  assert(sdk, 'SDK instance should be created');
  assert(typeof sdk.initialize === 'function', 'SDK should have initialize method');
  assert(typeof sdk.startVerification === 'function', 'SDK should have startVerification method');
  
  log('SDK instance created successfully');
}

// Test 2: SDK Configuration
async function testSDKConfiguration() {
  const { KYCWebSDK } = await import('./KYCWebSDK.ts');
  
  const config = {
    auth: {
      apiKey: 'test-api-key-12345',
      tenantId: 'test-tenant'
    },
    apiBaseUrl: 'http://localhost:3003',
    enableAutoOCR: true,
    enableFaceVerification: true,
    enableLocalStorage: false
  };
  
  const sdk = new KYCWebSDK(config);
  
  // Test that configuration is properly set
  const credentialsInfo = sdk.getCredentialsInfo();
  assert(credentialsInfo.hasApiKey, 'API key should be set');
  assert(credentialsInfo.tenantId === 'test-tenant', 'Tenant ID should be set');
  
  log('SDK configuration test passed');
}

// Test 3: Error Handling
async function testErrorHandling() {
  const { KYCError } = await import('./utils/KYCError.ts');
  
  // Test basic error creation
  const error = new KYCError('Test error message', new Error('Original error'), 'TEST_ERROR');
  assert(error.message === 'Test error message', 'Error message should be set');
  assert(error.code === 'TEST_ERROR', 'Error code should be set');
  
  // Test error types
  const validationError = KYCError.fromValidationError(['Field 1 is required']);
  assert(validationError.code === 'VALIDATION_ERROR', 'Validation error should have correct code');
  
  const authError = KYCError.fromAuthError(new Error('Auth failed'));
  assert(authError.code === 'AUTH_ERROR', 'Auth error should have correct code');
  
  log('Error handling test passed');
}

// Test 4: Validation
async function testValidation() {
  const { KYCValidator } = await import('./utils/KYCValidator.ts');
  
  const validator = new KYCValidator();
  
  // Test valid config
  const validConfig = {
    auth: { apiKey: 'valid-api-key-12345' },
    apiBaseUrl: 'http://localhost:3003'
  };
  
  validator.validateConfig(validConfig);
  
  // Test invalid config
  try {
    const invalidConfig = { apiBaseUrl: 'http://localhost:3003' };
    validator.validateConfig(invalidConfig);
    throw new Error('Invalid config should have failed validation');
  } catch (error) {
    assert(error.message.includes('Authentication configuration is required'), 'Should fail for missing auth');
  }
  
  // Test credentials validation
  const validCredentials = { apiKey: 'valid-api-key-12345' };
  validator.validateCredentials(validCredentials);
  
  try {
    const invalidCredentials = { apiKey: 'short' };
    validator.validateCredentials(invalidCredentials);
    throw new Error('Short API key should have failed validation');
  } catch (error) {
    assert(error.message.includes('too short'), 'Should fail for short API key');
  }
  
  log('Validation test passed');
}

// Test 5: File Validation
async function testFileValidation() {
  const { KYCValidator } = await import('./utils/KYCValidator.ts');
  
  const validator = new KYCValidator();
  
  // Test valid file
  const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  const validResult = validator.validateFile(validFile);
  assert(validResult.isValid, 'Valid file should pass validation');
  
  // Test invalid file type
  const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const invalidResult = validator.validateFile(invalidFile);
  assert(!invalidResult.isValid, 'Invalid file type should fail validation');
  assert(invalidResult.errors.length > 0, 'Should have validation errors');
  
  log('File validation test passed');
}

// Test 6: Storage (Mock)
async function testStorage() {
  const { KYCStorage } = await import('./utils/KYCStorage.ts');
  
  // Test with localStorage disabled
  const storage = new KYCStorage(false);
  
  const testData = { test: 'data', timestamp: Date.now() };
  storage.saveState(testData);
  
  const loadedData = storage.loadState();
  assert(loadedData === null, 'Should return null when localStorage is disabled');
  
  // Test clear
  storage.clearState();
  
  log('Storage test passed (localStorage disabled)');
}

// Test 7: State Management
async function testStateManagement() {
  const { KYCWebSDK } = await import('./KYCWebSDK.ts');
  
  const sdk = new KYCWebSDK({
    auth: { apiKey: 'test-api-key-12345' },
    apiBaseUrl: 'http://localhost:3003',
    enableLocalStorage: false
  });
  
  // Test initial state
  const initialState = sdk.getCurrentStep();
  assert(initialState === 'welcome', 'Initial step should be welcome');
  
  // Test data
  const initialData = sdk.getData();
  assert(initialData.idType === '', 'Initial ID type should be empty');
  assert(initialData.idFront === null, 'Initial front image should be null');
  
  // Test progress
  const progress = sdk.getProgress();
  assert(progress.currentStepIndex === 0, 'Initial step index should be 0');
  assert(progress.totalSteps === 9, 'Total steps should be 9');
  assert(!progress.canGoNext, 'Should not be able to go next initially');
  assert(!progress.canGoBack, 'Should not be able to go back initially');
  
  log('State management test passed');
}

// Test 8: Step Navigation
async function testStepNavigation() {
  const { KYCWebSDK } = await import('./KYCWebSDK.ts');
  
  const sdk = new KYCWebSDK({
    auth: { apiKey: 'test-api-key-12345' },
    apiBaseUrl: 'http://localhost:3003',
    enableLocalStorage: false
  });
  
  // Test step navigation
  sdk.goToStep('idTypeSelection');
  assert(sdk.getCurrentStep() === 'idTypeSelection', 'Should navigate to idTypeSelection');
  
  sdk.goToStep('idScanFront');
  assert(sdk.getCurrentStep() === 'idScanFront', 'Should navigate to idScanFront');
  
  // Test data update
  sdk.updateData({ idType: 'national_id' });
  const data = sdk.getData();
  assert(data.idType === 'national_id', 'Data should be updated');
  
  log('Step navigation test passed');
}

// Test 9: Data Validation
async function testDataValidation() {
  const { KYCValidator } = await import('./utils/KYCValidator.ts');
  
  const validator = new KYCValidator();
  
  // Test valid data
  const validData = {
    idType: 'national_id',
    idFront: new File([''], 'front.jpg'),
    idBack: new File([''], 'back.jpg'),
    selfie: new File([''], 'selfie.jpg'),
    ocrData: {
      fullName: 'John Doe',
      dateOfBirth: '1990-01-01',
      dateOfExpiry: '2025-12-31',
      gender: 'Male',
      idNumber: '123456789',
      issuingAuthority: 'Government of Ethiopia'
    }
  };
  
  const result = validator.validateStep('review', validData);
  assert(result.isValid, 'Valid data should pass validation');
  
  // Test invalid data
  const invalidData = { ...validData, idType: '' };
  const invalidResult = validator.validateStep('review', invalidData);
  assert(!invalidResult.isValid, 'Invalid data should fail validation');
  assert(invalidResult.errors.length > 0, 'Should have validation errors');
  
  log('Data validation test passed');
}

// Test 10: SDK Lifecycle
async function testSDKLifecycle() {
  const { KYCWebSDK } = await import('./KYCWebSDK.ts');
  
  const sdk = new KYCWebSDK({
    auth: { apiKey: 'test-api-key-12345' },
    apiBaseUrl: 'http://localhost:3003',
    enableLocalStorage: false
  });
  
  // Test reset
  sdk.updateData({ idType: 'national_id' });
  sdk.goToStep('idTypeSelection');
  
  sdk.reset();
  
  assert(sdk.getCurrentStep() === 'welcome', 'Reset should return to welcome step');
  assert(sdk.getData().idType === '', 'Reset should clear data');
  
  // Test destroy
  sdk.destroy();
  
  log('SDK lifecycle test passed');
}

// Main test runner
async function runAllTests() {
  console.log('Starting KYC SDK test suite...\n');
  
  const tests = [
    { name: 'Basic SDK Creation', fn: testBasicSDKCreation },
    { name: 'SDK Configuration', fn: testSDKConfiguration },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Validation', fn: testValidation },
    { name: 'File Validation', fn: testFileValidation },
    { name: 'Storage', fn: testStorage },
    { name: 'State Management', fn: testStateManagement },
    { name: 'Step Navigation', fn: testStepNavigation },
    { name: 'Data Validation', fn: testDataValidation },
    { name: 'SDK Lifecycle', fn: testSDKLifecycle }
  ];
  
  for (const test of tests) {
    await runTest(test.name, test.fn);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️ Skipped: ${testResults.skipped}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The KYC SDK is working correctly.');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
