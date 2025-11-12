#!/bin/bash

# HetChat Installation Script
# This script installs all dependencies for the HetChat application

echo "🚀 Installing HetChat..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..
echo ""

echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Set up environment variables (see SETUP_ENV.md)"
echo "   2. Deploy Firestore rules: firebase deploy --only firestore:rules"
echo "   3. Run the app:"
echo ""
echo "      Terminal 1: cd server && npm run dev"
echo "      Terminal 2: cd client && npm run dev"
echo ""
echo "   4. Open http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see QUICKSTART.md"
echo ""

