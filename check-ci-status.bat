@echo off
REM ============================================
REM VoltX CI/CD Status Checker (Windows)
REM ============================================

echo.
echo 🔍 VoltX CI/CD Status Checker
echo ==============================
echo.

REM Check if GitHub CLI is installed
gh --version >nul 2>&1
if errorlevel 1 (
    echo ❌ GitHub CLI is not installed
    echo.
    echo Install it: winget install GitHub.cli
    echo Or download from: https://cli.github.com
    echo.
    pause
    exit /b 1
)

REM Check if authenticated
gh auth status >nul 2>&1
if errorlevel 1 (
    echo ❌ Not authenticated with GitHub
    echo.
    echo Run: gh auth login
    echo.
    pause
    exit /b 1
)

echo ✅ GitHub CLI ready
echo.

echo 📊 Recent Workflow Runs:
echo ------------------------
gh run list --limit 10

echo.
echo 💡 Quick Commands:
echo ------------------
echo   gh run list              # List all runs
echo   gh run view [ID]         # View specific run
echo   gh run watch             # Watch current run
echo   gh run rerun [ID]        # Rerun failed run
echo   gh workflow list         # List all workflows
echo   gh workflow run [NAME]   # Manually trigger workflow

echo.
echo 🌐 Opening GitHub Actions in browser...
gh repo view --web

pause
