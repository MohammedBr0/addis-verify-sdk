#!/bin/bash

echo "🔨 Building KYC SDK for local testing..."

# Navigate to SDK directory
cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the SDK
echo "🔨 Building SDK..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build files created in dist/ directory"
    echo ""
    echo "🚀 To use locally:"
    echo "1. npm link                    # Create global link"
    echo "2. cd ../../../               # Go to your project root"
    echo "3. npm link @local/kyc-sdk   # Link to your project"
    echo ""
    echo "📋 Or use directly:"
    echo "import { KYCWebSDK } from './src/lib/kyc-sdk/dist/index.js'"
else
    echo "❌ Build failed!"
    exit 1
fi
