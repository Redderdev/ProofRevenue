#!/bin/bash
# ProofRevenue Development Setup Script
# Run this script to set up the project for development

set -e

echo "🚀 ProofRevenue Development Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Update .env.local with your Stripe keys and database URL"
fi

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo ""
    echo "✅ PostgreSQL detected"
    
    # Try to create database
    if createdb proofrevenue_dev 2>/dev/null; then
        echo "📊 Database 'proofrevenue_dev' created"
    else
        echo "ℹ️  Database 'proofrevenue_dev' already exists (skipped)"
    fi
    
    # Run database setup
    if npm run db:setup 2>/dev/null; then
        echo "📊 Database schema initialized"
    fi
else
    echo "⚠️  PostgreSQL not found in PATH. Please set up your database manually:"
    echo "   createdb proofrevenue_dev"
    echo "   Then run: npm run db:setup"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Update .env.local with your Stripe keys"
echo "   2. Start dev server: npm run dev"
echo "   3. Open http://localhost:3000"
echo "   4. Use Tweaks Panel (⚙ bottom-left) to test states"
echo ""
