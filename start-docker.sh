#!/bin/bash
# ============================================
# VoltX Docker Quick Start Script
# ============================================

echo "🚀 Starting VoltX Application with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed!"
    echo "Please install docker-compose and try again."
    exit 1
fi

echo "✅ docker-compose is installed"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Building and starting all services..."
echo "This may take 3-5 minutes on first run..."
echo ""

# Start services
docker-compose up --build

# Note: The script will keep running and show logs
# Press Ctrl+C to stop all services
