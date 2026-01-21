#!/bin/bash

# Quick Start Script for Defect Analyzer with Local Server
# This script sets up and runs both frontend and backend servers

echo "=========================================="
echo "Defect Analyzer - Local Server Setup"
echo "=========================================="
echo ""

# Check if LOVABLE_API_KEY is set
if [ -z "$LOVABLE_API_KEY" ]; then
    echo "WARNING: LOVABLE_API_KEY environment variable is not set"
    echo "Please set it before running:"
    echo "  export LOVABLE_API_KEY='your_api_key_here'"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo ""
fi

# Install server dependencies if server/node_modules doesn't exist
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server
    npm install
    cd ..
    echo ""
fi

# Check if concurrently is installed
if ! npm list concurrently > /dev/null 2>&1; then
    echo "Installing concurrently for running both servers..."
    npm install --save-dev concurrently
    echo ""
fi

echo "=========================================="
echo "Starting Defect Analyzer"
echo "=========================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="
echo ""

# Run both servers
npx concurrently "npm run dev" "cd server && npm start"
