#!/usr/bin/env node

// Simple test script for KYC SDK
// This tests basic file existence and structure without complex imports

console.log('🧪 KYC SDK Simple Test');
console.log('========================\n');

const fs = require('fs');
const path = require('path');

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

// Test 1: File Structure
async function testFileStructure() {
  const requiredFiles = [
    'KYCWebSDK.ts',
    'index.ts',
    'tsconfig.json',
    'package.json',
    'README.md',
    'types/KYCConfig.ts',
    'types/KYCTypes.ts',
    'services/KYCAPI.ts',
    'services/KYCStateManager.ts',
    'utils/KYCError.ts',
    'utils/KYCValidator.ts',
    'utils/KYCStorage.ts',
    'components/KYCProvider.tsx',
    'components/KYCWidget.tsx',
    'hooks/useKYCSDK.ts',
    'examples/basic-usage.ts',
    'examples/react-integration.tsx'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file missing: ${file}`);
    }
    log(`✓ Found: ${file}`);
  }
  
  log('All required files exist');
}

// Test 2: TypeScript Compilation
async function testTypeScriptCompilation() {
  const { execSync } = require('child_process');
  
  try {
    // Check if TypeScript compiles without errors
    execSync('npx tsc --noEmit', { 
      cwd: __dirname, 
      stdio: 'pipe' 
    });
    log('TypeScript compilation check passed');
  } catch (error) {
    throw new Error(`TypeScript compilation failed: ${error.message}`);
  }
}

// Test 3: Package Configuration
async function testPackageConfiguration() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Check required fields
  assert(packageData.name, 'Package name is required');
  assert(packageData.version, 'Package version is required');
  assert(packageData.description, 'Package description is required');
  
  // Check scripts
  assert(packageData.scripts, 'Scripts section is required');
  assert(packageData.scripts.build, 'Build script is required');
  
  log('Package configuration is valid');
}

// Test 4: TypeScript Configuration
async function testTypeScriptConfiguration() {
  const tsConfigPath = path.join(__dirname, 'tsconfig.json');
  const tsConfigData = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  // Check required fields
  assert(tsConfigData.compilerOptions, 'Compiler options are required');
  assert(tsConfigData.include, 'Include patterns are required');
  assert(tsConfigData.exclude, 'Exclude patterns are required');
  
  log('TypeScript configuration is valid');
}

// Test 5: Export Structure
async function testExportStructure() {
  const indexPath = path.join(__dirname, 'index.ts');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for key exports
  const requiredExports = [
    'KYCWebSDK',
    'KYCError',
    'KYCValidator',
    'KYCStorage',
    'useKYCSDK',
    'KYCProvider',
    'KYCWidget'
  ];
  
  for (const exportName of requiredExports) {
    if (!indexContent.includes(`export { ${exportName}`) && 
        !indexContent.includes(`export type { ${exportName}`)) {
      throw new Error(`Required export missing: ${exportName}`);
    }
    log(`✓ Found export: ${exportName}`);
  }
  
  log('All required exports are present');
}

// Test 6: Documentation
async function testDocumentation() {
  const readmePath = path.join(__dirname, 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Check for key sections
  const requiredSections = [
    '# KYC Web SDK',
    '## Installation',
    '## Usage',
    '## API Reference',
    '## Examples'
  ];
  
  for (const section of requiredSections) {
    if (!readmeContent.includes(section)) {
      throw new Error(`Required documentation section missing: ${section}`);
    }
    log(`✓ Found section: ${section}`);
  }
  
  log('Documentation is complete');
}

// Test 7: Examples
async function testExamples() {
  const examplesDir = path.join(__dirname, 'examples');
  const examples = fs.readdirSync(examplesDir);
  
  // Check for required example files
  const requiredExamples = ['basic-usage.ts', 'react-integration.tsx'];
  
  for (const example of requiredExamples) {
    if (!examples.includes(example)) {
      throw new Error(`Required example missing: ${example}`);
    }
    log(`✓ Found example: ${example}`);
  }
  
  log('All examples are present');
}

// Main test runner
async function runAllTests() {
  console.log('Starting KYC SDK simple test suite...\n');
  
  const tests = [
    { name: 'File Structure', fn: testFileStructure },
    { name: 'TypeScript Compilation', fn: testTypeScriptCompilation },
    { name: 'Package Configuration', fn: testPackageConfiguration },
    { name: 'TypeScript Configuration', fn: testTypeScriptConfiguration },
    { name: 'Export Structure', fn: testExportStructure },
    { name: 'Documentation', fn: testDocumentation },
    { name: 'Examples', fn: testExamples }
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
    console.log('\n🎉 All tests passed! The KYC SDK structure is correct.');
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
