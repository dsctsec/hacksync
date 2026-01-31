#!/bin/bash

# Twilio Sales Agent Quick Start Script

echo "🚀 Starting Twilio Sales Conversational Agent..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please update the .env file with your Twilio credentials:"
    echo "   - TWILIO_ACCOUNT_SID"
    echo "   - TWILIO_AUTH_TOKEN"
    echo "   - TWILIO_PHONE_NUMBER"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build
echo ""

# Start the server
echo "✅ Starting the server..."
npm run dev
