# AddisVerify KYC SDK

A comprehensive JavaScript/TypeScript SDK for integrating KYC (Know Your Customer) verification flows into web applications. This SDK provides a complete solution for identity verification with API key authentication, document processing, face verification, and more.

## 🚀 Features

- 🔐 **API Key Authentication** - Secure authentication using API keys
- 📱 **Mobile-First Design** - Optimized for mobile camera capture
- 🔄 **Multi-Step Flow** - Complete verification process with progress tracking
- 📊 **OCR Integration** - Automatic document data extraction
- 👤 **Face Verification** - Selfie capture and face matching
- 💾 **State Management** - Persistent state with localStorage support
- 🎨 **Customizable UI** - Flexible styling and theming options
- ⚡ **React Integration** - Built-in React hooks and components
- 🔧 **TypeScript Support** - Full TypeScript definitions
- 🛡️ **Error Handling** - Comprehensive error management
- 🌐 **Cross-Platform** - Works in browsers and Node.js environments

## 📦 Installation

```bash
npm install @addis-verify/kyc-sdk
# or
yarn add @addis-verify/kyc-sdk
# or
pnpm add @addis-verify/kyc-sdk
```

## 🔧 Quick Start

### Basic Usage

```typescript
import { KYCWebSDK } from '@addis-verify/kyc-sdk';

const kycSDK = new KYCWebSDK({
  auth: {
    apiKey: 'your-api-key-here',
    tenantId: 'your-tenant-id',
    userId: 'user-id'
  },
  apiBaseUrl: 'https://api.addisverify.com',
  enableAutoOCR: true,
  enableFaceVerification: true
});

// Initialize the SDK
await kycSDK.initialize();

// Start verification
await kycSDK.startVerification();
```

### React Integration

```tsx
import React from 'react';
import { KYCProvider, KYCWidget } from '@addis-verify/kyc-sdk';

function App() {
  const config = {
    auth: {
      apiKey: 'your-api-key',
      tenantId: 'your-tenant',
      userId: 'user-123'
    },
    apiBaseUrl: 'https://api.addisverify.com',
    enableAutoOCR: true,
    enableFaceVerification: true
  };

  return (
    <KYCProvider config={config}>
      <div className="app">
        <h1>Identity Verification</h1>
        <KYCWidget 
          onComplete={(result) => {
            console.log('Verification completed:', result);
          }}
          onError={(error) => {
            console.error('Verification failed:', error);
          }}
        />
      </div>
    </KYCProvider>
  );
}

export default App;
```

### Using React Hook

```tsx
import React from 'react';
import { useKYCSDK } from '@addis-verify/kyc-sdk';

function VerificationComponent() {
  const {
    isInitialized,
    isLoading,
    error,
    currentStep,
    verificationData,
    startVerification,
    captureDocument,
    captureSelfie,
    submitVerification
  } = useKYCSDK({
    auth: {
      apiKey: 'your-api-key',
      tenantId: 'your-tenant',
      userId: 'user-123'
    },
    apiBaseUrl: 'https://api.addisverify.com'
  });

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  return (
    <div>
      <h2>Step {currentStep}</h2>
      {isLoading && <div>Processing...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <button onClick={startVerification}>
        Start Verification
      </button>
    </div>
  );
}
```

## 🔑 Configuration

### KYCConfig Options

```typescript
interface KYCConfig {
  // Authentication (required)
  auth: {
    apiKey: string;      // Your API key
    tenantId: string;    // Your tenant ID
    userId: string;      // User identifier
  };

  // API Configuration
  apiBaseUrl: string;    // Base URL for API calls
  apiTimeout?: number;   // Request timeout (default: 30000ms)

  // Feature Flags
  enableAutoOCR?: boolean;        // Enable automatic OCR (default: true)
  enableFaceVerification?: boolean; // Enable face matching (default: true)
  enableLivenessCheck?: boolean;   // Enable liveness detection (default: false)

  // UI Configuration
  theme?: 'light' | 'dark' | 'auto';  // UI theme
  language?: string;                   // Language code (default: 'en')
  customStyles?: CSSProperties;        // Custom CSS styles

  // Behavior
  autoStart?: boolean;           // Auto-start verification (default: false)
  allowRetry?: boolean;          // Allow retry on failure (default: true)
  maxRetries?: number;           // Maximum retry attempts (default: 3)
  
  // Storage
  persistState?: boolean;        // Persist state in localStorage (default: true)
  storageKey?: string;          // Custom storage key

  // Debug
  debug?: boolean;              // Enable debug logging (default: false)
}
```

### Event Callbacks

```typescript
const sdk = new KYCWebSDK({
  // ... config
  onInitialized: () => {
    console.log('SDK initialized');
  },
  onStepChange: (step: string) => {
    console.log('Current step:', step);
  },
  onProgress: (progress: number) => {
    console.log('Progress:', progress + '%');
  },
  onComplete: (result: VerificationResult) => {
    console.log('Verification completed:', result);
  },
  onError: (error: KYCError) => {
    console.error('Error:', error);
  }
});
```

## 📚 API Reference

### KYCWebSDK Class

#### Methods

- `initialize()` - Initialize the SDK
- `startVerification(idType?: string)` - Start verification process
- `captureDocument(side: 'front' | 'back')` - Capture document image
- `captureSelfie()` - Capture selfie image
- `submitVerification()` - Submit verification for processing
- `getVerificationStatus(sessionId: string)` - Get verification status
- `reset()` - Reset SDK state
- `destroy()` - Clean up SDK resources

#### Properties

- `isInitialized: boolean` - SDK initialization status
- `currentStep: string` - Current verification step
- `verificationData: VerificationData` - Current verification data
- `config: KYCConfig` - SDK configuration

### React Components

#### KYCProvider

Provides KYC context to child components.

```tsx
<KYCProvider config={kycConfig}>
  {/* Your app components */}
</KYCProvider>
```

#### KYCWidget

Complete verification widget component.

```tsx
<KYCWidget
  onComplete={(result) => {}}
  onError={(error) => {}}
  className="custom-widget"
/>
```

### React Hook

#### useKYCSDK

Hook for accessing KYC functionality in React components.

```tsx
const {
  isInitialized,
  isLoading,
  error,
  currentStep,
  verificationData,
  startVerification,
  captureDocument,
  captureSelfie,
  submitVerification
} = useKYCSDK(config);
```

## 🧪 Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/addis-verify-sdk.git
cd addis-verify-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Start development server
npm run dev

# Run tests
npm test
```

### Docker Development

```bash
# Start SDK development server
docker-compose up -d sdk-dev

# Start build watcher
docker-compose --profile build up -d sdk-build
```

The SDK will be available at `http://localhost:3004` with:
- Test page: `http://localhost:3004/test-project/`
- Examples: `http://localhost:3004/examples/`

### Testing

```bash
# Run Node.js tests
npm test

# Test in browser
npm run test:browser

# Build and test locally
./build-local.sh
```

## 📖 Examples

Check the `examples/` directory for complete implementation examples:

- `basic-usage.ts` - Basic SDK usage
- `react-integration.tsx` - React component integration
- `node-integration.js` - Node.js server-side usage
- `real-integration.html` - Complete HTML integration

## 🔧 Build Configuration

The SDK uses Rollup for building with the following outputs:

- `dist/index.js` - CommonJS build
- `dist/index.esm.js` - ES modules build
- `dist/index.d.ts` - TypeScript definitions

### Custom Build

```bash
# Clean build
npm run clean

# Build only
npm run build

# Build with watch
npm run build:watch
```

## 🚀 Deployment

### NPM Package

```bash
# Prepare for publishing
npm run prepublishOnly

# Publish to NPM
npm publish

# Publish as beta
npm publish --tag beta
```

### CDN Usage

```html
<!-- ES Modules -->
<script type="module">
  import { KYCWebSDK } from 'https://unpkg.com/@addis-verify/kyc-sdk@latest/dist/index.esm.js';
</script>

<!-- UMD (Universal Module Definition) -->
<script src="https://unpkg.com/@addis-verify/kyc-sdk@latest/dist/index.js"></script>
<script>
  const sdk = new window.KYCWebSDK(config);
</script>
```

## 🛠️ Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers with camera support

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

- 📧 Email: support@addisverify.com
- 📖 Documentation: https://docs.addisverify.com
- 🐛 Issues: https://github.com/your-org/addis-verify-sdk/issues
- 💬 Discord: https://discord.gg/addisverify

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Built with ❤️ by the AddisVerify Team**