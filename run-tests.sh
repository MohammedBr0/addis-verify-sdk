#!/bin/bash

# KYC SDK Test Runner
echo "🧪 KYC SDK Test Runner"
echo "======================"

# Check if we're in the right directory
if [ ! -f "index.ts" ]; then
    echo "❌ Error: Please run this script from the kyc-sdk directory"
    exit 1
fi

# Function to run tests
run_tests() {
    echo ""
    echo "🚀 Running KYC SDK Tests..."
    echo "============================"
    
    # Check if node-fetch is installed
    if ! node -e "require('node-fetch')" 2>/dev/null; then
        echo "📦 Installing test dependencies..."
        npm install --save-dev node-fetch@^2.6.7
    fi
    
    # Run simple tests (recommended for local testing)
    echo ""
    echo "🔧 Running Simple Tests..."
    node simple-test.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Node.js tests completed successfully!"
    else
        echo ""
        echo "❌ Node.js tests failed!"
        exit 1
    fi
}

# Function to start browser tests
start_browser_tests() {
    echo ""
    echo "🌐 Starting Browser Tests..."
    echo "============================"
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        echo "🐍 Starting Python HTTP server on port 8080..."
        echo "📱 Open http://localhost:8080/test-local.html in your browser"
        echo "⏹️  Press Ctrl+C to stop the server"
        
        python3 -m http.server 8080
    elif command -v python &> /dev/null; then
        echo "🐍 Starting Python HTTP server on port 8080..."
        echo "📱 Open http://localhost:8080/test-local.html in your browser"
        echo "⏹️  Press Ctrl+C to stop the server"
        
        python -m http.server 8080
    else
        echo "❌ Python not found. Please install Python to run browser tests."
        echo "💡 You can manually open test-local.html in your browser instead."
    fi
}

# Function to show help
show_help() {
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  test, t      Run Node.js tests (default)"
    echo "  browser, b   Start browser test server"
    echo "  all, a       Run all tests"
    echo "  help, h      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0           # Run Node.js tests"
    echo "  $0 browser   # Start browser test server"
    echo "  $0 all       # Run all tests"
}

# Main script logic
case "${1:-test}" in
    "test"|"t")
        run_tests
        ;;
    "browser"|"b")
        start_browser_tests
        ;;
    "all"|"a")
        run_tests
        echo ""
        echo "🌐 Starting browser tests..."
        start_browser_tests
        ;;
    "help"|"h"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_help
        exit 1
        ;;
esac
