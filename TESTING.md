# 🧪 KYC SDK Testing Guide

This guide explains how to test the KYC SDK locally to ensure everything is working correctly.

## 🚀 Quick Start

### Option 1: Use the Test Runner Script (Recommended)

```bash
# Make sure you're in the kyc-sdk directory
cd src/lib/kyc-sdk

# Run Node.js tests
./run-tests.sh

# Run browser tests
./run-tests.sh browser

# Run all tests
./run-tests.sh all

# Show help
./run-tests.sh help
```

### Option 2: Manual Testing

```bash
# Install test dependencies
npm install --save-dev node-fetch@^2.6.7

# Run Node.js tests
node test-node.js

# Start browser test server
python3 -m http.server 8080
# Then open http://localhost:8080/test-local.html in your browser
```

## 📋 Test Coverage

### 🔧 Node.js Tests (`test-node.js`)

These tests run in Node.js and test the core SDK functionality:

1. **Basic SDK Creation** - Tests SDK instantiation
2. **SDK Configuration** - Tests configuration handling
3. **Error Handling** - Tests error creation and types
4. **Validation** - Tests configuration and credentials validation
5. **File Validation** - Tests file type and size validation
6. **Storage** - Tests local storage functionality (mocked)
7. **State Management** - Tests SDK state management
8. **Step Navigation** - Tests step navigation and data updates
9. **Data Validation** - Tests KYC data validation
10. **SDK Lifecycle** - Tests reset and destroy functionality

### 🌐 Browser Tests (`test-local.html`)

These tests run in the browser and test the complete user experience:

1. **Basic SDK Test** - Tests SDK initialization and basic methods
2. **API Service Test** - Tests API service functionality
3. **State Management Test** - Tests state management and progress tracking
4. **Validation Test** - Tests validation utilities
5. **Storage Test** - Tests local storage functionality
6. **Complete Flow Test** - Tests the entire KYC verification flow

## 🛠️ Test Setup

### Prerequisites

- Node.js (v14 or higher)
- Python 3 (for browser tests)
- Modern web browser (for browser tests)

### Dependencies

The test dependencies are minimal:

```json
{
  "devDependencies": {
    "node-fetch": "^2.6.7"
  }
}
```

### Browser API Mocking

For Node.js tests, we mock browser APIs:

- `fetch` - Using node-fetch
- `File` - Custom File class implementation
- `FormData` - Custom FormData class implementation
- `localStorage` - Mocked for testing

## 🧪 Running Specific Tests

### Node.js Tests

```bash
# Run all tests
node test-node.js

# Run specific test (modify test-node.js to add this functionality)
# Currently runs all tests sequentially
```

### Browser Tests

1. Open `test-local.html` in your browser
2. Click the test buttons in order
3. Check the console for detailed logs
4. Review the test results in each section

## 📊 Test Results

### Node.js Test Output

```
🧪 KYC SDK Node.js Test Suite
================================

🧪 Running: Basic SDK Creation
──────────────────────────────────────────────────────────────────
✅ [10:30:15] SDK instance created successfully
✅ [10:30:15] Basic SDK Creation PASSED

🧪 Running: SDK Configuration
──────────────────────────────────────────────────────────────────
✅ [10:30:15] SDK configuration test passed
✅ [10:30:15] SDK Configuration PASSED

...

==================================================
📊 TEST SUMMARY
==================================================
✅ Passed: 10
❌ Failed: 0
⚠️ Skipped: 0
📈 Success Rate: 100.0%

🎉 All tests passed! The KYC SDK is working correctly.
```

### Browser Test Output

The browser tests show results in real-time with color-coded logs:

- 🟢 **Green** - Success messages
- 🔴 **Red** - Error messages
- 🔵 **Blue** - Information messages

## 🔍 Debugging Tests

### Common Issues

1. **Module not found errors**
   - Ensure you're in the correct directory
   - Check that all files exist
   - Verify TypeScript compilation

2. **Import/export errors**
   - Check the `index.ts` file for correct exports
   - Verify file paths in imports

3. **TypeScript errors**
   - Run `npx tsc --noEmit` to check for type errors
   - Fix any compilation issues before testing

### Debug Mode

Enable debug mode in the SDK:

```typescript
const sdk = new KYCWebSDK({
  // ... other config
  debug: true
});
```

This will log additional information to the console.

## 🧹 Test Cleanup

### Node.js Tests

Node.js tests automatically clean up after themselves. No manual cleanup is required.

### Browser Tests

Browser tests use localStorage. To clean up:

1. Click the "Reset Test" button in the Complete Flow Test section
2. Or manually clear localStorage in browser dev tools
3. Or close the browser tab

## 📝 Adding New Tests

### Node.js Tests

1. Add a new test function in `test-node.js`
2. Add it to the `tests` array in `runAllTests()`
3. Follow the existing test pattern

```javascript
async function testNewFeature() {
  // Test implementation
  assert(condition, 'Assertion message');
  log('Test passed');
}

// Add to tests array
const tests = [
  // ... existing tests
  { name: 'New Feature', fn: testNewFeature }
];
```

### Browser Tests

1. Add a new test button in `test-local.html`
2. Add the corresponding test function
3. Add a log section for the test results

```html
<button class="test-button" onclick="testNewFeature()">Test New Feature</button>
<div id="new-feature-log" class="log"></div>

<script>
window.testNewFeature = function() {
  // Test implementation
  log('Test passed', 'success', 'new-feature-log');
};
</script>
```

## 🚨 Troubleshooting

### Test Failures

1. **Check the error message** - It usually indicates what went wrong
2. **Verify dependencies** - Ensure node-fetch is installed
3. **Check file paths** - Ensure all import paths are correct
4. **Review console output** - Look for additional error details

### Browser Issues

1. **CORS errors** - Use a local HTTP server (Python, Node.js, etc.)
2. **Module loading errors** - Check browser console for details
3. **File not found** - Ensure test-local.html is in the correct location

### Performance Issues

1. **Slow tests** - Some tests simulate delays for realistic flow testing
2. **Memory leaks** - Tests automatically clean up, but you can manually reset
3. **Large logs** - Clear logs periodically using the reset button

## 📚 Additional Resources

- **SDK Documentation** - See `README.md` for usage examples
- **Type Definitions** - Check `types/` directory for detailed interfaces
- **Examples** - See `examples/` directory for integration examples
- **Source Code** - Review individual files for implementation details

## 🤝 Contributing

When adding new features to the SDK:

1. **Add tests first** - Write tests before implementing features
2. **Test edge cases** - Include tests for error conditions
3. **Update this guide** - Document any new testing procedures
4. **Maintain coverage** - Ensure all new code is tested

---

Happy testing! 🎉
