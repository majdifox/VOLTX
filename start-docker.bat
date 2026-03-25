@echo off
REM ============================================
REM VoltX Docker Quick Start Script (Windows)
REM ============================================

echo.
echo 🚀 Starting VoltX Application with Docker...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: docker-compose is not installed!
    echo Please install docker-compose and try again.
    pause
    exit /b 1
)

echo ✅ docker-compose is installed
echo.

echo 📦 Building and starting all services...
echo This may take 3-5 minutes on first run...
echo.
echo ⏳ Please wait...
echo.

REM Start services
docker-compose up --build

REM Note: The script will keep running and show logs
REM Press Ctrl+C to stop all services
