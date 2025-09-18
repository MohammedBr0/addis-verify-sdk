# 🚀 KYC SDK Local Testing Guide

This guide shows you how to publish and test the KYC SDK locally for development and testing purposes.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

## 🔨 Method 1: Build and Test Locally (Recommended)

### Step 1: Build the SDK
```bash
# Navigate to SDK directory
cd src/lib/kyc-sdk

# Run the build script
./build-local.sh
```

This script will:
- Clean previous builds
- Install dependencies
- Build the SDK
- Create `dist/` directory with compiled files

### Step 2: Test the Built SDK
```bash
# Open the test project
open test-project/index.html
```

Or serve it with a local server:
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve test-project

# Using PHP
php -S localhost:8080 -t test-project
```

### Step 3: Test SDK Import
1. Open the test page in your browser
2. Click "Test SDK Import" to verify the SDK loads
3. Click "Test SDK Usage" to test SDK functionality

## 🔗 Method 2: NPM Link (For Development)

### Step 1: Create Global Link
```bash
cd src/lib/kyc-sdk
npm link
```

### Step 2: Link to Your Project
```bash
# In your main project directory
cd ../../../
npm link @local/kyc-sdk
```

### Step 3: Import and Use
```javascript
import { KYCWebSDK } from '@local/kyc-sdk';

const sdk = new KYCWebSDK({
  auth: {
    apiKey: 'your-api-key',
    tenantId: 'your-tenant',
    userId: 'your-user'
  },
  apiBaseUrl: 'http://localhost:3003'
});
```

## 📁 Method 3: Direct Import (Simplest)

### Step 1: Build the SDK
```bash
cd src/lib/kyc-sdk
npm run build
```

### Step 2: Import Directly
```javascript
// In your HTML or JavaScript
import { KYCWebSDK } from './src/lib/kyc-sdk/dist/index.js';

// Or in HTML
<script type="module">
  import { KYCWebSDK } from './src/lib/kyc-sdk/dist/index.js';
</script>
```

## 🧪 Testing the SDK

### Basic Usage Test
```javascript
const config = {
  auth: {
    apiKey: 'sk_92rh4yzyzn70cfmff8jht823294yq1102tgkyg9c87qn87bef7df8bda74113b3a8a13200c849dbteam0574ck4u7h58bc4431',
    tenantId: 'test-tenant',
    userId: 'test-user-123'
  },
  apiBaseUrl: 'http://localhost:3003',
  enableAutoOCR: true,
  enableFaceVerification: true,
  debug: true
};

const sdk = new KYCWebSDK(config);

// Test initialization
await sdk.initialize();

// Test state management
const state = sdk.getState();
console.log('SDK State:', state);
```

### React Integration Test
```jsx
import { KYCProvider, KYCWidget, useKYCSDK } from './src/lib/kyc-sdk/dist/index.js';

function App() {
  return (
    <KYCProvider config={config}>
      <KYCWidget 
        onComplete={(result) => console.log('KYC completed:', result)}
        onError={(error) => console.error('KYC error:', error)}
      />
    </KYCProvider>
  );
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to fetch" error**
   - Make sure you've built the SDK first (`npm run build`)
   - Check that `dist/` directory exists and contains files

2. **"Module not found" error**
   - Verify the import path is correct
   - Ensure the SDK is built and `dist/index.js` exists

3. **"Cannot use import statement outside a module"**
   - Add `type="module"` to your script tag
   - Use a local server instead of opening HTML directly

4. **Build errors**
   - Check Node.js version (should be 16+)
   - Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Debug Steps

1. **Check build output**
   ```bash
   cd src/lib/kyc-sdk
   ls -la dist/
   ```

2. **Verify package.json**
   ```bash
   cat package.json | grep -E "(name|version|main|module)"
   ```

3. **Test import in console**
   ```javascript
   // In browser console
   import('./dist/index.js').then(module => console.log(module));
   ```

## 📊 File Structure After Build

```
src/lib/kyc-sdk/
├── dist/
│   ├── index.js          # CommonJS bundle
│   ├── index.esm.js      # ES Module bundle
│   ├── index.d.ts        # TypeScript definitions
│   └── index.js.map      # Source maps
├── test-project/
│   └── index.html        # Test page
├── build-local.sh        # Build script
├── package.json          # Package configuration
└── rollup.config.js      # Build configuration
```

## 🎯 Next Steps

1. **Test basic functionality** using the test project
2. **Integrate with your app** using one of the import methods
3. **Customize configuration** for your use case
4. **Add error handling** and validation
5. **Test with real API endpoints**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Check the browser console for error messages
4. Ensure the SDK is properly built

---

**Happy Testing! 🚀**
